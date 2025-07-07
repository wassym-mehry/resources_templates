📚 Example Usage:
==================================================

1. See available templates from Git:
   resource-cli templates

2. See available configurations from Git:
   resource-cli configs

3. See registered configurations in database:
   resource-cli list

4. Auto-register from Git configuration:
   resource-cli auto-add lambda

5. Manually add a new resource configuration:
   resource-cli add \
  --type "lambda" \
  --name "AWS Lambda Function" \
  --default-params '{"runtime": "python3.9", "handler": "index.handler", "timeout": 30, "memory_size": 128, "environment_variables": {}}' \
  --required-params "name,filename,role" \
  --output-mappings '{"function_name": "function_name", "function_arn": "function_arn", "invoke_arn": "invoke_arn"}' \
  --dependencies ""

6. Update existing configuration:
   resource-cli update lambda --name "Lambda Function v2"

7. Delete configuration:
   resource-cli delete lambda

📝 Workflow:
   1. Add template and configuration to Git repository
   2. Use 'resource-cli auto-add <type>' for quick setup
   3. Or use 'resource-cli add' for manual configuration
   4. Service automatically uses both template and config
