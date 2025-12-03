resource "aws_dynamodb_table" "history" {
  name         = "${var.env}-corex-history"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UserId"
  range_key    = "Timestamp"

  attribute {
    name = "UserId"
    type = "S"
  }

  attribute {
    name = "Timestamp"
    type = "S"
  }

  # Optional: TTL to automatically delete very old history (e.g., > 1 year)
  # This saves money and keeps the table performant.
  ttl {
    attribute_name = "TimeToLive"
    enabled        = true
  }

  tags = {
    Name        = "${var.env}-corex-history"
    Environment = var.env
  }
}