import sys
import uuid
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.database import engine
from sqlalchemy import text

DEMO_HOTEL = "tb-demo-hotel-000000000001"
NOW = datetime.utcnow()

def uid():
    return str(uuid.uuid4())

def already_seeded(conn):
    row = conn.execute(text("SELECT COUNT(*) FROM assets WHERE hotel_id = :hid"), {"hid": DEMO_HOTEL}).fetchone()
    return int(row[0]) > 0

def seed_assets(conn):
    assets = [
        (uid(), "HVAC",        "Main AHU Unit 1",         "Carrier",   "30XA-200",  "AHU-001",  "critical", "operational"),
        (uid(), "HVAC",        "Chiller Unit A",           "Trane",     "CGAX-060",  "CH-001",   "critical", "operational"),
        (uid(), "HVAC",        "Cooling Tower CT-1",       "Baltimore", "VTL-100",   "CT-001",   "high",     "operational"),
        (uid(), "Electrical",  "Main LV Panel MDB-1",      "Schneider", "Prisma G",  "EL-001",   "critical", "operational"),
        (uid(), "Electrical",  "Emergency Generator G1",   "Cummins",   "C550D5",    "GEN-001",  "critical", "operational"),
        (uid(), "Electrical",  "UPS System UPS-1",         "APC",       "SRT10KXLI", "UPS-001",  "high",     "operational"),
        (uid(), "Plumbing",    "Boiler System BL-1",       "Riello",    "RS-100",    "BL-001",   "high",     "operational"),
        (uid(), "Plumbing",    "Water Pump Station WP-1",  "Grundfos",  "CM5-6",     "WP-001",   "medium",   "operational"),
        (uid(), "Fire Safety", "Fire Alarm Panel FAP-1",   "Notifier",  "AFP-400",   "FA-001",   "critical", "operational"),
        (uid(), "Elevator",    "Elevator EL-1",            "Otis",      "Gen2",      "ELV-001",  "high",     "operational"),
        (uid(), "HVAC",        "Fan Coil Unit FCU-101",    "Daikin",    "FWF01ATN",  "FCU-101",  "low",      "operational"),
        (uid(), "HVAC",        "Fan Coil Unit FCU-201",    "Daikin",    "FWF01ATN",  "FCU-201",  "low",      "operational"),
        (uid(), "Electrical",  "DB Panel Floor 1",         "Schneider", "iC60N",     "DB-F01",   "medium",   "operational"),
        (uid(), "Plumbing",    "Pool Water Treatment",     "Hayward",   "C12002",    "PWT-001",  "medium",   "operational"),
        (uid(), "Electrical",  "Solar PV System SL-1",     "SMA",       "Sunny Boy", "SL-001",   "medium",   "operational"),
    ]
    for a in assets:
        conn.execute(text("""
            INSERT INTO assets
            (id, hotel_id, site_id, category, name, manufacturer, model,
             serial_number, criticality, status, created_at, updated_at,
             installation_date, next_maintenance_date)
            VALUES (:id, :hid, :sid, :cat, :name, :mfr, :model,
                    :sn, :crit, :status, :now, :now, :inst, :next)
        """), {
            "id": a[0], "hid": DEMO_HOTEL, "sid": "site-sharm-main",
            "cat": a[1], "name": a[2], "mfr": a[3], "model": a[4],
            "sn": a[5], "crit": a[6], "status": a[7],
            "now": NOW,
            "inst": NOW - timedelta(days=730),
            "next": NOW + timedelta(days=30),
        })
    print("  Seeded " + str(len(assets)) + " assets")
    return {a[2]: a[0] for a in assets}

def seed_suppliers(conn):
    suppliers = [
        (uid(), "SUP-001", "Carrier Egypt",           "HVAC",        "approved", "low"),
        (uid(), "SUP-002", "Schneider Electric Egypt", "Electrical",  "approved", "low"),
        (uid(), "SUP-003", "Grundfos Egypt",           "Plumbing",    "approved", "medium"),
        (uid(), "SUP-004", "Cummins Middle East",      "Generator",   "approved", "low"),
        (uid(), "SUP-005", "Otis Egypt",               "Elevator",    "approved", "low"),
        (uid(), "SUP-006", "Gulf Facilities Co",       "General",     "approved", "medium"),
        (uid(), "SUP-007", "Sharm HVAC Services",      "HVAC",        "approved", "low"),
        (uid(), "SUP-008", "Red Sea Electrical Ltd",   "Electrical",  "approved", "medium"),
        (uid(), "SUP-009", "Delta Plumbing Solutions", "Plumbing",    "approved", "low"),
        (uid(), "SUP-010", "Safety Systems Egypt",     "Fire Safety", "approved", "low"),
    ]
    for s in suppliers:
        conn.execute(text("""
            INSERT INTO suppliers
            (id, supplier_code, company_name, status, supplier_type,
             risk_level, preferred_flag, hotel_id, rating, is_approved,
             category, created_at, updated_at)
            VALUES (:id, :code, :name, :status, :type,
                    :risk, TRUE, :hid, 4.2, TRUE, :cat, :now, :now)
            ON CONFLICT (supplier_code) DO UPDATE SET hotel_id=:hid
        """), {
            "id": s[0], "code": s[1], "name": s[2],
            "status": s[4], "type": s[3], "risk": s[5],
            "hid": DEMO_HOTEL, "cat": s[3], "now": NOW,
        })
    print("  Seeded " + str(len(suppliers)) + " suppliers")

def seed_work_orders(conn, asset_ids):
    asset_list = list(asset_ids.values())
    statuses   = ["open", "in_progress", "completed", "closed"]
    priorities = ["low", "medium", "high", "critical"]
    types      = ["corrective", "preventive", "inspection"]
    wos = []
    for i in range(30):
        status   = statuses[i % 4]
        priority = priorities[i % 4]
        wo_type  = types[i % 3]
        asset    = asset_list[i % len(asset_list)]
        days_ago = i * 3
        sla_hrs  = 24 if priority in ("high", "critical") else 48
        breach   = NOW - timedelta(days=days_ago) + timedelta(hours=sla_hrs)
        sla_st   = "met" if status in ("completed", "closed") else ("breached" if breach < NOW else "on_track")
        wos.append({
            "id": uid(), "hid": DEMO_HOTEL,
            "title": "Demo WO-" + str(i+1).zfill(3) + ": " + wo_type.title() + " Maintenance",
            "desc": "Scheduled " + wo_type + " maintenance for asset",
            "priority": priority, "status": status, "type": wo_type,
            "asset_id": asset,
            "sla_hours": sla_hrs,
            "sla_breach_at": breach,
            "sla_breached": breach < NOW and status not in ("completed", "closed"),
            "sla_status": sla_st,
            "created_at": NOW - timedelta(days=days_ago),
            "due_date": breach,
        })
    for w in wos:
        conn.execute(text("""
            INSERT INTO work_orders
            (id, hotel_id, title, description, priority, status, type,
             asset_id, sla_hours, sla_breach_at, sla_breached, sla_status,
             created_at, updated_at, due_date)
            VALUES (:id, :hid, :title, :desc, :priority, :status, :type,
                    :asset_id, :sla_hours, :sla_breach_at, :sla_breached, :sla_status,
                    :created_at, :created_at, :due_date)
        """), w)
    print("  Seeded " + str(len(wos)) + " work orders")

def seed_service_requests(conn):
    categories = ["HVAC", "Electrical", "Plumbing", "Fire Safety", "General"]
    urgencies  = ["low", "normal", "high", "urgent"]
    statuses   = ["open", "in_progress", "resolved", "closed"]
    srs = []
    for i in range(20):
        srs.append({
            "id": uid(), "hid": DEMO_HOTEL,
            "title": "Demo SR-" + str(i+1).zfill(3) + ": " + categories[i%5] + " Issue Reported",
            "desc": "Service request for " + categories[i%5] + " system",
            "category": categories[i % 5],
            "urgency": urgencies[i % 4],
            "status": statuses[i % 4],
            "submitted_by": "demo-user",
            "created_at": NOW - timedelta(days=i*2),
        })
    for s in srs:
        conn.execute(text("""
            INSERT INTO service_requests
            (id, hotel_id, title, description, category, urgency,
             status, submitted_by, created_at, updated_at)
            VALUES (:id, :hid, :title, :desc, :category, :urgency,
                    :status, :submitted_by, :created_at, :created_at)
        """), s)
    print("  Seeded " + str(len(srs)) + " service requests")

def run():
    print("=== Triangle Black Demo Tenant Seed ===")
    print("Hotel ID : " + DEMO_HOTEL)
    with engine.connect() as conn:
        if already_seeded(conn):
            print("Demo tenant already seeded.")
            return
        print("Seeding demo data...")
        asset_ids = seed_assets(conn)
        seed_suppliers(conn)
        seed_work_orders(conn, asset_ids)
        seed_service_requests(conn)
        conn.commit()
    print("Done. Demo tenant seeded successfully.")

if __name__ == "__main__":
    run()
