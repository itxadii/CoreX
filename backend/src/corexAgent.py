import json
import boto3
import os
import uuid
import datetime
import base64
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr

# --- Configuration ---
AGENT_ID = os.environ.get('BEDROCK_AGENT_ID')
AGENT_ALIAS_ID = os.environ.get('BEDROCK_AGENT_ALIAS_ID')
TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME')

# --- CLIENT CONFIGURATION (CRITICAL FIX) ---

# 1. For File Uploads (Direct Model Access)
# We keep this as us-east-1 to use the 'us.amazon.nova-lite-v1:0' Inference Profile
bedrock_runtime = boto3.client('bedrock-runtime', region_name="us-east-1")

# 2. For Agent Interaction (Search Tool)
# CHANGED: Set to 'ap-south-1' because your Agent resource lives in Mumbai
agent_client = boto3.client('bedrock-agent-runtime', region_name="ap-south-1") 

# 3. Database
dynamodb = boto3.resource('dynamodb', region_name="ap-south-1")

ALLOWED_ORIGINS = {
    'http://localhost:5173',
    'https://main.d3h4csxsp92hux.amplifyapp.com',
    'https://dev.d3h4csxsp92hux.amplifyapp.com'
}

# --- Helper Functions ---
def get_header(headers, key):
    if not headers: return None
    key_lower = key.lower()
    for k, v in headers.items():
        if k.lower() == key_lower: return v
    return None

def get_cors_headers(request_origin):
    if request_origin in ALLOWED_ORIGINS:
        return {
            'Access-Control-Allow-Origin': request_origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    return {
        'Access-Control-Allow-Origin': 'https://main.d3h4csxsp92hux.amplifyapp.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

def get_user_id(event):
    try:
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            claims = event['requestContext']['authorizer'].get('claims', {})
            return claims.get('sub')
    except Exception:
        return None
    return None

def get_recent_history_as_text(user_id, session_id, limit=6):
    """Fetches history manually from DynamoDB to inject context"""
    try:
        table = dynamodb.Table(TABLE_NAME)
        response = table.query(
            KeyConditionExpression=Key('UserId').eq(user_id),
            FilterExpression=Attr('SessionId').eq(session_id),
            ScanIndexForward=False 
        )
        items = response.get('Items', [])
        recent_items = items[:limit]
        recent_items.reverse()
        
        history_text = ""
        for item in recent_items:
            u_msg = item.get('UserMessage', '')
            a_msg = item.get('AgentResponse', '')
            if u_msg: history_text += f"User: {u_msg}\n"
            if a_msg: history_text += f"Assistant: {a_msg}\n"
        return history_text
    except Exception as e:
        print(f"Error fetching context: {e}")
        return ""

# --- CORE HANDLER ---
def handler(event, context):
    headers = event.get('headers', {}) or {}
    request_origin = get_header(headers, 'origin')
    cors_headers = get_cors_headers(request_origin)

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    user_id = get_user_id(event)
    method = event.get('httpMethod')

    # --- GET: Fetch History ---
    if method == 'GET':
        if not user_id: return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': 'Unauthorized'})}
        try:
            table = dynamodb.Table(TABLE_NAME)
            response = table.query(KeyConditionExpression=Key('UserId').eq(user_id), ScanIndexForward=True)
            return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'history': response.get('Items', [])})}
        except Exception as e:
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': str(e)})}

    # --- POST: Chat Logic ---
    elif method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            user_prompt = body.get('prompt', '')
            session_id = body.get('sessionId')
            # If frontend sends null sessionId (Temp Chat), generate one for the request scope
            if not session_id:
                session_id = str(uuid.uuid4())
                
            is_temporary = body.get('isTemporary', False)
            file_obj = body.get('file', None)

            if not user_prompt and not file_obj:
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'No input provided'})}

            ai_response = ""

            # --- HYBRID ROUTING ---

            # PATH A: FILE UPLOAD -> Direct Bedrock Runtime (Bypass Agent)
            # Agents in ap-south-1 might struggle with multimodal inputs, so we use US Inference Profile
            if file_obj:
                print(f"Handling File via Converse API (us-east-1) | Session {session_id}")
                
                # Inject history manually
                history_text = ""
                if user_id and not is_temporary:
                    history_text = get_recent_history_as_text(user_id, session_id)
                
                full_prompt = f"History:\n{history_text}\n\nUser: {user_prompt}" if history_text else user_prompt
                
                message_content = []
                
                try:
                    file_bytes = base64.b64decode(file_obj['data'])
                    # Format File
                    if file_obj['type'] == 'application/pdf':
                        message_content.append({"document": {"name": "doc", "format": "pdf", "source": {"bytes": file_bytes}}})
                    elif file_obj['type'].startswith('image/'):
                        fmt = file_obj['type'].split('/')[-1].replace('jpg', 'jpeg')
                        message_content.append({"image": {"format": fmt, "source": {"bytes": file_bytes}}})
                    
                    if full_prompt: message_content.append({"text": full_prompt})

                    # Invoke Nova Lite via US Endpoint
                    response = bedrock_runtime.converse(
                        modelId="us.amazon.nova-lite-v1:0",
                        messages=[{"role": "user", "content": message_content}],
                        inferenceConfig={"maxTokens": 1000, "temperature": 0.7}
                    )
                    ai_response = response['output']['message']['content'][0]['text']
                except Exception as e:
                    print(f"File Error: {e}")
                    return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Error processing file'})}

            # PATH B: TEXT ONLY -> Invoke Agent (ap-south-1)
            else:
                print(f"Handling Text via Agent {AGENT_ID} (ap-south-1) | Session {session_id}")
                
                # Optional: Context Injection (Agent handles memory, but injection helps continuity)
                history_text = ""
                if user_id and not is_temporary:
                     history_text = get_recent_history_as_text(user_id, session_id)
                
                agent_input = f"Context:\n{history_text}\n\nUser Request: {user_prompt}" if history_text else user_prompt

                response = agent_client.invoke_agent(
                    agentId=AGENT_ID,
                    agentAliasId=AGENT_ALIAS_ID,
                    sessionId=session_id,
                    inputText=agent_input,
                    enableTrace=False
                )

                # Parse Stream
                completion = ""
                for event_stream in response.get('completion'):
                    chunk = event_stream.get('chunk')
                    if chunk:
                        completion += chunk.get('bytes').decode('utf-8')
                
                ai_response = completion

            # --- SAVE TO DYNAMODB (Skip if Temporary) ---
            if user_id and not is_temporary:
                try:
                    table = dynamodb.Table(TABLE_NAME)
                    user_msg_stored = f"[File: {file_obj['name']}] {user_prompt}" if file_obj else user_prompt
                    
                    table.put_item(Item={
                        'UserId': user_id,
                        'Timestamp': datetime.datetime.utcnow().isoformat(),
                        'SessionId': session_id,
                        'UserMessage': user_msg_stored,
                        'AgentResponse': ai_response
                    })
                except Exception as e:
                    print(f"DB Save Error: {e}")

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'response': ai_response, 'sessionId': None if is_temporary else session_id})
            }

        except Exception as e:
            print(f"Error: {e}")
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': str(e)})}
            
    return {'statusCode': 405, 'headers': cors_headers, 'body': ''}