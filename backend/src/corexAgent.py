import json
import boto3
import os
import requests

# Create clients for AWS services
ssm = boto3.client('ssm')

# Get the API key from SSM Parameter Store
# This is done *outside* the handler for performance (it's cached)
try:
    param = ssm.get_parameter(Name='/corex/gemini_api_key', WithDecryption=True)
    GEMINI_API_KEY = param['Parameter']['Value']
except Exception as e:
    print(f"Error fetching API key from SSM: {e}")
    GEMINI_API_KEY = None

def handler(event, context):
    """
    This function receives a prompt from API Gateway,
    calls the Gemini API, and returns the response.
    """
    if not GEMINI_API_KEY:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "API Key is not configured."})
        }

    # 1. Parse the user's prompt from the API Gateway event
    try:
        # Assumes the frontend sends a JSON: {"prompt": "Hello there"}
        body = json.loads(event.get('body', '{}'))
        user_prompt = body.get('prompt')

        if not user_prompt:
            raise ValueError("Missing 'prompt' in request body")
            
    except Exception as e:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": f"Invalid request: {str(e)}"})
        }

    # 2. Call the Gemini API
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": user_prompt}
                    ]
                }
            ]
        }
        
        headers = {
            "Content-Type": "application/json"
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        result = response.json()
        
        # 3. Extract the text response
        # This navigates the Gemini JSON structure
        text_response = result['candidates'][0]['content']['parts'][0]['text']

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            "body": json.dumps({
                "response": text_response
            })
        }

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        return {
            "statusCode": 502, # Bad Gateway
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": f"Failed to call AI service: {str(e)}"})
        }
    except KeyError:
        print(f"Error parsing Gemini response: {result}")
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Invalid response from AI service."})
        }
    except Exception as e:
        print(f"Unknown error: {e}")
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "An internal server error occurred."})
        }