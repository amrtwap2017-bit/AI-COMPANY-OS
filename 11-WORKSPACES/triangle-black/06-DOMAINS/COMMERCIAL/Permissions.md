# 01-COMMERCIAL — Permissions

| Permission | Action | Resource | Roles |
|------------|--------|----------|-------|
| lead:create | Create | Lead | SALES_REP, SALES_MANAGER, COMMERCIAL_ADMIN |
| lead:read | View | Lead | SALES_REP, SALES_MANAGER, ENGINEER, ENGINEERING_MANAGER |
| lead:update | Update | Lead | SALES_REP*, SALES_MANAGER *Own leads |
| lead:delete | Delete | Lead | SALES_MANAGER, COMMERCIAL_ADMIN |
| lead:assign | Assign | Lead | SALES_MANAGER, COMMERCIAL_ADMIN |
| lead:convert | Convert | Lead | SALES_REP, SALES_MANAGER |
| opportunity:create | Create | Opportunity | SALES_REP, SALES_MANAGER |
| opportunity:read | View | Opportunity | SALES_REP, SALES_MANAGER, ENGINEER |
| opportunity:update | Update | Opportunity | SALES_REP*, SALES_MANAGER |
| opportunity:delete | Delete | Opportunity | SALES_MANAGER |
| survey:schedule | Schedule | SiteSurvey | ENGINEER, ENGINEERING_MANAGER |
| survey:execute | Execute | SiteSurvey | ENGINEER, ENGINEERING_MANAGER |
| survey:approve | Approve | SiteSurvey | ENGINEERING_MANAGER |
| quotation:create | Create | Quotation | SALES_REP, SALES_MANAGER |
| quotation:approve | Approve | Quotation | SALES_MANAGER, COMMERCIAL_ADMIN |
| quotation:send | Send | Quotation | SALES_REP, SALES_MANAGER |
| contract:create | Create | Contract | SALES_MANAGER, COMMERCIAL_ADMIN |
| contract:sign | Sign | Contract | SALES_MANAGER, CLIENT_APPROVER |
| contract:terminate | Terminate | Contract | SALES_MANAGER, COMMERCIAL_ADMIN |
