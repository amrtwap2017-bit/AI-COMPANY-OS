# Triangle Black — Database Rules

## Connection
URL: postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black
Hotel ID (default): tb-default-hotel-000000000001

## CRITICAL COLUMN NAMES (DO NOT GUESS)
work_orders:
  technician_id         ← NOT assigned_to
  asset_id              ← links to assets.id

employees:
  id, hotel_id, name, department, position, employee_id
  NO 'role' column

maintenance_plans:
  next_due_date         ← VARCHAR, cast with ::DATE
  asset_node_id         ← NOT asset_id (links to assets)
  frequency             ← NOT frequency_days

suppliers:
  company_name          ← NOT name
  email                 ← NOT contact_email
  phone                 ← NOT contact_phone
  contact_person        ← NOT contact_name

pm_engine:
  uses on_schedule_plans (NOT completed_plans)
  NEVER global replace in pm_engine/service.py

## KEY TABLES
  hotels, tenants, users, user_roles
  assets, work_orders, service_requests
  maintenance_plans, suppliers, purchase_orders
  invoices, employees, contracts
  recommendations (created by V6-E02)
  kpi_snapshots (used by V6-E04 ROI)
  twin_nodes, twin_edges (Digital Twin)

## ALEMBIC
  Single head: f2a3b4c5d6e7
  Never stamp without understanding the graph

## SAFE DB QUERY PATTERN
  from sqlalchemy import text
  result = db.execute(text("SELECT ..."), {"param": value}).fetchone()
  # Always use parameterized queries
