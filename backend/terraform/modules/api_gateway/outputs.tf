output "rest_api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.api.id
}

output "execution_arn" {
  description = "Execution ARN for API Gateway (required by Lambda permission)"
  value       = aws_api_gateway_rest_api.api.execution_arn
}

output "api_url" {
  description = "Invoke URL of the API Gateway stage"
  value       = aws_api_gateway_stage.stage.invoke_url
}
