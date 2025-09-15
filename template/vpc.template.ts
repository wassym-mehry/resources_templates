export const vpcTemplate = `
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
variable "{{name}}_cidr_block" {
  description = "CIDR block for VPC"
  type        = string
  default     = "{{cidr_block}}"
}

variable "{{name}}_enable_dns_hostnames" {
  description = "Enable DNS hostnames"
  type        = bool
  default     = {{enable_dns_hostnames}}
}

variable "{{name}}_enable_dns_support" {
  description = "Enable DNS support"
  type        = bool
  default     = {{enable_dns_support}}
}

variable "{{name}}_public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = {{{json public_subnets}}}
}

variable "{{name}}_private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = {{{json private_subnets}}}
}

variable "{{name}}_azs" {
  description = "Availability zones"
  type        = list(string)
  default     = {{{json azs}}}
}

variable "{{name}}_environment" {
  description = "Environment name"
  type        = string
  default     = "{{environment}}"
}
/* VARIABLES_TF_END */

/* MAIN_TF_START */
module "{{name}}" {
  source          = "./modules/vpc"
  name            = "{{name}}"

}
/* MAIN_TF_END */

/* OUTPUTS_TF_START */
output "{{name}}_vpc_id" {
  description = "The ID of the VPC"
  value       = module.{{name}}.vpc_id
}

output "{{name}}_public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = module.{{name}}.public_subnet_ids
}

output "{{name}}_private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = module.{{name}}.private_subnet_ids
}
/* OUTPUTS_TF_END */

/* LOCALS_TF_START */
locals {
  {{name}}_vpc_id = module.{{name}}.vpc_id
  {{name}}_public_subnet_ids = module.{{name}}.public_subnet_ids
  {{name}}_private_subnet_ids = module.{{name}}.private_subnet_ids
}
/* LOCALS_TF_END */

/* MODULE_VPC_START */
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = merge(var.tags, {
    Name = var.name
  })
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = merge(var.tags, {
    Name = "{{#raw}}\${var.name}{{/raw}}-igw"
  })
}

resource "aws_subnet" "public" {
  count             = length(var.public_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.public_subnets[count.index]
  availability_zone = var.azs[count.index]

  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "{{#raw}}\${var.name}{{/raw}}-public-{{#raw}}\${var.azs[count.index]}{{/raw}}"
    Type = "Public"
  })
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "{{#raw}}\${var.name}{{/raw}}-private-{{#raw}}\${var.azs[count.index]}{{/raw}}"
    Type = "Private"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = merge(var.tags, {
    Name = "{{#raw}}\${var.name}{{/raw}}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

variable "name" {
  description = "Name of the VPC"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
}

variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames"
  type        = bool
  default     = true
}

variable "enable_dns_support" {
  description = "Enable DNS support"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = aws_subnet.private[*].id
}
/* MODULE_VPC_END */
`
