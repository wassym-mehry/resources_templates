export const availabilityZoneTemplate = `
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
variable "{{name}}_az_filter" {
  description = "Filter for availability zones (e.g., us-east-1a)"
  type        = string
  default     = "{{az_filter}}"
}

variable "{{name}}_state" {
  description = "State of availability zones to retrieve (e.g., available)"
  type        = string
  default     = "available"
}
/* VARIABLES_TF_END */

/* LOCALS_TF_START */
locals {
  az_name = "{{name}}-az"
}
/* LOCALS_TF_END */

/* MAIN_TF_START */
module "{{name}}" {
  source = "./modules/availability_zone"

  name       = "{{name}}"
  az_filter  = var.{{name}}_az_filter
  state      = var.{{name}}_state

  tags = {
    Name        = local.az_name
    Environment = "{{environment}}"
    Terraform   = "true"
  }
}
/* MAIN_TF_END */

/* OUTPUTS_TF_START */
output "{{name}}_availability_zones" {
  description = "List of availability zones"
  value       = module.{{name}}.availability_zones
}

output "{{name}}_selected_az" {
  description = "Selected availability zone"
  value       = module.{{name}}.selected_az
}
/* OUTPUTS_TF_END */

/* MODULE_AVAILABILITY_ZONE_START */
data "aws_availability_zones" "this" {
  state = var.state

  filter {
    name   = "zone-name"
    values = [var.az_filter]
  }
}

variable "name" {
  description = "Name for the availability zone module"
  type        = string
}

variable "az_filter" {
  description = "Filter for availability zones (e.g., us-east-1a)"
  type        = string
}

variable "state" {
  description = "State of availability zones to retrieve"
  type        = string
  default     = "available"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "availability_zones" {
  description = "List of availability zones"
  value       = data.aws_availability_zones.this.names
}

output "selected_az" {
  description = "Selected availability zone"
  value       = length(data.aws_availability_zones.this.names) > 0 ? data.aws_availability_zones.this.names[0] : ""
}
/* MODULE_AVAILABILITY_ZONE_END */
`
