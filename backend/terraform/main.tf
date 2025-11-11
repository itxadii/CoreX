terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1" # Your preferred region
}

# 1. IAM Role for the Lambda Function
# This allows the Lambda service to run your code
resource "aws_iam_role" "corex_lambda_role" {
  name = "CoreX-Lambda-Execution-Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# 2. IAM Policy to allow Lambda to call Bedrock AND read SSM
resource "aws_iam_policy" "bedrock_policy" {
  name        = "CoreX-Bedrock-Invoke-Policy"
  description = "Allows Lambda to invoke Bedrock and read SSM parameters" # <-- Updated description

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "bedrock:InvokeAgent", 
          "bedrock:InvokeModel",
          "ssm:GetParameter" 
        ],
        Effect   = "Allow",
        Resource = "*" // You can restrict this later
      }
    ]
  })
}

# 3. Attach the Bedrock policy to the Lambda role
resource "aws_iam_role_policy_attachment" "bedrock_attach" {
  role       = aws_iam_role.corex_lambda_role.name
  policy_arn = aws_iam_policy.bedrock_policy.arn
}

# 4. Add basic Lambda execution policy (for CloudWatch Logs)
# THIS IS ESSENTIAL for debugging.
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.corex_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 5. Zip the Lambda code ("Hello World" version)
# This block zips *only* your handler file.
# This will fail as soon as you add 'import boto3'.
# See the instructions after this file for the correct way.
data "archive_file" "lambda_zip" {
  type = "zip"
  
  # This path is relative from 'backend/terraform' to 'backend/src'
  source_dir  = "../src/build" 
  
  output_path = "${path.module}/lambda_payload.zip"
}

# 6. Define the Lambda Function Itself
resource "aws_lambda_function" "corex_agent_handler" {
  # This 'filename' and 'source_code_hash' point to the zip file created above
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  function_name = "CoreX-Agent-Handler"
  role          = aws_iam_role.corex_lambda_role.arn
  
  # This is 'filename.function_name' from your Python file
  handler       = "corexAgent.handler" 
  runtime       = "python3.11"         # Switched to Python runtime
  timeout = 30
}

# -----------------------------------------------------------------
# 7. API GATEWAY - The "front door" for your React app
# -----------------------------------------------------------------
resource "aws_api_gateway_rest_api" "corex_api" {
  name        = "CoreX-Agent-API"
  description = "The main API for the CoreX agent"
}

# -----------------------------------------------------------------
# 8. API GATEWAY "PROXY" RESOURCE
# This is a special "catch-all" resource.
# It forwards ALL requests (e.g., /chat, /user/profile)
# to your Lambda function.
# -----------------------------------------------------------------
resource "aws_api_gateway_resource" "corex_proxy" {
  rest_api_id = aws_api_gateway_rest_api.corex_api.id
  parent_id   = aws_api_gateway_rest_api.corex_api.root_resource_id
  path_part   = "{proxy+}" # The "catch-all" part
}

# 9. API GATEWAY METHOD (for the / proxy path)
# This allows ANY HTTP method (GET, POST, PUT, etc.)
resource "aws_api_gateway_method" "corex_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.corex_api.id
  resource_id   = aws_api_gateway_resource.corex_proxy.id
  http_method   = "ANY"
  authorization = "NONE" # No auth for now, we can add it later
}

# 10. API GATEWAY INTEGRATION (connects / proxy to Lambda)
# This links the "ANY" method to your Python Lambda function.
resource "aws_api_gateway_integration" "corex_proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.corex_api.id
  resource_id = aws_api_gateway_resource.corex_proxy.id
  http_method = aws_api_gateway_method.corex_proxy_method.http_method

  integration_http_method = "POST" # API Gateway *always* calls Lambda via POST
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.corex_agent_handler.invoke_arn
}

# 11. API GATEWAY METHOD (for the / root path)
# This handles requests to the bare domain (e.g., api.example.com/)
resource "aws_api_gateway_method" "corex_root_method" {
  rest_api_id   = aws_api_gateway_rest_api.corex_api.id
  resource_id   = aws_api_gateway_rest_api.corex_api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# 12. API GATEWAY INTEGRATION (connects / root to Lambda)
resource "aws_api_gateway_integration" "corex_root_integration" {
  rest_api_id = aws_api_gateway_rest_api.corex_api.id
  resource_id = aws_api_gateway_method.corex_root_method.resource_id
  http_method = aws_api_gateway_method.corex_root_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.corex_agent_handler.invoke_arn
}

# -----------------------------------------------------------------
# 13. API GATEWAY DEPLOYMENT
# This "publishes" your API. We add a 'triggers' block
# so Terraform auto-redeploys when your API changes.
# -----------------------------------------------------------------
resource "aws_api_gateway_deployment" "corex_deployment" {
  rest_api_id = aws_api_gateway_rest_api.corex_api.id

  # This makes sure a new deployment happens every time you 'apply'
  # (Terraform doesn't track changes to integrations automatically)
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.corex_proxy.id,
      aws_api_gateway_method.corex_proxy_method.id,
      aws_api_gateway_integration.corex_proxy_integration.id,
      aws_api_gateway_method.corex_root_method.id,
      aws_api_gateway_integration.corex_root_integration.id
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# 14. API GATEWAY STAGE (e.g., "dev", "prod")
# This creates the actual "stage" for your URL.
resource "aws_api_gateway_stage" "corex_stage" {
  deployment_id = aws_api_gateway_deployment.corex_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.corex_api.id
  stage_name    = "dev" # We'll call our first stage "dev"
}

# -----------------------------------------------------------------
# 15. LAMBDA PERMISSION -- *** CRITICAL ***
# This gives API Gateway the *explicit permission*
# to invoke your Lambda function.
# -----------------------------------------------------------------
resource "aws_lambda_permission" "api_gateway_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.corex_agent_handler.function_name
  principal     = "apigateway.amazonaws.com"

  # This is the "Source ARN" that restricts *which* API Gateway can call it
  source_arn = "${aws_api_gateway_rest_api.corex_api.execution_arn}/*/*"
}

# -----------------------------------------------------------------
# 16. OUTPUT: YOUR API's URL
# After you apply, Terraform will print this URL.
# -----------------------------------------------------------------
output "api_invoke_url" {
  description = "The invoke URL for your CoreX API"
  value       = aws_api_gateway_stage.corex_stage.invoke_url
}