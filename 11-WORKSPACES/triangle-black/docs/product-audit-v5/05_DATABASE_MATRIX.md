# Database Integrity & Index Matrix
PostgreSQL public schema: 423 total indexes.

## Verified High-Performance Composite Indexes
1. `ix_work_orders_hotel_priority` (hotel_id, priority)
2. `ix_assets_hotel_status` (hotel_id, status)
3. `ix_assets_hotel_criticality` (hotel_id, criticality)
4. `ix_assets_hotel_category` (hotel_id, category)
5. `ix_service_requests_hotel_status` (hotel_id, status)
6. `ix_service_requests_hotel_urgency` (hotel_id, urgency)
7. `ix_service_requests_hotel_created` (hotel_id, created_at)
8. `ix_invoices_hotel_status` (hotel_id, status)
9. `ix_invoices_hotel_due_date` (hotel_id, due_date)
10. `ix_platform_events_hotel_status_created` (hotel_id, status, created_at)
