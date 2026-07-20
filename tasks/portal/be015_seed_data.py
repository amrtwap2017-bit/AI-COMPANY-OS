#!/usr/bin/env python3
# BE-015: Seed production data into PostgreSQL
import os, sys, json, datetime, uuid
sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
os.environ["DATABASE_URL"] = "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"
os.environ["TRIANGLE_BLACK_DB_URL"] = "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"

import subprocess
DB = "PGPASSWORD=ai123 psql -U ai -h localhost -d triangle_black -c"

def sql(q):
    r = subprocess.run(f'{DB} "{q}"', shell=True, capture_output=True, text=True)
    return r.returncode == 0, r.stdout+r.stderr

def log(m): print(f"  {m}", flush=True)

HOTEL = "tb-default-hotel-000000000001"
NOW   = datetime.datetime.utcnow().isoformat()

print("BE-015: Seeding production data")
print("=" * 50)

# Technicians
print("Seeding technicians...")
techs = [
    ("Mohamed Hassan",    "m.hassan@tb.com",    "+20 10 1111 1001", ["HVAC","Refrigeration"]),
    ("Ahmed Farouk",      "a.farouk@tb.com",    "+20 10 1111 1002", ["Electrical","Lighting"]),
    ("Karim Mostafa",     "k.mostafa@tb.com",   "+20 10 1111 1003", ["Plumbing","Drainage"]),
    ("Youssef Ibrahim",   "y.ibrahim@tb.com",   "+20 10 1111 1004", ["Mechanical","Pumps"]),
    ("Tarek Abdallah",    "t.abdallah@tb.com",  "+20 10 1111 1005", ["Civil","Finishing"]),
    ("Omar Salam",        "o.salam@tb.com",     "+20 10 1111 1006", ["IT","BMS"]),
    ("Hossam Eldin",      "h.eldin@tb.com",     "+20 10 1111 1007", ["HVAC","Chiller"]),
    ("Mahmoud Ragab",     "m.ragab@tb.com",     "+20 10 1111 1008", ["Electrical","Generator"]),
]
seeded = 0
for name, email, phone, specs in techs:
    tid = str(uuid.uuid4())
    ok, _ = sql(
        f"INSERT INTO technicians (id, hotel_id, name, email, phone, specializations,"
        f" max_work_orders, current_work_orders, is_active, created_at, updated_at)"
        f" VALUES ('{tid}', '{HOTEL}', '{name}', '{email}', '{phone}',"
        f" '{json.dumps(specs)}', 10, 0, true, NOW(), NOW())"
        f" ON CONFLICT (id) DO NOTHING;"
    )
    if ok: seeded += 1
log(f"Technicians: {seeded}/{len(techs)} seeded")

# Assets
print("Seeding assets...")
assets_data = [
    ("HVAC","Chiller Unit A - Floor B1",   "Carrier",   "30XA-300", "CHW-001", "Mechanical Room B1"),
    ("HVAC","Chiller Unit B - Floor B1",   "Trane",     "CGAM-150", "CHW-002", "Mechanical Room B1"),
    ("HVAC","AHU - Floor 1 East Wing",     "York",      "AHU-060",  "AHU-101", "Ceiling Void F1"),
    ("HVAC","AHU - Floor 2 West Wing",     "York",      "AHU-060",  "AHU-201", "Ceiling Void F2"),
    ("HVAC","FCU Room 101",                "Daikin",    "FCU-12",   "FCU-101", "Room 101 Ceiling"),
    ("Electrical","Main LV Switchboard",   "ABB",       "MNS-3000", "LVS-001", "Electrical Room B1"),
    ("Electrical","Generator - 500kVA",    "Cummins",   "C500D5",   "GEN-001", "Generator Room B2"),
    ("Electrical","UPS - Server Room",     "APC",       "SY250K500D","UPS-001","IT Room F3"),
    ("Plumbing","Booster Pump Set",        "Grundfos",  "CR-45",    "PMP-001", "Pump Room B1"),
    ("Plumbing","Fire Fighting Pump",      "Armstrong", "4380",     "FFP-001", "Fire Pump Room B1"),
    ("Mechanical","Pool Pump - Main",      "Pentair",   "EQ-750",   "POOL-001","Pool Plant Room"),
    ("Mechanical","Elevator - Tower A",    "Otis",      "GEN2",     "LIFT-001","Shaft A"),
    ("IT","BMS Controller",                "Honeywell", "EBI-R500", "BMS-001", "Control Room F1"),
    ("Fire","Fire Alarm Panel",            "Notifier",  "NFS2-3030","FAP-001", "Security Room GF"),
    ("Civil","Roof Membrane - Block A",    "Sika",      "Sikalastic","ROF-001","Roof Level"),
]
seeded = 0
for cat, name, mfr, model, sn, loc in assets_data:
    aid = str(uuid.uuid4())
    ok, _ = sql(
        f"INSERT INTO assets (id, hotel_id, site_id, category, name, manufacturer, model,"
        f" serial_number, location_description, service_frequency, criticality, status,"
        f" created_at, updated_at)"
        f" VALUES ('{aid}', '{HOTEL}', '{HOTEL}', '{cat}', '{name}',"
        f" '{mfr}', '{model}', '{sn}', '{loc}', 'monthly', 'high', 'operational',"
        f" NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"
    )
    if ok: seeded += 1
log(f"Assets: {seeded}/{len(assets_data)} seeded")

# Work orders with hotel_id
print("Seeding work orders...")
wos = [
    ("HVAC Chiller A - Cooling Fault",         "hvac",       "critical", "open"),
    ("Lobby Elevator - Door Misalignment",      "mechanical", "high",     "open"),
    ("Pool Pump - Seal Leak",                   "plumbing",   "high",     "in_progress"),
    ("Ballroom LV Board - Breaker Trip",        "electrical", "critical", "open"),
    ("Kitchen Exhaust Fan - Bearing Noise",     "mechanical", "medium",   "open"),
    ("Room 412 AC - Not Cooling",               "hvac",       "medium",   "in_progress"),
    ("Fire Suppression - Annual Inspection",    "civil",      "low",      "open"),
    ("Swimming Pool - Chemical Rebalance",      "cleaning",   "medium",   "completed"),
    ("Server Room UPS - Battery Replace",       "it",         "critical", "open"),
    ("Parking Gate - Motor Failure",            "mechanical", "high",     "open"),
    ("Roof Leak - Block B Level 5",             "civil",      "high",     "open"),
    ("Generator - Monthly Load Test",           "electrical", "low",      "completed"),
    ("Boiler - Annual Servicing",               "mechanical", "medium",   "open"),
    ("Conference Room A/C - Thermostat Fault",  "hvac",       "low",      "open"),
    ("Water Heater - Pressure Relief Valve",    "plumbing",   "medium",   "in_progress"),
]
seeded = 0
for title, wtype, pri, status in wos:
    wid = str(uuid.uuid4())
    ok, err = sql(
        f"INSERT INTO work_orders (id, hotel_id, title, type, priority, status, created_at, updated_at)"
        f" VALUES ('{wid}', '{HOTEL}', '{title}', '{wtype}', '{pri}', '{status}', NOW(), NOW())"
        f" ON CONFLICT (id) DO NOTHING;"
    )
    if ok: seeded += 1
log(f"Work orders: {seeded}/{len(wos)} seeded")

# Verify counts
print("\nFinal counts:")
tables = ["leads","agents","hotels","work_orders","technicians","assets","quotes","contracts","service_requests","inventory_items"]
for t in tables:
    ok, out = sql(f"SELECT count(*) FROM {t};")
    count = out.strip().split("\n")[2].strip() if ok else "err"
    print(f"  {t}: {count}")

print("\nBE-015 COMPLETE")
print("Next: Restart TB Admin and test endpoints")
