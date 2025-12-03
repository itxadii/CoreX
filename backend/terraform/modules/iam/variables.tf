# modules/iam/variables.tf
# Intentionally empty for now — keep shape stable
variable "dummy" {
  default = null
}

variable "env" {
  type = string
}

variable "dynamodb_table_arn" {
  type = string
}