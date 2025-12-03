# ==============================================================================
# 1. USER POOL
# ==============================================================================
resource "aws_cognito_user_pool" "pool" {
  name = "${var.env}-corex-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
  
  # Useful for dev/prod separation logic
  tags = {
    Environment = var.env
    Project     = "CoreX"
  }
}

# ==============================================================================
# 2. UNIQUE DOMAIN GENERATION (The Fix)
# ==============================================================================
# Generates a random suffix like "a1b2" to ensure the domain is unique
resource "random_string" "domain_suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "aws_cognito_user_pool_domain" "main" {
  # Result: corex-dev-9s8d7f
  domain       = "corex-${var.env}-${random_string.domain_suffix.result}"
  user_pool_id = aws_cognito_user_pool.pool.id
}

# ==============================================================================
# 3. GOOGLE IDENTITY PROVIDER
# ==============================================================================
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.pool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "profile email openid"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    oidc_issuer                   = "https://accounts.google.com"
    token_request_method          = "POST"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
  }
}

# ==============================================================================
# 4. APP CLIENT (Depends on Domain & Provider)
# ==============================================================================
resource "aws_cognito_user_pool_client" "client" {
  name = "${var.env}-corex-react-client"
  user_pool_id = aws_cognito_user_pool.pool.id
  
  generate_secret = false 

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
  
  # Enable Google + Email
  supported_identity_providers = ["COGNITO", "Google"]
  
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile", "aws.cognito.signin.user.admin"]
  
  # Use variables for URLs so you can pass different ones for Dev vs Prod
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
  
  # Critical dependency: Ensures Google is ready before Client tries to link it
  depends_on = [
    aws_cognito_identity_provider.google,
    aws_cognito_user_pool_domain.main
  ]
}