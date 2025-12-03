resource "aws_iam_role" "lambda_role" {
  name = "${var.env}-CoreX-Lambda-Execution-Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_policy" "bedrock" {
  name = "${var.env}-CoreX-Policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "bedrock:*" # <--- ALLOW EVERYTHING BEDROCK (Temporary Debug)
        ],
        Effect   = "Allow",
        Resource = "*"
      },
      {
        Action = [
          "ssm:GetParameter",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "s3:GetObject"
        ],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "bedrock_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.bedrock.arn
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.env}-CoreX-DynamoDB-Access"
  description = "Allow Lambda to read/write chat history"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query", # Critical for fetching history
          "dynamodb:UpdateItem"
        ]
        Effect   = "Allow"
        # FIX: Use the variable, not the resource directly
        Resource = var.dynamodb_table_arn 
      }
    ]
  })
}

# FIX: You defined the role in this file, so don't use a variable for the role name. 
# Reference the resource directly for a tighter dependency.
resource "aws_iam_role_policy_attachment" "lambda_dynamo_attach" {
  role       = aws_iam_role.lambda_role.name 
  policy_arn = aws_iam_policy.dynamodb_access.arn
}