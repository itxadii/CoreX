variable "env" {
  description = "The environment (dev/prod)"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "callback_urls" {
  description = "List of allowed callback URLs for OAuth"
  type        = list(string)
  default     = ["http://localhost:5173/"]
}

variable "logout_urls" {
  description = "List of allowed logout URLs for OAuth"
  type        = list(string)
  default     = ["http://localhost:5173/login"]
}