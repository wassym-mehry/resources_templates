export const ec2Template = `
/* MAIN_TF_START */
module "" {
  source        = "./modules/ec2"
  name          = "{{name}}"
  instance_type = "{{instance_type}}"
  ami           = "{{ami}}"
  subnet_id     = "{{subnet_id}}"
  vpc_name      = "{{vpc_name}}"
}
/* MAIN_TF_END */

/* MODULE_EC2_START */
resource "aws_instance" "this" {
  ami           = var.ami
  instance_type = var.instance_type
  subnet_id     = var.subnet_id
  
  tags = {
    Name = var.name
  }
}

variable "name" {
  description = "Name of the EC2 instance"
  type        = string
}

variable "instance_type" {
  description = "Instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami" {
  description = "AMI ID"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID"
  type        = string
}

variable "vpc_name" {
  description = "VPC name"
  type        = string
}

output "instance_id" {
  value = aws_instance.this.id
}
/* MODULE_EC2_END */

/* VARIABLES_TF_START */
variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}
/* VARIABLES_TF_END */

/* PROVIDER_TF_START */
provider "aws" {
  region = "{{region}}"
}
/* PROVIDER_TF_END */

/* OUTPUTS_TF_START */
output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = module..instance_id
}
/* OUTPUTS_TF_END */

/* LOCALS_TF_START */
locals {
  instance_id = module..instance_id
}
/* LOCALS_TF_END */
`;