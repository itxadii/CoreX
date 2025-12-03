output "api_url" {
  value = module.api_gateway.api_url
}

output "user_pool_id" {
  value = module.cognito.user_pool_id
}

output "client_id" {
  value = module.cognito.client_id
}

output "lambda_arn" {
  value = module.lambda.lambda_arn
}
