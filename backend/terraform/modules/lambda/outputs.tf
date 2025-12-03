output "lambda_arn" {
  value = aws_lambda_function.corex_handler.invoke_arn
}

output "lambda_function_name" {
  value = aws_lambda_function.corex_handler.function_name
}
