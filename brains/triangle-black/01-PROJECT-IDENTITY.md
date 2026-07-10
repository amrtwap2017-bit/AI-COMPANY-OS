# TRIANGLE BLACK — PROJECT IDENTITY

## Business
Name:     Triangle Black
Type:     Hotel Engineering Services Company (Egypt)
Model:    Annual Maintenance Contracts + Project Engineering
Services: HVAC, Electrical, Plumbing, Fire Fighting, Pool, Kitchen, Laundry,
          Procurement, Inventory

## Owner
Name:  Amr Mostafa
Role:  Executive Engineer — decides WHAT, agent decides HOW
Shell: zsh (WSL Ubuntu)
Tools: uv, docker, git

## Platform Purpose
Turn Triangle Black from a spreadsheet-driven operation into a
full commercial + operational platform covering:
  - Lead → Quote → Contract → Invoice (revenue loop)
  - Contract → Site → Assets → Work Orders → Service Reports (ops loop)
  - Purchase Request → PO → GRN → Stock (procurement loop)

## Portals
| Portal        | Port | Token Key    | Audience        |
|---------------|------|--------------|-----------------|
| Ops Portal    | 3200 | tb_token     | Staff (admin/manager/agent) |
| Client Portal | 3201 | client_token | Hotel clients   |
| Admin Portal  | 3202 | tb_token     | Admin only      |

## User Roles
admin, manager, agent, client
(planned: technician, storekeeper, procurement)

## Demo Credentials
admin:   amr@triangleblack.com   / Admin123!
manager: sara@triangleblack.com  / Manager123!
agent:   hassan@triangleblack.com / Agent123!
agent:   mona@triangleblack.com   / Agent123!
