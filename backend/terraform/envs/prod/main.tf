# ==============================================================================
# ROOT MAIN.TF
# ==============================================================================

data "aws_ssm_parameter" "google_client_id" {
  name = "/corex/google_client_id"
}

data "aws_ssm_parameter" "google_client_secret" {
  name            = "/corex/google_client_secret"
  with_decryption = true
}


# 1. DYNAMODB (Base Layer)
module "dynamodb" {
  source = "../../modules/dynamodb"
  env    = "prod"
}

# 2. COGNITO (Base Layer)
module "cognito" {
  source = "../../modules/cognito"
  env    = "prod"

  # Pass secrets (recommend using terraform.tfvars for actual values)
  google_client_id     = data.aws_ssm_parameter.google_client_id.value
  google_client_secret = data.aws_ssm_parameter.google_client_secret.value

  # Environment specific URLs
  callback_urls = [
    "http://localhost:5173",
    "http://localhost:5173/", 
    "https://main.d3h4csxsp92hux.amplifyapp.com",
    "https://main.d3h4csxsp92hux.amplifyapp.com/"
  ]
  
  logout_urls = [
    "http://localhost:5173/login", 
    "https://main.d3h4csxsp92hux.amplifyapp.com/login"
  ]
}

# 3. IAM (Depends on DynamoDB)
module "iam" {
  source = "../../modules/iam"
  env    = "prod"

  # WIRE IT: Pass the table ARN so IAM can create the correct policy
  dynamodb_table_arn = module.dynamodb.table_arn
}

# 4. LAMBDA (Depends on IAM and DynamoDB)
module "lambda" {
  source             = "../../modules/lambda"
  env                = "prod"
  lambda_role_arn    = module.iam.lambda_role_arn
  source_code_path   = "../../../src/build"
  
  # Dependencies
  api_gateway_execution_arn = module.api_gateway.execution_arn
  
  # Bedrock Config
  bedrock_agent_id       = "UWBRSNSX4N"
  bedrock_agent_alias_id = "MPKPW0TVRS"

  # WIRE IT: Pass the table name for the Environment Variable
  dynamodb_table_name = module.dynamodb.table_name
}

# 5. API GATEWAY (Depends on Lambda & Cognito)
module "api_gateway" {
  source = "../../modules/api_gateway"
  env    = "prod"

  lambda_arn            = module.lambda.lambda_arn
  lambda_function_name  = module.lambda.lambda_function_name
  cognito_user_pool_arn = module.cognito.user_pool_arn
}