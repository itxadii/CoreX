terraform {
  backend "s3" {
    bucket         = "corex-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "corex-terraform-locks"
    encrypt        = true
  }
}
