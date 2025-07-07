export const rdsTemplate = `
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
variable "{{name}}_engine" {
  description = "Database engine"
  type        = string
  default     = "{{engine}}"
}

variable "{{name}}_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "{{engine_version}}"
}

variable "{{name}}_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "{{instance_class}}"
}

variable "{{name}}_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = {{allocated_storage}}
}

variable "{{name}}_db_name" {
  description = "Database name"
  type        = string
  default     = "{{db_name}}"
}

variable "{{name}}_username" {
  description = "Database username"
  type        = string
  default     = "{{username}}"
}

variable "{{name}}_vpc_security_group_ids" {
  description = "VPC security group IDs"
  type        = list(string)
  default     = {{{json vpc_security_group_ids}}}
}

variable "{{name}}_db_subnet_group_name" {
  description = "DB subnet group name"
  type        = string
  default     = "{{db_subnet_group_name}}"
}
/* VARIABLES_TF_END */

/* MAIN_TF_START */
module "{{name}}" {
  source = "./modules/rds"

  name                     = "{{name}}"
  engine                   = var.{{name}}_engine
  engine_version           = var.{{name}}_engine_version
  instance_class           = var.{{name}}_instance_class
  allocated_storage        = var.{{name}}_allocated_storage
  storage_type             = "{{storage_type}}"
  storage_encrypted        = {{storage_encrypted}}
  multi_az                 = {{multi_az}}
  publicly_accessible      = {{publicly_accessible}}
  backup_retention_period  = {{backup_retention_period}}
  backup_window           = "{{backup_window}}"
  maintenance_window      = "{{maintenance_window}}"
  auto_minor_version_upgrade = {{auto_minor_version_upgrade}}
  deletion_protection     = {{deletion_protection}}
  skip_final_snapshot     = {{skip_final_snapshot}}
  db_name                 = var.{{name}}_db_name
  username                = var.{{name}}_username
  manage_master_user_password = {{manage_master_user_password}}
  vpc_security_group_ids  = var.{{name}}_vpc_security_group_ids
  db_subnet_group_name    = var.{{name}}_db_subnet_group_name

  tags = {
    Name        = "{{name}}"
    Environment = "{{environment}}"
    Terraform   = "true"
  }
}
/* MAIN_TF_END */

/* OUTPUTS_TF_START */
output "{{name}}_db_instance_id" {
  description = "RDS instance ID"
  value       = module.{{name}}.db_instance_id
}

output "{{name}}_db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = module.{{name}}.db_instance_endpoint
}

output "{{name}}_db_instance_port" {
  description = "RDS instance port"
  value       = module.{{name}}.db_instance_port
}

output "{{name}}_db_instance_arn" {
  description = "RDS instance ARN"
  value       = module.{{name}}.db_instance_arn
}
/* OUTPUTS_TF_END */

/* LOCALS_TF_START */
locals {
  {{name}}_db_instance_id = module.{{name}}.db_instance_id
  {{name}}_endpoint = module.{{name}}.db_instance_endpoint
}
/* LOCALS_TF_END */

/* MODULE_RDS_START */
resource "aws_db_instance" "{{name}}" {
  identifier = "{{name}}"
  
  engine         = var.engine
  engine_version = var.engine_version
  instance_class = var.instance_class
  
  allocated_storage     = var.allocated_storage
  storage_type         = var.storage_type
  storage_encrypted    = var.storage_encrypted
  
  db_name  = var.db_name
  username = var.username
  manage_master_user_password = var.manage_master_user_password
  
  vpc_security_group_ids = var.vpc_security_group_ids
  db_subnet_group_name   = var.db_subnet_group_name
  
  multi_az               = var.multi_az
  publicly_accessible    = var.publicly_accessible
  
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  deletion_protection       = var.deletion_protection
  skip_final_snapshot      = var.skip_final_snapshot
  
  tags = var.tags
}

variable "name" {
  description = "Name of the RDS instance"
  type        = string
}

variable "engine" {
  description = "Database engine"
  type        = string
  default     = "mysql"
}

variable "engine_version" {
  description = "Database engine version"
  type        = string
  default     = "8.0"
}

variable "instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "storage_type" {
  description = "Storage type"
  type        = string
  default     = "gp2"
}

variable "storage_encrypted" {
  description = "Whether to encrypt storage"
  type        = bool
  default     = true
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "username" {
  description = "Database username"
  type        = string
}

variable "manage_master_user_password" {
  description = "Whether to manage master user password"
  type        = bool
  default     = true
}

variable "vpc_security_group_ids" {
  description = "VPC security group IDs"
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "DB subnet group name"
  type        = string
}

variable "multi_az" {
  description = "Whether to enable multi-AZ"
  type        = bool
  default     = false
}

variable "publicly_accessible" {
  description = "Whether to make publicly accessible"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "auto_minor_version_upgrade" {
  description = "Whether to enable auto minor version upgrade"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Whether to enable deletion protection"
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Whether to skip final snapshot"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.{{name}}.id
}

output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.{{name}}.endpoint
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = aws_db_instance.{{name}}.port
}

output "db_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.{{name}}.arn
}
/* MODULE_RDS_END */
`
