import json
import boto3
import os
import uuid
from botocore.exceptions import ClientError

# --- Clients ---
agent_client = boto3.client('bedrock-agent-runtime', region_name="ap-south-1")

# --- Configuration ---
AGENT_ID = os.environ.get('BEDROCK_AGENT_ID')
AGENT_ALIAS_ID = os.environ.get('BEDROCK_AGENT_ALIAS_ID')

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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    return {
        'Access-Control-Allow-Origin': 'https://main.d3h4csxsp92hux.amplifyapp.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

# --- Main Handler ---
def handler(event, context):
    # 1. CORS Handling
    headers = event.get('headers', {}) or {}
    request_origin = get_header(headers, 'origin')
    cors_headers = get_cors_headers(request_origin)

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    # 2. Validate Config
    if not AGENT_ID or not AGENT_ALIAS_ID:
        return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': 'Agent configuration missing'})}

    # 3. Handle POST (Chat)
    if event.get('httpMethod') == 'POST':
        try:
            # --- SESSION MANAGEMENT (Moved Inside) ---
            # Initialize session_id with a default to avoid "not defined" errors
            session_id = str(uuid.uuid4())
            
            try:
                # Try to get real User ID from Cognito
                if 'requestContext' in event and 'authorizer' in event['requestContext']:
                    claims = event['requestContext']['authorizer'].get('claims', {})
                    if 'sub' in claims:
                        session_id = claims['sub']
            except Exception as e:
                print(f"Warning: Could not get User ID, using random session. Error: {e}")
            # ------------------------------------------

            body = json.loads(event.get('body', '{}'))
            user_prompt = body.get('prompt')
            
            if not user_prompt:
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'No prompt provided'})}

            print(f"Invoking Agent {AGENT_ID} (Alias: {AGENT_ALIAS_ID}) with Session {session_id}")
            
            response = agent_client.invoke_agent(
                agentId=AGENT_ID,
                agentAliasId=AGENT_ALIAS_ID,
                sessionId=session_id,
                inputText=user_prompt,
                enableTrace=False
            )

            completion = ""
            for event in response.get('completion'):
                chunk = event.get('chunk')
                if chunk:
                    completion += chunk.get('bytes').decode('utf-8')

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'response': completion})
            }
            
        except ClientError as e:
            print(f"AWS ClientError: {e}")
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': f'Failed to invoke agent: {str(e)}'})}
        except Exception as e:
            print(f"General Error: {e}")
            # Detailed error ensures we see exactly what variable failed
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': f"Internal Error: {str(e)}", 'type': type(e).__name__})}
            
    return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method not allowed'})}
