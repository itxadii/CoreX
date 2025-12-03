data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.source_code_path
  output_path = "${path.module}/lambda_payload.zip"
}

resource "aws_lambda_function" "corex_handler" {
  function_name = "${var.env}-CoreX-Agent-Handler"
  role          = var.lambda_role_arn
  handler       = "corexAgent.handler"
  runtime       = "python3.11"
  timeout       = 30

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      # We pass the variables here
      BEDROCK_AGENT_ID       = var.bedrock_agent_id
      BEDROCK_AGENT_ALIAS_ID = var.bedrock_agent_alias_id
      DYNAMODB_TABLE_NAME    = "${var.env}-corex-history"
    }
  }
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.corex_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}