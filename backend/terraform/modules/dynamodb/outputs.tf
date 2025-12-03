output "table_arn" {
  value = aws_dynamodb_table.history.arn
}

output "table_name" {
  value = aws_dynamodb_table.history.name
}