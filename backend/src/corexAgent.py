# import json
# import boto3
# import os
# import requests

# # Create clients for AWS services
# ssm = boto3.client('ssm')

# # Get the API key from SSM Parameter Store
# # This is done *outside* the handler for performance (it's cached)
# try:
#     param = ssm.get_parameter(Name='/corex/gemini_api_key', WithDecryption=True)
#     GEMINI_API_KEY = param['Parameter']['Value']
# except Exception as e:
#     print(f"Error fetching API key from SSM: {e}")
#     GEMINI_API_KEY = None

# # --- NEW: Whitelisted Origins ---
# # We will only allow requests from these two domains.
# ALLOWED_ORIGINS = {
#     'http://localhost:5173',
#     'https://main.d3h4csxsp92hux.amplifyapp.com' # No trailing slash
# }

# def get_cors_headers(request_origin: str) -> dict:
#     """
#     Checks if the request origin is allowed and returns the
#     appropriate CORS headers.
#     """
#     if request_origin in ALLOWED_ORIGINS:
#         # This is the key: we return the *specific* origin that asked.
#         return {
#             'Access-Control-Allow-Origin': request_origin,
#             'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
#             'Access-Control-Allow-Headers': 'Content-Type'
#         }
    
#     # If not an allowed origin, don't return any CORS headers
#     # or return a default one to satisfy API Gateway if needed,
#     # but the browser will block it.
#     return {
#         'Access-Control-Allow-Origin': 'https://main.d3h4csxsp92hux.amplifyapp.com'
#     }

# def handler(event, context):
#     """
#     This function receives a prompt from API Gateway,
#     calls the Gemini API, and returns the response.
#     """
    
#     # --- NEW: CORS Handling ---
#     # Get the origin header from the request
#     # Note: 'origin' header might be lowercase
#     request_origin = event.get('headers', {}).get('origin')
    
#     # Generate the correct CORS headers for this specific request
#     cors_headers = get_cors_headers(request_origin)

#     # Handle CORS Preflight (OPTIONS) requests
#     http_method = event.get('httpMethod')
#     if http_method == 'OPTIONS':
#         return {
#             'statusCode': 200,
#             'headers': cors_headers,
#             'body': json.dumps({'message': 'CORS preflight OK'})
#         }
#     # --- END OF CORS ---

#     if not GEMINI_API_KEY:
#         return {
#             "statusCode": 500,
#             "headers": cors_headers, # <--- UPDATED
#             "body": json.dumps({"error": "API Key is not configured."})
#         }

#     # 1. Parse the user's prompt from the API Gateway event
#     try:
#         # Assumes the frontend sends a JSON: {"prompt": "Hello there"}
#         body = json.loads(event.get('body', '{}'))
#         user_prompt = body.get('prompt')

#         if not user_prompt:
#             raise ValueError("Missing 'prompt' in request body")
            
#     except Exception as e:
#         return {
#             "statusCode": 400,
#             "headers": cors_headers, # <--- UPDATED
#             "body": json.dumps({"error": f"Invalid request: {str(e)}"})
#         }

#     # 2. Call the Gemini API
#     try:
#         url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={GEMINI_API_KEY}"
        
#         payload = {
#             "contents": [
#                 {
#                     "parts": [
#                         {"text": user_prompt}
#                     ]
#                 }
#             ]
#         }
        
#         headers = {
#             "Content-Type": "application/json"
#         }

#         response = requests.post(url, headers=headers, json=payload)
#         response.raise_for_status()  # Raise an exception for bad status codes
        
#         result = response.json()
        
#         # --- NEW: Robust Response Handling ---
#         # Check for safety blocks or empty responses from Gemini
#         if not result.get('candidates'):
#             if result.get('promptFeedback', {}).get('blockReason'):
#                 block_reason = result['promptFeedback']['blockReason']
#                 print(f"Prompt blocked by safety filters: {block_reason}")
#                 return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": f"Your prompt was blocked: {block_reason}"})}
            
#             print(f"Invalid response from Gemini: {result}")
#             return {"statusCode": 502, "headers": cors_headers, "body": json.dumps({"error": "Received an invalid response from the AI service."})}

#         # Extract the text response
#         text_response = result['candidates'][0]['content']['parts'][0]['text']

#         return {
#             "statusCode": 200,
#             "headers": cors_headers, # <--- UPDATED
#             "body": json.dumps({
#                 "response": text_response
#             })
#         }

#     except requests.exceptions.RequestException as e:
#         print(f"Error calling Gemini API: {e}")
#         return {
#             "statusCode": 502, # Bad Gateway
#             "headers": cors_headers, # <--- UPDATED
#             "body": json.dumps({"error": f"Failed to call AI service: {str(e)}"})
#         }
#     except KeyError:
#         print(f"Error parsing Gemini response: {result}")
#         return {
#             "statusCode": 500,
#             "headers": cors_headers, # <--- UPDATED
#             "body": json.dumps({"error": "Invalid response from AI service."})
#         }
#     except Exception as e:
#         print(f"Unknown error: {e}")
#         return {
#             "statusCode": 500,
#             "headers": cors_headers, # <--- UPDATED
#             "body": json.dumps({"error": "An internal server error occurred."})
#         }