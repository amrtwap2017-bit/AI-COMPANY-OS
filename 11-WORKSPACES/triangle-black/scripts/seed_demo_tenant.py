#!/usr/bin/env python3
"""
T-012: Commercial Demo Tenant Seed Script
Creates a realistic demo hotel with 30 days of operational data.
Usage: python scripts/seed_demo_tenant.py
"""
import sys
import uuid
import random
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

DEMO_HOTEL_ID = "tb-demo-hotel-000000000001"
DEMO_EMAIL    = "demo@triangleblack.com"
DEMO_PASSWORD = "demo123"

def get_db():
    from src.core.database import SessionLocal
    return SessionLocal()

def rdate(days_back=30):
    return datetime.utcnow() - timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23)
    )

def seed_hotel(db):
    from sqlalchemy import text
    db.execute(text("""
        INSERT INTO hotels (id, name, location, is_active, created_at)
        VALUES (:id, :name, :loc, TRUE, :now)
        ON CONFLICT (id) DO UPDATE SET name = :name
    """), {"id": DEMO_HOTEL_ID, "name": "Grand Sands Hotel — Demo",
           "loc": "Sharm El-Sheikh, Egypt", "now": datetime.utcnow()})
    db.commit()
    print("OK hotel")

def seed_assets(db):
    from sqlalchemy import text
    rows = [
        ("HVAC-CHR-001", "Main Chiller Unit",             "HVAC",       "critical"),
        ("HVAC-AHU-001", "AHU — Lobby",                   "HVAC",       "high"),
        ("HVAC-AHU-002", "AHU — Pool Area",               "HVAC",       "high"),
        ("HVAC-FCU-001", "FCU — Floors 1-5",              "HVAC",       "medium"),
        ("HVAC-FCU-002", "FCU — Floors 6-10",             "HVAC",       "medium"),
        ("ELEC-GEN-001", "Main Generator 500kVA",          "Electrical", "critical"),
        ("ELEC-GEN-002", "Backup Generator 250kVA",        "Electrical", "critical"),
        ("ELEC-MDB-001", "Main Distribution Board",        "Electrical", "critical"),
        ("ELEC-UPS-001", "UPS System — IT Room",           "Electrical", "high"),
        ("PLMB-BWH-001", "Boiler Water Heater",            "Plumbing",   "high"),
        ("PLMB-STP-001", "Sewage Treatment Plant",         "Plumbing",   "high"),
        ("PLMB-PMP-001", "Domestic Water Pump",            "Plumbing",   "medium"),
        ("POOL-FLT-001", "Pool Filtration System",         "Pool",       "high"),
        ("POOL-CHL-001", "Pool Chlorination System",       "Pool",       "medium"),
        ("ELEV-001",     "Passenger Elevator — Tower A",   "Elevator",   "critical"),
        ("ELEV-002",     "Passenger Elevator — Tower B",   "Elevator",   "critical"),
        ("ELEV-003",     "Service Elevator",               "Elevator",   "high"),
        ("FIRE-PMP-001", "Fire Pump — Main",               "Fire Safety","critical"),
        ("FIRE-PNL-001", "Fire Alarm Panel",               "Fire Safety","critical"),
        ("KITCH-REF-001","Kitchen Refrigeration Unit",     "Kitchen",    "high"),
        ("KITCH-EXT-001","Kitchen Exhaust System",         "Kitchen",    "medium"),
    ]
    for aid, name, cat, crit in rows:
        db.execute(text("""
            INSERT INTO assets (id, hotel_id, name, category, criticality, status, created_at, updated_at)
            VALUES (:id, :hid, :name, :cat, :crit, 'active', :now, :now)
            ON CONFLICT (id) DO NOTHING
        """), {"id": aid, "hid": DEMO_HOTEL_ID, "name": name,
               "cat": cat, "crit": crit, "now": datetime.utcnow()})
    db.commit()
    print(f"OK {len(rows)} assets")
    return [r[0] for r in rows]

def seed_work_orders(db, asset_ids):
    from sqlalchemy import text
    sla = {"critical": 4, "high": 8, "medium": 24, "low": 72}
    wos = [
        ("Chiller preventive maintenance",        "preventive",  "medium",   "completed"),
        ("AHU filter replacement",                "preventive",  "medium",   "completed"),
        ("Generator monthly load test",           "preventive",  "high",     "completed"),
        ("Elevator annual inspection",            "corrective",  "critical", "completed"),
        ("Pool pump bearing replacement",         "corrective",  "high",     "completed"),
        ("Fire alarm false trigger check",        "corrective",  "critical", "completed"),
        ("Boiler descaling service",              "preventive",  "medium",   "completed"),
        ("UPS battery capacity test",             "corrective",  "high",     "completed"),
        ("Kitchen exhaust deep cleaning",         "preventive",  "medium",   "completed"),
        ("Main MDB thermal imaging scan",         "preventive",  "critical", "completed"),
        ("Chiller condenser tube cleaning",       "preventive",  "high",     "open"),
        ("AHU drive belt replacement",            "corrective",  "medium",   "open"),
        ("Generator fuel system inspection",      "preventive",  "high",     "in_progress"),
        ("Elevator door sensor calibration",      "corrective",  "high",     "assigned"),
        ("Pool water chemistry rebalancing",      "corrective",  "medium",   "open"),
        ("Sewage pump seal replacement",          "preventive",  "medium",   "open"),
        ("Fire pump monthly function test",       "preventive",  "critical", "in_progress"),
        ("Kitchen refrigeration coil cleaning",   "preventive",  "medium",   "open"),
        ("UPS full load bank test",               "preventive",  "high",     "open"),
        ("FCU drain pan deep clean",              "preventive",  "low",      "open"),
    ]
    for title, wtype, priority, status in wos:
        wo_id   = str(uuid.uuid4())
        created = rdate(30)
        breach  = created + timedelta(hours=sla[priority])
        db.execute(text("""
            INSERT INTO work_orders
                (id, hotel_id, title, type, priority, status, asset_id,
                 sla_hours, sla_breach_at, sla_status, sla_breached, created_at, updated_at)
            VALUES
                (:id, :hid, :title, :type, :priority, :status, :asset,
                 :sla_h, :breach, :sla_st, FALSE, :now, :now)
            ON CONFLICT (id) DO NOTHING
        """), {"id": wo_id, "hid": DEMO_HOTEL_ID, "title": title,
               "type": wtype, "priority": priority, "status": status,
               "asset": random.choice(asset_ids), "sla_h": sla[priority],
               "breach": breach,
               "sla_st": "met" if status in ("completed","closed") else "on_track",
               "now": created})
    db.commit()
    print(f"OK {len(wos)} work orders")

def seed_suppliers(db):
    from sqlalchemy import text
    rows = [
        ("Carrier Egypt HVAC Services",    "HVAC",       "preferred", 4.5),
        ("ABB Egypt Electrical",            "Electrical", "approved",  4.2),
        ("Grundfos Middle East",            "Plumbing",   "preferred", 4.7),
        ("Otis Elevator Egypt",             "Elevator",   "preferred", 4.8),
        ("Tyco Fire & Security Egypt",      "Fire Safety","approved",  4.3),
        ("Carrier Refrigeration Egypt",     "Kitchen",    "approved",  4.1),
        ("Schneider Electric Egypt",        "Electrical", "approved",  4.4),
        ("Al-Ahram Water Treatment",        "Plumbing",   "approved",  3.9),
        ("Kempinski Technical Services",   "General",    "preferred", 4.6),
        ("Gulf Engineering Solutions",      "General",    "approved",  3.8),
    ]
    for name, cat, status, rating in rows:
        db.execute(text("""
            INSERT INTO suppliers (id, hotel_id, name, category, status, rating, created_at)
            VALUES (:id, :hid, :name, :cat, :status, :rating, :now)
            ON CONFLICT DO NOTHING
        """), {"id": str(uuid.uuid4()), "hid": DEMO_HOTEL_ID, "name": name,
               "cat": cat, "status": status, "rating": rating, "now": datetime.utcnow()})
    db.commit()
    print(f"OK {len(rows)} suppliers")

def seed_invoices(db):
    from sqlalchemy import text
    rows = [
        ("INV-2026-001", 15000, "paid",    "Carrier — Monthly HVAC Contract"),
        ("INV-2026-002",  8500, "paid",    "ABB — Electrical Maintenance Q3"),
        ("INV-2026-003", 12000, "paid",    "Otis — Elevator Annual Service"),
        ("INV-2026-004",  3200, "pending", "Grundfos — Pump Replacement Parts"),
        ("INV-2026-005",  5500, "pending", "Tyco — Fire System Inspection"),
        ("INV-2026-006",  9800, "overdue", "Gulf Engineering — Emergency HVAC"),
        ("INV-2026-007",  4200, "paid",    "Al-Ahram — Water Treatment Monthly"),
        ("INV-2026-008",  2800, "pending", "Schneider — MDB Maintenance"),
    ]
    for num, amount, status, desc in rows:
        db.execute(text("""
            INSERT INTO invoices (id, hotel_id, invoice_number, amount, status, description, created_at)
            VALUES (:id, :hid, :num, :amount, :status, :desc, :now)
            ON CONFLICT DO NOTHING
        """), {"id": str(uuid.uuid4()), "hid": DEMO_HOTEL_ID, "num": num,
               "amount": amount, "status": status, "desc": desc, "now": rdate(30)})
    db.commit()
    print(f"OK {len(rows)} invoices")

if __name__ == "__main__":
    print("Seeding demo tenant...")
    db = get_db()
    try:
        seed_hotel(db)
        aids = seed_assets(db)
        seed_work_orders(db, aids)
        seed_suppliers(db)
        seed_invoices(db)
        print("\n" + "="*50)
        print("DEMO TENANT READY")
        print(f"Login: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        print(f"Hotel: {DEMO_HOTEL_ID}")
        print("="*50)
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()
