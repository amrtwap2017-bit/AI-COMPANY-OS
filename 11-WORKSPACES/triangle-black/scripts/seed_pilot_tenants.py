"""
Triangle Black — Commercial Pilot Tenant Seeder
Seeds 3 realistic Sharm El-Sheikh hotel pilot datasets matching all PostgreSQL constraints.
"""
import uuid
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.database import engine
from sqlalchemy import text
from src.core.auth import hash_password

PILOTS = [
    {
        "slug": "redsea-grand",
        "name": "Red Sea Grand Resort & Spa",
        "brand": "Luxury Collection",
        "stars": "5",
        "rooms": "400",
        "city": "Sharm El-Sheikh",
        "sites": ["Main Resort Compound", "Beach Club & Marina"],
        "admin_email": "eng@redseagrand.com",
        "admin_name": "Eng. Ahmed Mansour",
    },
    {
        "slug": "sinai-pearl",
        "name": "Sinai Pearl Hotel",
        "brand": "Premium Resorts",
        "stars": "4",
        "rooms": "250",
        "city": "Sharm El-Sheikh",
        "sites": ["Main Hotel Tower", "Pool & Recreation Complex"],
        "admin_email": "eng@sinaipearl.com",
        "admin_name": "Eng. Sara Hassan",
    },
    {
        "slug": "gulf-view",
        "name": "Gulf View Suites",
        "brand": "Comfort Hotels",
        "stars": "3",
        "rooms": "150",
        "city": "Sharm El-Sheikh",
        "sites": ["Tower A", "Tower B"],
        "admin_email": "eng@gulfview.com",
        "admin_name": "Eng. Mohamed Ali",
    },
]

ASSET_TEMPLATES = [
    ("Chiller Unit", "HVAC", "critical"),
    ("Air Handling Unit", "HVAC", "high"),
    ("Boiler", "Plumbing", "critical"),
    ("Water Pump", "Plumbing", "high"),
    ("Elevator", "Mechanical", "critical"),
    ("Fire Alarm Panel", "Fire", "critical"),
    ("UPS System", "Electrical", "high"),
    ("Generator", "Electrical", "critical"),
    ("Cooling Tower", "HVAC", "high"),
    ("Water Heater", "Plumbing", "medium"),
    ("Split AC Unit", "HVAC", "medium"),
    ("Sewage Pump", "Plumbing", "high"),
    ("Transformer", "Electrical", "critical"),
    ("Fire Sprinkler", "Fire", "high"),
    ("AHU Filter Bank", "HVAC", "medium"),
    ("Condenser Unit", "HVAC", "high"),
    ("Water Tank", "Plumbing", "medium"),
    ("Distribution Board", "Electrical", "high"),
    ("Smoke Detector Zone", "Fire", "medium"),
    ("Compressor", "HVAC", "critical"),
]

SUPPLIER_TEMPLATES = [
    ("SUP-DELTA-01", "Delta Electro-Mechanical", "electrical", 4.5),
    ("SUP-SINAI-02", "Sinai HVAC Solutions", "HVAC", 4.2),
    ("SUP-REDSEA-03", "Red Sea Plumbing Co.", "plumbing", 3.8),
]

INVENTORY_TEMPLATES = [
    ("ITEM-R410", "R-410A Refrigerant 10kg", "HVAC", "kg", 850.0),
    ("ITEM-BEAR", "Compressor Bearing Kit", "Mechanical", "set", 1200.0),
    ("ITEM-FILT", "AHU Filter 20x25x4", "HVAC", "pcs", 45.0),
    ("ITEM-PIPE", "Copper Pipe 22mm", "Plumbing", "m", 35.0),
    ("ITEM-BREK", "Circuit Breaker 63A", "Electrical", "pcs", 120.0),
]

def seed_pilot(conn, pilot):
    suffix = uuid.uuid4().hex[:8]
    hotel_id = f"tb-hotel-{pilot['slug']}-{suffix}"
    hotel_slug = f"{pilot['slug']}-{suffix}"
    pw = hash_password("PilotPass2026!")

    # 1. Hotel
    conn.execute(text(
        "INSERT INTO hotels (id, hotel_id, slug, name, brand, stars, rooms, city, is_active, settings, created_at, updated_at) "
        "VALUES (:id, :hid, :slug, :name, :brand, :stars, :rooms, :city, true, :settings, NOW(), NOW())"
    ), {
        "id": hotel_id, "hid": hotel_id, "slug": hotel_slug,
        "name": pilot["name"], "brand": pilot["brand"],
        "stars": pilot["stars"], "rooms": pilot["rooms"], "city": pilot["city"],
        "settings": json.dumps({"pilot": True, "city": pilot["city"]})
    })

    # 2. Sites
    site_ids = []
    for sname in pilot["sites"]:
        sid = f"site-{uuid.uuid4().hex[:8]}"
        site_ids.append(sid)
        conn.execute(text(
            "INSERT INTO sites (id, hotel_id, name, is_active, created_at, updated_at) "
            "VALUES (:id, :hid, :name, true, NOW(), NOW())"
        ), {"id": sid, "hid": hotel_id, "name": sname})

    # 3. Admin User
    uid = str(uuid.uuid4())
    conn.execute(text(
        "INSERT INTO users (id, hotel_id, email, hashed_password, name, role, is_active, created_at, updated_at) "
        "VALUES (:id, :hid, :email, :pw, :name, 'manager', true, NOW(), NOW())"
    ), {"id": uid, "hid": hotel_id, "email": pilot["admin_email"],
        "pw": pw, "name": pilot["admin_name"]})

    # 4. Assets (20 per pilot)
    for i, (aname, acat, acrit) in enumerate(ASSET_TEMPLATES):
        aid = f"ast-{uuid.uuid4().hex[:12]}"
        conn.execute(text(
            "INSERT INTO assets (id, hotel_id, site_id, name, category, criticality, status, created_at, updated_at) "
            "VALUES (:id, :hid, :sid, :name, :cat, :crit, 'Operational', NOW(), NOW())"
        ), {
            "id": aid, "hid": hotel_id, "sid": site_ids[i % len(site_ids)],
            "name": f"{aname} {i+1}", "cat": acat, "crit": acrit
        })

    # 5. Work Orders (5 per pilot)
    statuses = ["open", "in_progress", "completed", "closed", "open"]
    for i in range(5):
        woid = f"wo-{uuid.uuid4().hex[:12]}"
        conn.execute(text(
            "INSERT INTO work_orders (id, hotel_id, site_id, title, status, priority, description, created_at, updated_at) "
            "VALUES (:id, :hid, :sid, :title, :status, 'high', :desc, NOW(), NOW())"
        ), {
            "id": woid, "hid": hotel_id, "sid": site_ids[0],
            "title": f"WO-{i+1}: {ASSET_TEMPLATES[i][0]} maintenance",
            "status": statuses[i],
            "desc": f"Scheduled maintenance for {ASSET_TEMPLATES[i][0]}"
        })

    # 6. Suppliers (All NOT NULL fields satisfied)
    for scode, sname, scat, srating in SUPPLIER_TEMPLATES:
        supid = f"sup-{uuid.uuid4().hex[:8]}"
        conn.execute(text(
            "INSERT INTO suppliers (id, hotel_id, supplier_code, company_name, category, rating, status, supplier_type, preferred_flag, risk_level, created_at, updated_at) "
            "VALUES (:id, :hid, :code, :name, :cat, :rating, 'active', 'service', false, 'low', NOW(), NOW())"
        ), {
            "id": supid, "hid": hotel_id, "code": f"{scode}-{suffix[:4]}",
            "name": sname, "cat": scat, "rating": srating
        })

    # 7. Inventory Items (Satisfying all mandatory constraints including min/max_stock, item_code, and costs)
    for icode, iname, icat, iuom, iprice in INVENTORY_TEMPLATES:
        iid = f"inv-{uuid.uuid4().hex[:8]}"
        conn.execute(text(
            "INSERT INTO inventory_items (id, hotel_id, item_code, name, category, unit_of_measure, item_type, is_stockable, min_stock, max_stock, reorder_qty, lead_time_days, standard_cost, last_purchase_cost, average_cost, vat_pct, is_active, created_at, updated_at) "
            "VALUES (:id, :hid, :code, :name, :cat, :uom, 'material', true, 10.0, 100.0, 20.0, 5, :price, :price, :price, 14.0, true, NOW(), NOW())"
        ), {
            "id": iid, "hid": hotel_id, "code": f"{icode}-{suffix[:4]}",
            "name": iname, "cat": icat, "uom": iuom, "price": iprice
        })

    return hotel_id

def main():
    with engine.connect() as conn:
        print("Seeding 3 pilot tenants with complete constraint mappings...")
        for pilot in PILOTS:
            hid = seed_pilot(conn, pilot)
            print(f"  ✅ Seeded: {pilot['name']} -> {hid}")
        conn.commit()
        print("All 3 pilot tenants committed to database successfully!")

if __name__ == "__main__":
    main()
