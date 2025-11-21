import json
import boto3
import os
import uuid
from botocore.exceptions import ClientError

# --- Clients ---
# We use 'bedrock-agent-runtime' to talk to the high-level Agent
agent_client = boto3.client('bedrock-agent-runtime', region_name="ap-south-1")

# --- Configuration ---
# These names MUST match what you put in modules/lambda/main.tf
AGENT_ID = os.environ.get('BEDROCK_AGENT_ID')
AGENT_ALIAS_ID = os.environ.get('BEDROCK_AGENT_ALIAS_ID') # Matches Terraform

# --- Whitelisted Origins (CORS) ---
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

    # 2. Validate Configuration
    if not AGENT_ID or not AGENT_ALIAS_ID:
        print("Error: Bedrock Agent ID or Alias not configured in Lambda environment.")
        return {
            'statusCode': 500, 
            'headers': cors_headers, 
            'body': json.dumps({'error': 'Agent configuration missing'})
        }

    # 3. Session Management
    try:
        claims = event['requestContext']['authorizer']['claims']
        session_id = claims['sub'] 
    except (KeyError, TypeError):
        # Fallback for testing without auth (or if auth bypassed)
        session_id = str(uuid.uuid4()) 

    # 4. Handle POST (Chat)
    if event.get('httpMethod') == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            user_prompt = body.get('prompt')
            
            if not user_prompt:
                return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'No prompt provided'})}

            # --- CALL BEDROCK AGENT ---
            print(f"Invoking Agent {AGENT_ID} (Alias: {AGENT_ALIAS_ID})")
            
            response = agent_client.invoke_agent(
                agentId=AGENT_ID,
                agentAliasId=AGENT_ALIAS_ID,
                sessionId=session_id,
                inputText=user_prompt
            )

            # --- Parse Stream ---
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
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': 'Failed to invoke agent'})}
        except Exception as e:
            print(f"Error: {e}")
            return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': str(e)})}
            
    return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method not allowed'})}