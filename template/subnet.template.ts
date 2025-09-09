export const subnetTemplate = `
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
{{#unless vpc_id_variable}}
{{!-- Don't create vpc_id variable when using module reference --}}
{{else}}
variable "{{name}}_vpc_id" {
  description = "VPC ID for the subnet"
  type        = string
  default     = "{{vpc_id}}"
}
{{/unless}}

variable "{{name}}_cidr_block" {
  description = "CIDR block for the subnet"
  type        = string
  default     = "{{cidr_block}}"
}

{{#unless availability_zone_variable}}
{{!-- Don't create AZ variable when using computed value --}}
{{else}}
variable "{{name}}_availability_zone" {
  description = "Availability zone for the subnet"
  type        = string
  default     = "{{availability_zone}}"
}
{{/unless}}
/* VARIABLES_TF_END */

/* LOCALS_TF_START */
locals {
  {{name}}_subnet_name = "{{name}}-subnet"
}
/* LOCALS_TF_END */

/* MAIN_TF_START */
module "{{name}}" {
  source = "./modules/subnet"
  
  name              = "{{name}}"
  vpc_id            = {{{vpc_id}}}
  cidr_block        = "{{cidr_block}}"
  availability_zone = "{{availability_zone}}"
  
  tags = {
    Name        = "{{name}}-subnet"
    Environment = "{{environment}}"
    Terraform   = "true"
  }
  
  depends_on = [{{#if vpc_module_name}}module.{{vpc_module_name}}{{/if}}]
}
/* MAIN_TF_END */

/* OUTPUTS_TF_START */
output "{{name}}_subnet_id" {
  description = "Subnet ID"
  value       = module.{{name}}.subnet_id
}

output "{{name}}_availability_zone" {
  description = "Availability zone of the subnet"
  value       = module.{{name}}.availability_zone
}
/* OUTPUTS_TF_END */

/* MODULE_SUBNET_START */
resource "aws_subnet" "this" {
  vpc_id            = var.vpc_id
  cidr_block        = var.cidr_block
  availability_zone = var.availability_zone

  map_public_ip_on_launch = true

  tags = var.tags
}

variable "name" {
  description = "Name of the subnet"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the subnet"
  type        = string
}

variable "cidr_block" {
  description = "CIDR block for the subnet"
  type        = string
}

variable "availability_zone" {
  description = "Availability zone for the subnet"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "subnet_id" {
  description = "Subnet ID"
  value       = aws_subnet.this.id
}

output "availability_zone" {
  description = "Availability zone of the subnet"
  value       = aws_subnet.this.availability_zone
}
/* MODULE_SUBNET_END */
`
