output "user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "client_id" {
  value = aws_cognito_user_pool_client.client.id
}

# This is what the API Gateway module needs to build the Authorizer
output "user_pool_arn" {
  value = aws_cognito_user_pool.pool.arn
}

output "cognito_domain_url" {
  description = "The full domain URL for Google OAuth Redirect URI"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.ap-south-1.amazoncognito.com"
}

output "cognito_domain_prefix" {
  description = "Just the prefix (e.g. corex-dev-123456)"
  value       = aws_cognito_user_pool_domain.main.domain
}