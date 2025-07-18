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
  vpc_cidr        = var.{{name}}_cidr_block
  public_subnets  = var.{{name}}_public_subnets
  private_subnets = var.{{name}}_private_subnets
  azs             = var.{{name}}_azs
  enable_dns_hostnames = var.{{name}}_enable_dns_hostnames
  enable_dns_support   = var.{{name}}_enable_dns_support
  
  tags = {
    Name        = "{{name}}"
    Environment = var.{{name}}_environment
    Terraform   = "true"
  }
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
resource "aws_vpc" "{{name}}" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = merge(var.tags, {
    Name = var.name
  })
}

resource "aws_internet_gateway" "{{name}}" {
  vpc_id = aws_vpc.{{name}}.id

  tags = merge(var.tags, {
    Name = "${var.name}-igw"
  })
}

resource "aws_subnet" "{{name}}_public" {
  count             = length(var.public_subnets)
  vpc_id            = aws_vpc.{{name}}.id
  cidr_block        = var.public_subnets[count.index]
  availability_zone = var.azs[count.index]

  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.name}-public-${var.azs[count.index]}"
    Type = "Public"
  })
}

resource "aws_subnet" "{{name}}_private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.{{name}}.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.name}-private-${var.azs[count.index]}"
    Type = "Private"
  })
}

resource "aws_route_table" "{{name}}_public" {
  vpc_id = aws_vpc.{{name}}.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.{{name}}.id
  }

  tags = merge(var.tags, {
    Name = "${var.name}-public-rt"
  })
}

resource "aws_route_table_association" "{{name}}_public" {
  count          = length(aws_subnet.{{name}}_public)
  subnet_id      = aws_subnet.{{name}}_public[count.index].id
  route_table_id = aws_route_table.{{name}}_public.id
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
  value       = aws_vpc.{{name}}.id
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = aws_subnet.{{name}}_public[*].id
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = aws_subnet.{{name}}_private[*].id
}
/* MODULE_VPC_END */
`
