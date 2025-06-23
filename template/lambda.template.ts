export const lambdaTemplate = `
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
variable "{{name}}_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "{{runtime}}"
}

variable "{{name}}_handler" {
  description = "Lambda handler"
  type        = string
  default     = "{{handler}}"
}

variable "{{name}}_timeout" {
  description = "Lambda timeout"
  type        = number
  default     = {{timeout}}
}

variable "{{name}}_memory_size" {
  description = "Lambda memory size"
  type        = number
  default     = {{memory_size}}
}

variable "{{name}}_filename" {
  description = "Lambda deployment package filename"
  type        = string
  default     = "{{filename}}"
}

variable "{{name}}_role" {
  description = "Lambda execution role ARN"
  type        = string
  default     = "{{role}}"
}
/* VARIABLES_TF_END */

/* MAIN_TF_START */
module "{{name}}" {
  source = "./modules/lambda"

  name         = "{{name}}"
  runtime      = var.{{name}}_runtime
  handler      = var.{{name}}_handler
  timeout      = var.{{name}}_timeout
  memory_size  = var.{{name}}_memory_size
  filename     = var.{{name}}_filename
  role         = var.{{name}}_role

  tags = {
    Name        = "{{name}}"
    Environment = "{{environment}}"
    Terraform   = "true"
  }
}
/* MAIN_TF_END */

/* OUTPUTS_TF_START */
output "{{name}}_function_name" {
  description = "Lambda function name"
  value       = module.{{name}}.function_name
}

output "{{name}}_function_arn" {
  description = "Lambda function ARN"
  value       = module.{{name}}.function_arn
}

output "{{name}}_invoke_arn" {
  description = "Lambda function invoke ARN"
  value       = module.{{name}}.invoke_arn
}
/* OUTPUTS_TF_END */

/* LOCALS_TF_START */
locals {
  {{name}}_function_name = module.{{name}}.function_name
  {{name}}_function_arn = module.{{name}}.function_arn
}
/* LOCALS_TF_END */

/* MODULE_LAMBDA_START */
resource "aws_lambda_function" "{{name}}" {
  filename         = var.filename
  function_name    = var.name
  role            = var.role
  handler         = var.handler
  runtime         = var.runtime
  timeout         = var.timeout
  memory_size     = var.memory_size

  tags = var.tags
}

variable "name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "python3.9"
}

variable "handler" {
  description = "Lambda handler"
  type        = string
  default     = "index.handler"
}

variable "timeout" {
  description = "Lambda timeout"
  type        = number
  default     = 30
}

variable "memory_size" {
  description = "Lambda memory size"
  type        = number
  default     = 128
}

variable "filename" {
  description = "Lambda deployment package filename"
  type        = string
}

variable "role" {
  description = "Lambda execution role ARN"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.{{name}}.function_name
}

output "function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.{{name}}.arn
}

output "invoke_arn" {
  description = "Lambda function invoke ARN"
  value       = aws_lambda_function.{{name}}.invoke_arn
}
/* MODULE_LAMBDA_END */
`
