import json
import boto3
import os
import uuid
import datetime
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

# --- Clients ---
agent_client = boto3.client('bedrock-agent-runtime', region_name="ap-south-1")
dynamodb = boto3.resource('dynamodb', region_name="ap-south-1")

# --- Configuration ---
AGENT_ID = os.environ.get('BEDROCK_AGENT_ID')
AGENT_ALIAS_ID = os.environ.get('BEDROCK_AGENT_ALIAS_ID')
TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME') 

# --- Whitelisted Origins ---
ALLOWED_ORIGINS = {
    'http://localhost:5173',
    'https://main.d3h4csxsp92hux.amplifyapp.com',
    'https://dev.d3h4csxsp92hux.amplifyapp.com'
}

# --- Helper Functions ---
def get_header(headers, key):
    if not headers: return None
    if key in headers: return headers[key]
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
    """Extracts Cognito Sub (User ID) from the request context"""
    try:
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            claims = event['requestContext']['authorizer'].get('claims', {})
            return claims.get('sub')
    except Exception:
        return None
    return None

# --- Main Handler ---
def handler(event, context):
    headers = event.get('headers', {}) or {}
    request_origin = get_header(headers, 'origin')
    cors_headers = get_cors_headers(request_origin)

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if not AGENT_ID or not AGENT_ALIAS_ID or not TABLE_NAME:
        return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': 'Server configuration missing'})}

    user_id = get_user_id(event)
    
    method = event.get('httpMethod')

    # ==================================================================
    # HANDLE GET: Fetch Chat History
    # ==================================================================
    if method == 'GET':
        if not user_id:
            return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': 'Unauthorized'})}

        try:
            table = dynamodb.Table(TABLE_NAME)
            response = table.query(
                KeyConditionExpression=Key('UserId').eq(user_id),
                ScanIndexForward=True # Oldest first
            )
            items = response.get('Items', [])
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'history': items})
            }
        except Exception as e:
            print(f"DynamoDB Error: {e}")
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': str(e)})}

    # ==================================================================
    # HANDLE POST: Chat
    # ==================================================================
    elif method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            user_prompt = body.get('prompt')
            
            # --- CRITICAL FIX: Use SessionID from Frontend if available ---
            session_id = body.get('sessionId')
            if not session_id:
                session_id = str(uuid.uuid4())
            # -------------------------------------------------------------

            if not user_prompt:
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'No prompt provided'})}

            print(f"Invoking Agent {AGENT_ID} Session {session_id}")
            
            # A. Invoke Bedrock
            response = agent_client.invoke_agent(
                agentId=AGENT_ID,
                agentAliasId=AGENT_ALIAS_ID,
                sessionId=session_id,
                inputText=user_prompt,
                enableTrace=False
            )

            completion = ""
            for event_stream in response.get('completion'):
                chunk = event_stream.get('chunk')
                if chunk:
                    completion += chunk.get('bytes').decode('utf-8')

            # B. Save to DynamoDB
            if user_id:
                try:
                    table = dynamodb.Table(TABLE_NAME)
                    timestamp = datetime.datetime.utcnow().isoformat()
                    table.put_item(Item={
                        'UserId': user_id,
                        'Timestamp': timestamp,
                        'SessionId': session_id, # Must save this!
                        'UserMessage': user_prompt,
                        'AgentResponse': completion
                    })
                except Exception as db_err:
                    print(f"Warning: DB Save failed: {db_err}")

            return {
                'statusCode': 200,
                'headers': cors_headers,
                # Return sessionId so frontend can lock onto it
                'body': json.dumps({'response': completion, 'sessionId': session_id}) 
            }
            
        except ClientError as e:
            print(f"AWS ClientError: {e}")
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': f'AWS Error: {str(e)}'})}
        except Exception as e:
            print(f"General Error: {e}")
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': f"Internal Error: {str(e)}", 'type': type(e).__name__})}
            
    return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method not allowed'})}