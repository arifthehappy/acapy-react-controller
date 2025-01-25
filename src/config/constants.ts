export const AGENT_URL =  'https://6ad4-49-204-30-101.ngrok-free.app/api'  //'http://localhost:7001';

export const Node_Server_URL = 'https://w80khfvj-7003.inc1.devtunnels.ms' // 'http://localhost:7003';

export const User_Name = 'admin ISSUER';

export const SCHEMA_EMPLOYEE_DEFAULTS = {
  name: 'employee',
  version: '1.0',
  attributes: ["full_name",
        "dob",
        "address",
        "designation",
        "employee_number",
        "date_of_issue",
        "date_of_joining",
        "PF_number",
        "blood_group",
        "branch_code",
        "branch_name"]
};

export const SCHEMA_PERMISSION_DEFAULTS = {
  name: 'permission',
  version: '1.0',
  attributes: [  "employee_id",
        "designation",
        "permissions_map",
        "delegation_allow", //true/false
        "valid_from",
        "valid_until",
        "delegated_by", //emp id
        "branch_code"]
};

export const CRED_DEF_DEFAULTS = {
  tag: 'default',
  supportRevocation: false
};