# TRIANGLE BLACK — Database Catalog
## Generated: 2026-09-17 03:26
## Alembic head: v11004_rec_outcomes
## Total tables: 176

## Domain Classification
| Table | Columns | Domain | FK Count |
|-------|---------|--------|----------|
| activities | 8 | 🔲 Other | 0 |
| agents | 10 | 🔲 Other | 0 |
| ai_mentor_decisions | 9 | 🔲 Other | 0 |
| alembic_version | 1 | 🔲 Other | 0 |
| approval_requests | 17 | 🔲 Other | 0 |
| asset_warranties | 11 | ⚙️ Assets/PM | 0 |
| assets | 22 | ⚙️ Assets/PM | 0 |
| attention_items | 25 | 🔧 Operations | 0 |
| boq_items | 11 | 🔲 Other | 1 |
| cache_configs | 10 | 🔲 Other | 0 |
| cacheconfigs | 7 | 🔲 Other | 0 |
| catalogs | 8 | 🔲 Other | 0 |
| chart_of_accounts | 10 | 🔲 Other | 0 |
| client_accounts | 11 | 🔲 Other | 1 |
| client_announcements | 9 | 🔲 Other | 0 |
| client_audit_events | 10 | 🔲 Other | 0 |
| client_context | 5 | 🔲 Other | 0 |
| client_messages | 12 | 🔲 Other | 0 |
| client_preferences | 9 | 🔲 Other | 0 |
| client_support_tickets | 13 | 🔲 Other | 0 |
| contracts | 20 | 💼 Commercial | 0 |
| customer_feedback | 11 | 🔲 Other | 0 |
| customer_health_scores | 19 | 🔲 Other | 0 |
| customer_meetings | 19 | 🔲 Other | 0 |
| customer_nps | 7 | 🔲 Other | 0 |
| customer_renewals | 18 | 🔲 Other | 0 |
| customer_satisfaction_records | 19 | 🔲 Other | 0 |
| customer_tasks | 14 | 🔲 Other | 0 |
| documents | 12 | 📁 Projects | 0 |
| email_logs | 7 | 📢 Notifications | 0 |
| email_notifications | 10 | 📢 Notifications | 0 |
| employee_timesheets | 14 | 👷 HR/Technicians | 0 |
| employees | 14 | 👷 HR/Technicians | 0 |
| engineering_boqs | 17 | 🔲 Other | 0 |
| engineering_documents | 17 | 📁 Projects | 0 |
| engineering_drawings | 17 | 🔲 Other | 0 |
| engineering_equipment | 17 | 🔲 Other | 0 |
| engineering_inspections | 17 | 🔲 Other | 0 |
| engineering_lessons_learned | 13 | 🔲 Other | 0 |
| engineering_library_items | 14 | 🔲 Other | 0 |
| engineering_method_statements | 17 | 🔲 Other | 0 |
| engineering_punch_list_items | 16 | 🔲 Other | 0 |
| engineering_quality_records | 14 | 🔲 Other | 0 |
| engineering_safety_records | 14 | 🔲 Other | 0 |
| engineering_site_visits | 15 | 🏨 Infrastructure | 0 |
| engineering_specifications | 17 | 🔲 Other | 0 |
| entity_documents | 17 | 📁 Projects | 0 |
| eta_invoices | 17 | 💰 Procurement/Finance | 0 |
| evidence_records | 24 | 🧠 Intelligence | 0 |
| executive_dashboard | 10 | 🔲 Other | 0 |
| executive_snapshots | 16 | 🔲 Other | 0 |
| framework_agreements | 10 | 🔲 Other | 0 |
| goods_receipt_lines | 11 | 🔲 Other | 1 |
| goods_receipt_notes | 15 | 🔲 Other | 1 |
| goods_receipts | 17 | 🔲 Other | 0 |
| grn_items | 13 | 💰 Procurement/Finance | 2 |
| hotels | 16 | 🏨 Infrastructure | 0 |
| inventory_alerts | 6 | 📢 Notifications | 0 |
| inventory_items | 25 | 🔲 Other | 0 |
| inventory_vendors | 17 | 🤝 Suppliers | 0 |
| invoice_line_items | 19 | 💰 Procurement/Finance | 2 |
| invoice_matches | 10 | 💰 Procurement/Finance | 1 |
| invoice_payments | 12 | 💰 Procurement/Finance | 1 |
| invoices | 20 | 💰 Procurement/Finance | 0 |
| journal_entries | 12 | 🔲 Other | 0 |
| kpi_snapshots | 14 | 📊 Analytics | 0 |
| lead_searches | 9 | 💼 Commercial | 0 |
| leads | 15 | 💼 Commercial | 0 |
| maintenance_asset_nodes | 16 | ⚙️ Assets/PM | 0 |
| maintenance_cost_records | 11 | ⚙️ Assets/PM | 0 |
| maintenance_downtime_records | 11 | ⚙️ Assets/PM | 0 |
| maintenance_history_records | 10 | ⚙️ Assets/PM | 0 |
| maintenance_parts | 11 | ⚙️ Assets/PM | 0 |
| maintenance_plans | 13 | ⚙️ Assets/PM | 0 |
| maintenance_schedules | 10 | ⚙️ Assets/PM | 0 |
| maintenance_warranties | 11 | ⚙️ Assets/PM | 0 |
| maintenance_work_items | 14 | ⚙️ Assets/PM | 0 |
| negotiation_logs | 9 | 🔲 Other | 1 |
| notifications | 11 | 📢 Notifications | 0 |
| paginated_responses | 7 | 🔲 Other | 0 |
| payments | 9 | 💰 Procurement/Finance | 0 |
| permissions | 4 | 👤 Identity | 0 |
| pipelines | 9 | 🔲 Other | 0 |
| platform_audit_log | 12 | 🔲 Other | 0 |
| platform_events | 11 | 🔲 Other | 0 |
| platform_notifications | 12 | 📢 Notifications | 0 |
| platform_users | 9 | 👤 Identity | 0 |
| po_line_items | 20 | 🔲 Other | 1 |
| pr_approval_chain | 10 | 🔲 Other | 0 |
| price_benchmarks | 13 | 🔲 Other | 0 |
| price_list_lines | 8 | 🔲 Other | 1 |
| price_lists | 7 | 🔲 Other | 0 |
| procurement_events | 10 | 🔲 Other | 0 |
| procurement_intake_log | 9 | 🔲 Other | 0 |
| project_budgets | 13 | 📁 Projects | 0 |
| project_documents | 16 | 📁 Projects | 0 |
| project_issues | 18 | 📁 Projects | 0 |
| project_milestones | 14 | 📁 Projects | 0 |
| project_phases | 16 | 📁 Projects | 0 |
| project_records | 30 | 📁 Projects | 0 |
| project_resources | 16 | 📁 Projects | 0 |
| project_risks | 18 | 📁 Projects | 0 |
| project_site_reports | 19 | 🏨 Infrastructure | 0 |
| project_tasks | 17 | 📁 Projects | 0 |
| project_variations | 17 | 📁 Projects | 0 |
| projects | 12 | 📁 Projects | 0 |
| purchase_order_lines | 11 | 💰 Procurement/Finance | 1 |
| purchase_orders | 24 | 💰 Procurement/Finance | 0 |
| purchase_orders_v2 | 31 | 💰 Procurement/Finance | 3 |
| purchase_request_lines | 10 | 💰 Procurement/Finance | 1 |
| purchase_requests | 23 | 💰 Procurement/Finance | 0 |
| quotation_comparisons | 6 | 🔲 Other | 1 |
| quotation_items | 13 | 🔲 Other | 2 |
| quotes | 12 | 💼 Commercial | 0 |
| recommendation_outcomes | 11 | 🧠 Intelligence | 0 |
| recommendations | 31 | 🧠 Intelligence | 0 |
| reports | 10 | 📊 Analytics | 0 |
| rfq_headers | 23 | 💰 Procurement/Finance | 0 |
| rfq_items | 10 | 💰 Procurement/Finance | 1 |
| rfq_lines | 9 | 💰 Procurement/Finance | 1 |
| rfq_suppliers | 6 | 💰 Procurement/Finance | 2 |
| rfq_vendor_quotes | 15 | 💰 Procurement/Finance | 0 |
| rfqs | 17 | 💰 Procurement/Finance | 0 |
| role_permissions | 2 | 👤 Identity | 2 |
| roles | 5 | 👤 Identity | 0 |
| scope_of_work | 34 | 🔲 Other | 0 |
| service_reports | 17 | 📊 Analytics | 0 |
| service_requests | 21 | 🔧 Operations | 0 |
| sites | 13 | 🏨 Infrastructure | 0 |
| spend_analytics | 14 | 📊 Analytics | 0 |
| sso_configurations | 9 | 🔲 Other | 0 |
| stock_balances | 10 | 💰 Procurement/Finance | 0 |
| stock_movements | 17 | 💰 Procurement/Finance | 0 |
| supplier_accounts | 9 | 🤝 Suppliers | 1 |
| supplier_categories | 6 | 🤝 Suppliers | 1 |
| supplier_contacts | 8 | 🤝 Suppliers | 1 |
| supplier_documents | 9 | 🤝 Suppliers | 1 |
| supplier_intelligence | 20 | 🤝 Suppliers | 0 |
| supplier_invoices | 39 | 💰 Procurement/Finance | 3 |
| supplier_quotation_lines | 10 | 🤝 Suppliers | 2 |
| supplier_quotations | 10 | 🤝 Suppliers | 2 |
| supplier_risk_snapshots | 9 | 🤝 Suppliers | 0 |
| supplier_scorecards | 10 | 🤝 Suppliers | 1 |
| suppliers | 26 | 🤝 Suppliers | 0 |
| system_notifications | 7 | 📢 Notifications | 0 |
| technicians | 12 | 👷 HR/Technicians | 0 |
| tenant_feature_flags | 6 | 🏨 Infrastructure | 1 |
| tenants | 20 | 🏨 Infrastructure | 0 |
| time_entries | 15 | 🔲 Other | 2 |
| twin_edges | 8 | 🔲 Other | 0 |
| twin_nodes | 8 | 🔲 Other | 0 |
| user_preferences | 5 | 👤 Identity | 0 |
| user_roles | 4 | 👤 Identity | 0 |
| users | 11 | 👤 Identity | 0 |
| vendor_catalog_items | 15 | 🤝 Suppliers | 0 |
| vendor_portal_notifications | 10 | 🤝 Suppliers | 0 |
| vendor_purchase_orders | 7 | 💰 Procurement/Finance | 0 |
| vendor_quotations | 18 | 🤝 Suppliers | 1 |
| vendor_rfqs | 5 | 💰 Procurement/Finance | 0 |
| vendor_scorecards | 16 | 🤝 Suppliers | 0 |
| vendors | 35 | 🤝 Suppliers | 0 |
| warehouses | 11 | 🔲 Other | 0 |
| webhook_subscriptions | 8 | 📢 Notifications | 0 |
| webhookconfigs | 9 | 📢 Notifications | 0 |
| wo_transition_logs | 7 | 🔲 Other | 0 |
| work_orders | 24 | 🔧 Operations | 0 |
| workflow_assignments | 8 | 🔲 Other | 1 |
| workflow_comments | 6 | 🔲 Other | 1 |
| workflow_definitions | 9 | 🔲 Other | 0 |
| workflow_escalations | 9 | 🔲 Other | 1 |
| workflow_events | 11 | 🔲 Other | 1 |
| workflow_instances | 10 | 🔲 Other | 0 |
| workflow_states | 9 | 🔲 Other | 1 |
| workflow_templates | 8 | 🔲 Other | 0 |
| workflow_timers | 8 | 🔲 Other | 1 |
| workflow_transitions | 10 | 🔲 Other | 1 |

## Key Tenant-Scoped Tables
The following tables must ALWAYS be filtered by hotel_id:

- activities
- agents
- ai_mentor_decisions
- approval_requests
- asset_warranties
- assets
- attention_items
- cache_configs
- cacheconfigs
- chart_of_accounts
- client_accounts
- client_announcements
- client_audit_events
- client_context
- client_messages
- client_preferences
- client_support_tickets
- contracts
- customer_feedback
- customer_health_scores
- customer_meetings
- customer_nps
- customer_renewals
- customer_satisfaction_records
- customer_tasks
- documents
- email_logs
- email_notifications
- employee_timesheets
- employees
- entity_documents
- eta_invoices
- evidence_records
- executive_snapshots
- goods_receipt_notes
- goods_receipts
- hotels
- inventory_items
- inventory_vendors
- invoices
- journal_entries
- kpi_snapshots
- lead_searches
- leads
- maintenance_plans
- notifications
- paginated_responses
- payments
- pipelines
- platform_audit_log
- platform_events
- platform_notifications
- platform_users
- price_benchmarks
- procurement_events
- procurement_intake_log
- project_budgets
- project_documents
- project_issues
- project_milestones
- project_phases
- project_resources
- project_risks
- project_site_reports
- project_tasks
- project_variations
- projects
- purchase_orders
- purchase_orders_v2
- purchase_requests
- quotes
- recommendation_outcomes
- recommendations
- reports
- rfq_headers
- rfq_vendor_quotes
- rfqs
- scope_of_work
- service_reports
- service_requests
- sites
- spend_analytics
- sso_configurations
- stock_balances
- stock_movements
- supplier_accounts
- supplier_intelligence
- supplier_invoices
- suppliers
- system_notifications
- technicians
- tenant_feature_flags
- tenants
- time_entries
- twin_edges
- twin_nodes
- users
- vendor_portal_notifications
- vendor_purchase_orders
- vendor_rfqs
- vendor_scorecards
- vendors
- warehouses
- webhook_subscriptions
- webhookconfigs
- work_orders
- workflow_definitions
- workflow_events
- workflow_instances
- workflow_transitions