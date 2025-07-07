export const s3Template = `
/* PROVIDER_TF_START */
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "{{region}}"
}
/* PROVIDER_TF_END */

/* VARIABLES_TF_START */
variable "{{name}}_acl" {
  description = "S3 bucket ACL"
  type        = string
  default     = "{{acl}}"
}

variable "{{name}}_versioning" {
  description = "Enable versioning"
  type        = bool
  default     = {{versioning}}
}

variable "{{name}}_encryption" {
  description = "Enable encryption"
  type        = bool
  default     = {{encryption}}
}

variable "{{name}}_public_read" {
  description = "Allow public read access"
  type        = bool
  default     = {{public_read}}
}
/* VARIABLES_TF_END */

/* MAIN_TF_START */
module "{{name}}" {
  source = "./modules/s3"

  bucket_name           = "{{bucket_name}}"
  versioning_enabled    = {{versioning}}
  encryption_enabled    = {{encryption}}
  public_access_block   = {{#if public_read}}false{{else}}true{{/if}}
  lifecycle_rules       = []

  tags = {
    Name        = "{{name}}"
    Environment = "{{environment}}"
    Terraform   = "true"
  }
}
/* MAIN_TF_END */

/* OUTPUTS_TF_START */
output "{{name}}_bucket_id" {
  description = "The name of the bucket"
  value       = module.{{name}}.bucket_id
}

output "{{name}}_bucket_arn" {
  description = "The ARN of the bucket"
  value       = module.{{name}}.bucket_arn
}

output "{{name}}_bucket_domain_name" {
  description = "The domain name of the bucket"
  value       = module.{{name}}.bucket_domain_name
}
/* OUTPUTS_TF_END */

/* LOCALS_TF_START */
locals {
  {{name}}_bucket_id = module.{{name}}.bucket_id
  {{name}}_bucket_arn = module.{{name}}.bucket_arn
}
/* LOCALS_TF_END */

/* MODULE_S3_START */
resource "aws_s3_bucket" "{{name}}" {
  bucket = var.bucket_name

  tags = var.tags
}

resource "aws_s3_bucket_versioning" "{{name}}" {
  bucket = aws_s3_bucket.{{name}}.id
  
  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Disabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "{{name}}" {
  count = var.encryption_enabled ? 1 : 0
  
  bucket = aws_s3_bucket.{{name}}.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "{{name}}" {
  count = var.public_access_block ? 1 : 0
  
  bucket = aws_s3_bucket.{{name}}.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "{{name}}" {
  count = length(var.lifecycle_rules) > 0 ? 1 : 0
  
  bucket = aws_s3_bucket.{{name}}.id

  dynamic "rule" {
    for_each = var.lifecycle_rules
    content {
      id     = rule.value.id
      status = rule.value.status

      dynamic "transition" {
        for_each = rule.value.transitions
        content {
          days          = transition.value.days
          storage_class = transition.value.storage_class
        }
      }

      dynamic "expiration" {
        for_each = rule.value.expiration != null ? [rule.value.expiration] : []
        content {
          days = expiration.value.days
        }
      }
    }
  }
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "versioning_enabled" {
  description = "Enable versioning"
  type        = bool
  default     = true
}

variable "encryption_enabled" {
  description = "Enable server-side encryption"
  type        = bool
  default     = true
}

variable "public_access_block" {
  description = "Block public access"
  type        = bool
  default     = true
}

variable "lifecycle_rules" {
  description = "Lifecycle rules"
  type        = list(object({
    id = string
    status = string
    transitions = list(object({
      days = number
      storage_class = string
    }))
    expiration = object({
      days = number
    })
  }))
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "bucket_id" {
  description = "The name of the bucket"
  value       = aws_s3_bucket.{{name}}.id
}

output "bucket_arn" {
  description = "The ARN of the bucket"
  value       = aws_s3_bucket.{{name}}.arn
}

output "bucket_domain_name" {
  description = "The domain name of the bucket"
  value       = aws_s3_bucket.{{name}}.bucket_domain_name
}
/* MODULE_S3_END */
`
