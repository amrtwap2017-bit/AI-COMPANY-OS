# Database State Inventory (Runtime Verified)

**PostgreSQL Public Tables:** 169
**Total Indexes:** 433
**Alembic Head:** `b2c3d4e5f6a7`
**Tables with hotel_id Tenant Column:** 100 / 169

## Tables Missing hotel_id (Potential Tenant Isolation Risk)
- ⚠️ `boq_items`
- ⚠️ `catalogs`
- ⚠️ `engineering_boqs`
- ⚠️ `engineering_documents`
- ⚠️ `engineering_drawings`
- ⚠️ `engineering_equipment`
- ⚠️ `engineering_inspections`
- ⚠️ `engineering_lessons_learned`
- ⚠️ `engineering_library_items`
- ⚠️ `engineering_method_statements`
- ⚠️ `engineering_punch_list_items`
- ⚠️ `engineering_quality_records`
- ⚠️ `engineering_safety_records`
- ⚠️ `engineering_site_visits`
- ⚠️ `engineering_specifications`
- ⚠️ `executive_dashboard`
- ⚠️ `framework_agreements`
- ⚠️ `goods_receipt_lines`
- ⚠️ `grn_items`
- ⚠️ `inventory_alerts`
- ⚠️ `invoice_line_items`
- ⚠️ `invoice_matches`
- ⚠️ `invoice_payments`
- ⚠️ `maintenance_asset_nodes`
- ⚠️ `maintenance_cost_records`
- ⚠️ `maintenance_downtime_records`
- ⚠️ `maintenance_history_records`
- ⚠️ `maintenance_parts`
- ⚠️ `maintenance_plans`
- ⚠️ `maintenance_schedules`