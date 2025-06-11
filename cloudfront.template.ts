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
variable "{{name}}_origin_domain_name" {
  description = "Domain name of the origin"
  type        = string
  default     = "{{origin_domain_name}}"
}

variable "{{name}}_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "{{price_class}}"
}
/* VARIABLES_TF_END */

/* MAIN_TF_START */
module "{{name}}" {
  source = "./modules/cloudfront"

  name               = "{{name}}"
  origin_domain_name = var.{{name}}_origin_domain_name
  price_class        = var.{{name}}_price_class

  tags = {
    Name        = "{{name}}"
    Environment = "{{environment}}"
    Terraform   = "true"
  }
}
/* MAIN_TF_END */

/* OUTPUTS_TF_START */
output "{{name}}_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.{{name}}.distribution_id
}

output "{{name}}_domain_name" {
  description = "CloudFront domain name"
  value       = module.{{name}}.domain_name
}
/* OUTPUTS_TF_END */

/* MODULE_CLOUDFRONT_START */
resource "aws_cloudfront_distribution" "{{name}}" {
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = var.price_class
  comment             = "${var.name} distribution"
  default_root_object = "index.html"

  origin {
    domain_name = var.origin_domain_name
    origin_id   = "origin-${var.name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "origin-${var.name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = var.tags
}

variable "name" {
  description = "Name of the CloudFront distribution"
  type        = string
}

variable "origin_domain_name" {
  description = "Domain name of the origin"
  type        = string
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.{{name}}.id
}

output "domain_name" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.{{name}}.domain_name
}
/* MODULE_CLOUDFRONT_END */
