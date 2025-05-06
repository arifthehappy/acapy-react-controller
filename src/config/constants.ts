export const AGENT_URL =  'https://w80khfvj-7001.inc1.devtunnels.ms/'  //'http://localhost:7001';

export const Node_Server_URL = 'https://w80khfvj-7003.inc1.devtunnels.ms' // 'http://localhost:7003';

export const User_Name = 'admin ISSUER';

export const SCHEMA_EMPLOYEE_DEFAULTS = {
  name: 'employeeId',
  version: '1.0',
  attributes: [
        "credential_type",  // should be kept value = "employeeId"
        "full_name",
        "dob",
        "address",
        "designation",
        "employee_number",
        "date_of_issue",
        "date_of_joining",
        "email",
        "blood_group",
        "branch_code",
        "branch_name"]
};

export const SCHEMA_PERMISSION_DEFAULTS = {
  name: 'permissions',
  version: '1.0',
  attributes: [  
        "credential_type",  // should be kept value = "basePermission or delegatedPermission"
        "employee_number", // emp number // delegated to
        "permissions_map", // permission json object in string format 
        "delegation_allowed", //true/false
        "valid_from", // yyyy-mm-dd
        "valid_until", // yyyy-mm-dd
        "delegated_by", // delegation id
        "delegation_id", // unique delegation id
        "delegated_by_employee_number", //emp number
        "delegation_proof" // hash(emp number + delegation id + permission_map + secret_key)
      ]
};

export const CRED_DEF_DEFAULTS = {
  tag: 'default',
  revocation_registry_size: 10,
  // "schema_id": "WgWxqztrNooG92RXvsxSTWv:2:schema_name:1.0",
  support_revocation: false,
};

export const ROUTES = [
  "all_employees",
  "loans",
  "accounts",
  "transactions",
  "customer_support",
  "Branch_management",
  "Reports",
];

export const PERMISSIONS = ["read", "write"];
