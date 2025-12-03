variable "env" {
  type = string
}

variable "lambda_role_arn" {
  type = string
}

variable "source_code_path" {
  type = string
}

variable "api_gateway_execution_arn" {
  type = string
}

variable "bedrock_agent_id" {
  description = "The ID of the Amazon Bedrock Agent"
  type        = string
}

variable "bedrock_agent_alias_id" {
  description = "The Alias ID of the Amazon Bedrock Agent (e.g., prod, v1)"
  type        = string
}

variable "dynamodb_table_name" {
  type = string
}