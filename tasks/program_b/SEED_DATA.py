import os, subprocess, json, datetime, uuid, random

ROOT = "/home/amr/AI-COMPANY-OS"
LOG  = ROOT + "/tasks/logs/seed_data.log"
PGPASSWORD = "ai123"
PGUSER     = "ai"
PGDB       = "triangle_black"
PGHOST     = "localhost"

def log(m):
    ts  = datetime.datetime.now().strftime("%H:%M:%S")
    out = "[" + ts + "] " + str(m)
    print(out, flush=True)
    open(LOG, "a").write(out + "\n")

def sql(query, db=PGDB):
    env = {**os.environ, "PGPASSWORD": PGPASSWORD}
    r = subprocess.run(
        ["psql","-U",PGUSER,"-d",db,"-h",PGHOST,
         "-P","pager=off","-t","-A","-c",query],
        capture_output=True, text=True, env=env, timeout=15
    )
    return r.stdout.strip(), r.stderr.strip()

def count(table):
    out, _ = sql("SELECT count(*) FROM " + table + ";")
    return int(out) if out.isdigit() else 0

def insert(table, cols, values):
    cols_str = ", ".join(cols)
    vals_str = ", ".join(["'" + str(v).replace("'","''") + "'" if v is not None else "NULL" for v in values])
    q = "INSERT INTO " + table + " (" + cols_str + ") VALUES (" + vals_str + ") ON CONFLICT DO NOTHING;"
    _, err = sql(q)
    if err and "ERROR" in err:
        return False, err
    return True, ""

def get_hotel_id():
    out, _ = sql("SELECT id FROM hotels LIMIT 1;")
    if out: return out.strip().split("\n")[0]
    return "tb-default-hotel-000000000001"

open(LOG, "w").close()
log("=" * 60)
log("SEED DATA — Egypt Hotel Engineering Platform")
log("=" * 60)

HOTEL_ID = get_hotel_id()
log("Using hotel_id: " + HOTEL_ID)

# ── SEED 1: Sites ─────────────────────────────────────────────
log("\n1. Sites")
if count("sites") < 5:
    sites = [
        ("Grand Cairo Hotel",           "Cairo",       "gc-001",  "5-star"),
        ("Sharm Resort & Spa",           "Sharm",       "sr-001",  "resort"),
        ("Alexandria Sea View Inn",      "Alexandria",  "ax-001",  "4-star"),
        ("Hurghada Beach Resort",        "Hurghada",    "hb-001",  "resort"),
        ("Luxor Heritage Hotel",         "Luxor",       "lx-001",  "heritage"),
    ]
    seeded = 0
    for name, city, code, type_ in sites:
        ok, err = insert("sites", ["id","name","city","site_code","site_type","hotel_id","created_at","updated_at"],
            [str(uuid.uuid4()), name, city, code, type_, HOTEL_ID, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " sites")
else:
    log("  Already has " + str(count("sites")) + " sites")

# ── SEED 2: Technicians (if < 10) ────────────────────────────
log("\n2. Technicians")
if count("technicians") < 10:
    techs = [
        ("Mohamed Ali",      "ahmed.ali@tb.com",         "+20-1001111111",  ["HVAC","Mechanical"],         4),
        ("Ahmed Hassan",     "ahmed.hassan@tb.com",      "+20-1002222222",  ["Plumbing","Civil"],          3),
        ("Omar Ali",         "omar.ali@tb.com",          "+20-1003333333",  ["Electrical","Power"],        5),
        ("Khaled Ibrahim",   "khaled.ibrahim@tb.com",    "+20-1004444444",  ["Fire Safety","Security"],    3),
        ("Dina Samir",       "dina.samir@tb.com",        "+20-1005555555",  ["HVAC","Controls"],           4),
        ("Tarek Gaber",      "tarek.gaber@tb.com",       "+20-1006666666",  ["IT","AV Systems"],           3),
        ("Noha Farouk",      "noha.farouk@tb.com",       "+20-1007777777",  ["Mechanical","Pumps"],        4),
        ("Amr Mostafa",      "amr.mostafa@tb.com",       "+20-1008888888",  ["Electrical","Elevators"],    5),
        ("Sara Hassan",      "sara.hassan@tb.com",       "+20-1009999999",  ["Civil","Finishing"],         3),
        ("Youssef Ahmed",    "youssef.ahmed@tb.com",     "+20-1010101010",  ["HVAC","Refrigeration"],      4),
        ("Laila Ibrahim",    "laila.ibrahim@tb.com",     "+20-1011111111",  ["Plumbing","Drainage"],       3),
        ("Hassan Omar",      "hassan.omar@tb.com",       "+20-1012121212",  ["Electrical","BMS"],          5),
    ]
    seeded = 0
    for name, email, phone, specs, max_wo in techs:
        specs_arr = "{" + ",".join(specs) + "}"
        ok, err = insert("technicians",
            ["id","hotel_id","name","email","phone","specializations","max_work_orders","is_active","current_work_orders","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, name, email, phone, specs_arr, max_wo, True, 0, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " technicians")

# ── SEED 3: Assets ────────────────────────────────────────────
log("\n3. Assets")
if count("assets") < 20:
    assets_data = [
        ("HVAC Chiller Unit 4B",        "hvac",       "CHU-4B-001",  "Carrier",   "30XA-1054",     "active",     "Tower B Floor 4"),
        ("Main Lobby Elevator A",        "mechanical", "ELV-A-001",   "Otis",      "Gen2-Comfort",  "active",     "Main Lobby"),
        ("Emergency Generator Set",      "electrical", "GEN-001",     "Caterpillar","C175-16",      "active",     "Basement B2"),
        ("Swimming Pool Pump System",    "plumbing",   "PPM-001",     "Grundfos",  "CM5-7",         "active",     "Pool Area"),
        ("Fire Suppression System",      "fire",       "FSS-001",     "Tyco",      "HC-1500",       "active",     "All Floors"),
        ("Cooling Tower Unit 1",         "hvac",       "CTU-001",     "BAC",       "VT3-260",       "active",     "Roof Level"),
        ("Main LV Switchboard",          "electrical", "LVS-001",     "ABB",       "MNS-iS",        "active",     "Substation"),
        ("BMS Central Controller",       "it",         "BMS-001",     "Siemens",   "Desigo CC",     "active",     "Control Room"),
        ("Boiler System Unit 1",         "hvac",       "BLR-001",     "Viessmann", "Vitoplex 300",  "active",     "Plant Room"),
        ("Diesel Pump - Fire",           "fire",       "DPF-001",     "Grundfos",  "NK 65-200",     "active",     "Pump Room"),
        ("AHU Kitchen Block",            "hvac",       "AHU-K01",     "Daikin",    "AHU-D6",        "maintenance","Kitchen Level"),
        ("Transformer TR-1 630KVA",      "electrical", "TRF-001",     "ABB",       "RESIBLOC",      "active",     "HV Room"),
        ("Cold Storage Compressor",      "hvac",       "CSC-001",     "Bitzer",    "S6H-30.2Y",     "active",     "Kitchen"),
        ("Pressure Booster Pump",        "plumbing",   "PBP-001",     "Grundfos",  "Hydro MPC-E",   "active",     "Pump Room"),
        ("Access Control System",        "security",   "ACS-001",     "HID",       "ProAccess",     "active",     "All Entrances"),
        ("CCTV System Server",           "it",         "CCT-001",     "Hikvision", "DS-7732NI",     "active",     "Security Room"),
        ("Water Treatment Plant",        "plumbing",   "WTP-001",     "Pall",      "Aria-24",       "active",     "Utility Room"),
        ("Diesel Generator Set 2",       "electrical", "GEN-002",     "Perkins",   "2806A-E18TAG",  "active",     "Basement B1"),
        ("Escalator Unit 1",             "mechanical", "ESC-001",     "Kone",      "EcoMod",        "active",     "Lobby"),
        ("Laundry HVAC System",          "hvac",       "LAU-HVAC-01", "Carrier",   "50ZD-060",      "active",     "Laundry"),
    ]
    seeded = 0
    for name, type_, serial, mfr, model, status, location in assets_data:
        ok, err = insert("assets",
            ["id","hotel_id","name","asset_type","serial_number","manufacturer","model","status","location","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, name, type_, serial, mfr, model, status, location, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " assets")

# ── SEED 4: Work Orders ───────────────────────────────────────
log("\n4. Work Orders")
if count("work_orders") < 25:
    # Get technician IDs
    tech_out, _ = sql("SELECT id FROM technicians LIMIT 6;")
    tech_ids = [t for t in tech_out.split("\n") if t.strip()]
    
    def rand_tech():
        return random.choice(tech_ids) if tech_ids else None
    
    wos = [
        ("HVAC Chiller Unit 4B Not Cooling",            "hvac",       "critical", "open",        3),
        ("Main Lobby Elevator Door Adjustment",          "mechanical", "high",     "open",        2),
        ("Pool Circulation Pump Leak Investigation",     "plumbing",   "high",     "in_progress", 1),
        ("Ballroom Lighting Control Panel Fault",        "electrical", "medium",   "open",        5),
        ("Kitchen Exhaust Fan Replacement",              "mechanical", "low",      "completed",   7),
        ("AC Split Unit Room 412 Not Working",           "hvac",       "medium",   "open",        2),
        ("Fire Suppression System Annual Inspection",    "fire",       "medium",   "scheduled",   14),
        ("Swimming Pool Chemical Balance Check",         "plumbing",   "low",      "in_progress", 3),
        ("Server Room UPS Battery Replacement",          "electrical", "critical", "open",        1),
        ("Parking Lot Gate Motor Failure",               "mechanical", "high",     "open",        2),
        ("Boiler Pressure Relief Valve Service",         "hvac",       "medium",   "scheduled",   10),
        ("Emergency Generator Monthly Test",             "electrical", "medium",   "completed",   0),
        ("Water Pump Vibration Issue Investigation",     "plumbing",   "high",     "in_progress", 2),
        ("Roof Drainage Blockage Clearance",             "civil",      "medium",   "open",        4),
        ("BMS Controller Software Update",               "it",         "low",      "scheduled",   7),
        ("Guest Room 503 AC Noise Complaint",            "hvac",       "medium",   "open",        1),
        ("Main Entrance Door Hydraulic Issue",           "mechanical", "high",     "open",        2),
        ("Kitchen Grease Trap Cleaning",                 "plumbing",   "medium",   "completed",   0),
        ("Transformer Oil Level Check",                  "electrical", "medium",   "in_progress", 1),
        ("Cooling Tower Water Treatment",                "hvac",       "medium",   "scheduled",   5),
        ("Conference Room AV System Fault",              "it",         "medium",   "open",        3),
        ("Gym HVAC Unit Filter Replacement",             "hvac",       "low",      "completed",   0),
        ("Diesel Generator Load Test",                   "electrical", "medium",   "scheduled",   14),
        ("Laundry Equipment Vibration Issue",            "mechanical", "high",     "open",        2),
        ("Spa Pool Heater Not Working",                  "hvac",       "critical", "open",        1),
    ]
    seeded = 0
    for title, type_, priority, status, days_ago in wos:
        created = "(NOW() - INTERVAL '" + str(days_ago) + " days')"
        due_offset = random.randint(1, 7)
        tech_id = rand_tech()
        ok, err = insert("work_orders",
            ["id","hotel_id","title","type","priority","status",
             "technician_id","created_at","updated_at","due_date"],
            [str(uuid.uuid4()), HOTEL_ID, title, type_, priority, status,
             tech_id, created, created, "(NOW() + INTERVAL '" + str(due_offset) + " days')"])
        if ok: seeded += 1
        else: log("  ERR: " + err[:60])
    log("  Seeded " + str(seeded) + " work orders")

# ── SEED 5: Service Requests ──────────────────────────────────
log("\n5. Service Requests")
if count("service_requests") < 15:
    srs = [
        ("AC Not Cooling Room 305",           "hvac",       "high",   "new"),
        ("Water Leak Under Sink Room 412",    "plumbing",   "high",   "assigned"),
        ("Elevator Stuck 3rd Floor",          "mechanical", "critical","in_progress"),
        ("Internet Not Working Suite 601",    "it",         "medium", "resolved"),
        ("Gym Treadmill Out of Order",        "mechanical", "medium", "new"),
        ("Restaurant Exhaust Fan Noisy",      "hvac",       "medium", "new"),
        ("Bathroom Hot Water Issues 208",     "plumbing",   "high",   "assigned"),
        ("Conference Room Projector Fault",   "it",         "medium", "new"),
        ("Pool Pump Making Noise",            "plumbing",   "medium", "in_progress"),
        ("Spa Sauna Temperature Issue",       "hvac",       "medium", "new"),
        ("Lobby Music System Not Working",    "it",         "low",    "new"),
        ("Parking Gate Stuck Open",           "mechanical", "high",   "assigned"),
        ("Emergency Exit Light Faulty",       "electrical", "critical","in_progress"),
        ("Kitchen Dishwasher Leaking",        "plumbing",   "high",   "new"),
        ("Ballroom Stage Lighting Issue",     "electrical", "medium", "new"),
    ]
    seeded = 0
    for title, category, priority, status in srs:
        ok, err = insert("service_requests",
            ["id","hotel_id","title","category","priority","status","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, title, category, priority, status, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " service requests")

# ── SEED 6: Leads (ensure 20+) ────────────────────────────────
log("\n6. Leads")
if count("leads") < 20:
    leads = [
        ("Four Seasons Cairo",           "Hassan Al-Rashid",    "hassan@fourseasons-cai.com", "+20-1001234567", "qualified",   "referral"),
        ("Conrad Cairo",                 "Nadia Farouk",        "nadia@conradcairo.com",      "+20-1002345678", "negotiation", "cold_call"),
        ("Sofitel Cairo Nile",           "Karim Mansour",       "karim@sofitel-nile.com",     "+20-1003456789", "new",         "website"),
        ("JW Marriott Cairo",            "Rania Hassan",        "rania@jwmarriott-cai.com",   "+20-1004567890", "qualified",   "exhibition"),
        ("InterContinental CityStars",   "Ahmed Nour",          "ahmed@ihg-citystars.com",    "+20-1005678901", "won",         "referral"),
        ("Hyatt Regency Cairo",          "Mona Ibrahim",        "mona@hyattcairo.com",        "+20-1006789012", "negotiation", "cold_call"),
        ("Le Meridien Heliopolis",       "Sherif Mostafa",      "sherif@lemeridien-hel.com",  "+20-1007890123", "new",         "website"),
        ("Radisson Blu Cairo Alex",      "Dina Salah",          "dina@radissonblu-alex.com",  "+20-1008901234", "qualified",   "referral"),
        ("Steigenberger Hotel Cairo",    "Omar Galal",          "omar@steigenberger-cai.com", "+20-1009012345", "new",         "exhibition"),
        ("Movenpick Hotel Cairo",        "Laila Ahmed",         "laila@movenpick-cai.com",    "+20-1010123456", "won",         "cold_call"),
        ("Kempinski Nile Hotel",         "Youssef Badr",        "youssef@kempinski-nile.com", "+20-1011234567", "negotiation", "referral"),
        ("Sheraton Cairo Heliopolis",    "Fatma Omar",          "fatma@sheraton-hel.com",     "+20-1012345678", "qualified",   "website"),
        ("Novotel Cairo Airport",        "Tarek Saad",          "tarek@novotel-cai-air.com",  "+20-1013456789", "new",         "cold_call"),
        ("Grand Hyatt Cairo",            "Sara Mohamed",        "sara@grandhyatt-cai.com",    "+20-1014567890", "negotiation", "exhibition"),
        ("Fairmont Nile City",           "Hassan Ali",          "hassan@fairmont-nile.com",   "+20-1015678901", "qualified",   "referral"),
        ("Hilton Cairo Zamalek",         "Nour Ibrahim",        "nour@hilton-zamalek.com",    "+20-1016789012", "new",         "website"),
        ("Renaissance Cairo Mirage",     "Ahmed Kamal",         "ahmed@renaissance-mir.com",  "+20-1017890123", "won",         "cold_call"),
        ("Wyndham Grand Cairo",          "Yasmin Fathi",        "yasmin@wyndham-cai.com",     "+20-1018901234", "negotiation", "referral"),
        ("Rotana Kenz Cairo",            "Mahmoud Samir",       "mahmoud@rotana-kenz.com",    "+20-1019012345", "qualified",   "exhibition"),
        ("Swiss Inn Pyramids",           "Hoda Hassan",         "hoda@swissinn-pyr.com",      "+20-1020123456", "new",         "website"),
    ]
    seeded = 0
    for company, contact, email, phone, status, source in leads:
        ok, err = insert("leads",
            ["id","hotel_id","company_name","contact_name","email","phone","status","source","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, company, contact, email, phone, status, source, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " leads")

# ── SEED 7: Quotes ────────────────────────────────────────────
log("\n7. Quotes")
if count("quotes") < 20:
    q_statuses = ["draft","submitted","approved","sent","rejected","accepted"]
    
    lead_out, _ = sql("SELECT id FROM leads LIMIT 10;")
    lead_ids = [l for l in lead_out.split("\n") if l.strip()]
    
    quotes_data = [
        ("Annual HVAC Maintenance Contract 2026",       2500000, "EGP"),
        ("Preventive Maintenance Package — Year 1",     1800000, "EGP"),
        ("Engineering Operations — Hotel Grand Cairo",  3200000, "EGP"),
        ("Full Facilities Management — Sharm Resort",   4500000, "EGP"),
        ("Electrical Systems Annual Service",           750000,  "EGP"),
        ("Plumbing & Civil Maintenance Contract",       620000,  "EGP"),
        ("Fire Safety Systems Annual Contract",         480000,  "EGP"),
        ("BMS & Controls Maintenance 2026",             350000,  "EGP"),
        ("Elevator & Escalator Service Contract",       290000,  "EGP"),
        ("Generator & UPS Maintenance Package",         420000,  "EGP"),
        ("Cooling Tower Water Treatment Program",       180000,  "EGP"),
        ("Swimming Pool Equipment Service",             150000,  "EGP"),
        ("Kitchen Equipment Maintenance",               220000,  "EGP"),
        ("Security Systems Annual Maintenance",         310000,  "EGP"),
        ("HVAC Emergency Response Contract",            580000,  "EGP"),
        ("Comprehensive Hotel Engineering 2026",        5200000, "EGP"),
        ("Mechanical Systems Audit & Service",          430000,  "EGP"),
        ("IT & AV Systems Maintenance",                 270000,  "EGP"),
        ("Spa & Pool Technical Services",               195000,  "EGP"),
        ("Annual Engineering Consultancy",              850000,  "EGP"),
    ]
    seeded = 0
    for i, (title, value, currency) in enumerate(quotes_data):
        status = q_statuses[i % len(q_statuses)]
        lead_id = lead_ids[i % len(lead_ids)] if lead_ids else None
        quote_num = "QT-2026-" + str(1001 + i).zfill(4)
        ok, err = insert("quotes",
            ["id","hotel_id","lead_id","quote_number","title","total_value","currency","status","valid_until","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, lead_id, quote_num, title, value, currency, status,
             "(NOW() + INTERVAL '30 days')", "NOW()", "NOW()"])
        if ok: seeded += 1
        else: log("  ERR quote: " + err[:60])
    log("  Seeded " + str(seeded) + " quotes")

# ── SEED 8: Contracts ─────────────────────────────────────────
log("\n8. Contracts")
if count("contracts") < 15:
    contracts_data = [
        ("Grand Cairo Hotel",      "AMC-2026-001", "maintenance", "active",    2400000, "2026-01-01", "2026-12-31"),
        ("Sharm Resort & Spa",     "AMC-2026-002", "maintenance", "active",    3600000, "2026-01-01", "2027-12-31"),
        ("Alexandria Sea View",    "AMC-2026-003", "maintenance", "active",    1800000, "2026-03-01", "2027-02-28"),
        ("Hurghada Beach Resort",  "AMC-2026-004", "maintenance", "active",    4200000, "2026-01-01", "2028-12-31"),
        ("Luxor Heritage Hotel",   "AMC-2026-005", "maintenance", "active",    1500000, "2026-02-01", "2027-01-31"),
        ("Kempinski Nile Hotel",   "AMC-2026-006", "operations",  "active",    5800000, "2026-01-01", "2028-12-31"),
        ("Sofitel Cairo Nile",     "AMC-2026-007", "maintenance", "active",    2100000, "2026-04-01", "2027-03-31"),
        ("Conrad Cairo Hotel",     "AMC-2026-008", "full_service","active",    6500000, "2026-01-01", "2028-12-31"),
        ("Hyatt Regency Cairo",    "AMC-2026-009", "maintenance", "expiring",  1950000, "2025-07-01", "2026-06-30"),
        ("JW Marriott Cairo",      "AMC-2025-010", "operations",  "active",    4800000, "2025-01-01", "2027-12-31"),
        ("Fairmont Nile City",     "AMC-2026-011", "maintenance", "active",    3200000, "2026-06-01", "2027-05-31"),
        ("Hilton Zamalek",         "AMC-2025-012", "full_service","expired",   2800000, "2025-01-01", "2025-12-31"),
        ("InterContinental",       "AMC-2026-013", "maintenance", "active",    7200000, "2026-01-01", "2028-12-31"),
        ("Movenpick Cairo",        "AMC-2026-014", "operations",  "active",    3900000, "2026-03-01", "2028-02-28"),
        ("Radisson Blu Alex",      "AMC-2026-015", "maintenance", "active",    2600000, "2026-02-01", "2027-01-31"),
    ]
    seeded = 0
    for client, num, type_, status, value, start, end in contracts_data:
        ok, err = insert("contracts",
            ["id","hotel_id","contract_number","client_name","contract_type","status",
             "total_value","currency","start_date","end_date","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, num, client, type_, status,
             value, "EGP", start, end, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " contracts")

# ── SEED 9: Invoices ──────────────────────────────────────────
log("\n9. Invoices")
if count("invoices") < 20:
    inv_statuses = ["draft","sent","partial","paid","overdue"]
    # Get contract IDs
    c_out, _ = sql("SELECT id FROM contracts LIMIT 10;")
    c_ids = [c for c in c_out.split("\n") if c.strip()]
    
    invoices_data = [
        ("Grand Cairo Hotel",     "INV-2026-0001", 200000),
        ("Sharm Resort & Spa",    "INV-2026-0002", 300000),
        ("Alexandria Sea View",   "INV-2026-0003", 150000),
        ("Hurghada Beach Resort", "INV-2026-0004", 350000),
        ("Luxor Heritage Hotel",  "INV-2026-0005", 125000),
        ("Kempinski Nile Hotel",  "INV-2026-0006", 483333),
        ("Sofitel Cairo Nile",    "INV-2026-0007", 175000),
        ("Conrad Cairo Hotel",    "INV-2026-0008", 541667),
        ("Hyatt Regency Cairo",   "INV-2026-0009", 162500),
        ("JW Marriott Cairo",     "INV-2026-0010", 400000),
        ("Grand Cairo Hotel",     "INV-2026-0011", 200000),
        ("Sharm Resort & Spa",    "INV-2026-0012", 300000),
        ("Fairmont Nile City",    "INV-2026-0013", 266667),
        ("Hilton Zamalek",        "INV-2026-0014", 233333),
        ("InterContinental",      "INV-2026-0015", 600000),
        ("Movenpick Cairo",       "INV-2026-0016", 325000),
        ("Radisson Blu Alex",     "INV-2026-0017", 216667),
        ("Grand Cairo Hotel",     "INV-2026-0018", 200000),
        ("Sharm Resort & Spa",    "INV-2026-0019", 300000),
        ("Alexandria Sea View",   "INV-2026-0020", 150000),
    ]
    seeded = 0
    for i, (client, num, amount) in enumerate(invoices_data):
        status = inv_statuses[i % len(inv_statuses)]
        contract_id = c_ids[i % len(c_ids)] if c_ids else None
        ok, err = insert("invoices",
            ["id","hotel_id","contract_id","invoice_number","client_name",
             "total_amount","currency","status","issue_date","due_date","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, contract_id, num, client,
             amount, "EGP", status, "NOW()", "(NOW() + INTERVAL '30 days')", "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " invoices")

# ── SEED 10: Projects ─────────────────────────────────────────
log("\n10. Projects")
if count("projects") < 15:
    projects = [
        ("Grand Cairo Hotel Lobby Renovation",    "fit-out",     "in_progress", 65,  8500000, 5525000),
        ("HVAC System Upgrade — Sharm Resort",    "engineering", "planning",    15,  3200000, 480000),
        ("Electrical Rewiring Floors 1-5",        "engineering", "in_progress", 40,  2100000, 840000),
        ("Swimming Pool Renovation Project",      "civil",       "completed",   100, 1800000, 1800000),
        ("BMS Integration Phase 2",               "technology",  "in_progress", 60,  1500000, 900000),
        ("Fire Safety System Upgrade",            "engineering", "planning",    5,   950000,  47500),
        ("Energy Management System Install",      "technology",  "in_progress", 30,  2800000, 840000),
        ("Kitchen Equipment Replacement",         "mechanical",  "completed",   100, 650000,  650000),
        ("Elevator Modernization Project",        "mechanical",  "in_progress", 75,  4200000, 3150000),
        ("Guest Room HVAC Retrofit",              "hvac",        "planning",    10,  3800000, 380000),
        ("Solar Panel Installation Roof",         "electrical",  "in_progress", 45,  2600000, 1170000),
        ("Water Treatment Plant Upgrade",         "plumbing",    "planning",    0,   1200000, 0),
        ("Security System Phase 3",               "technology",  "in_progress", 55,  880000,  484000),
        ("Conference Center AV Upgrade",          "technology",  "completed",   100, 420000,  420000),
        ("Emergency Generator Replacement",       "electrical",  "planning",    8,   1850000, 148000),
    ]
    seeded = 0
    for i, (name, type_, status, progress, budget, spent) in enumerate(projects):
        ok, err = insert("projects",
            ["id","hotel_id","name","project_type","status","completion_percentage",
             "budget_total","budget_spent","currency","start_date","end_date","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, name, type_, status, progress,
             budget, spent, "EGP",
             "(NOW() - INTERVAL '" + str(i*7+1) + " days')",
             "(NOW() + INTERVAL '" + str((100-progress)*3) + " days')",
             "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " projects")

# ── SEED 11: Inventory Items ──────────────────────────────────
log("\n11. Inventory Items")
if count("inventory_items") < 50:
    # Get warehouse IDs
    wh_out, _ = sql("SELECT id FROM warehouses LIMIT 2;")
    wh_ids = [w for w in wh_out.split("\n") if w.strip()]
    wh1 = wh_ids[0] if wh_ids else None
    
    inventory = [
        ("HVAC Air Filter 24x24",         "hvac_parts",  "FILT-24x24",   85,   20, "pcs", 45),
        ("Circuit Breaker 100A",           "electrical",  "CB-100A",      12,   5,  "pcs", 180),
        ("Copper Pipe 1 inch 3m",          "plumbing",    "PIPE-CU-1IN",  30,   10, "pcs", 85),
        ("Refrigerant R410A 11.3kg",       "hvac_parts",  "REF-R410A",    8,    3,  "cans",420),
        ("PTFE Teflon Tape",               "plumbing",    "PTFE-TAPE",    150,  20, "rolls",3),
        ("Electrical Cable 2.5mm x 100m",  "electrical",  "CAB-2.5MM",    15,   5,  "rolls",95),
        ("Oil Filter For Chiller",         "hvac_parts",  "OIL-FILT-CH",  6,    2,  "pcs", 220),
        ("Bearing SKF 6205",               "mechanical",  "BRG-6205",     20,   5,  "pcs", 45),
        ("Fire Extinguisher CO2 5kg",      "fire_safety", "FE-CO2-5KG",   18,   5,  "pcs", 280),
        ("LED Lamp 18W Panel",             "electrical",  "LED-18W-PNL",  200,  50, "pcs", 35),
        ("Ball Valve 1.5 inch",            "plumbing",    "BV-1.5IN",     25,   10, "pcs", 75),
        ("Grease Cartridge Multi-purpose", "mechanical",  "GREASE-MP",    40,   10, "pcs", 18),
        ("Air Conditioner Remote",         "hvac_parts",  "AC-REMOTE",    35,   10, "pcs", 45),
        ("UPS Battery 12V 7AH",            "electrical",  "UPS-BAT-7AH",  30,   10, "pcs", 95),
        ("PVC Pipe 4 inch 6m",             "plumbing",    "PVC-4IN",      45,   15, "pcs", 55),
        ("Contactor 40A",                  "electrical",  "CON-40A",      10,   4,  "pcs", 165),
        ("Pump Seal Kit",                  "plumbing",    "PUMP-SEAL",    8,    3,  "sets",180),
        ("Paint Exterior White 20L",       "civil",       "PAINT-EXT-W",  25,   8,  "cans", 220),
        ("Ceiling Tile 60x60 Box",         "civil",       "CEIL-TILE",    12,   5,  "boxes",350),
        ("HDMI Cable 10m",                 "it",          "HDMI-10M",     20,   5,  "pcs", 85),
        ("Network Cable Cat6 305m",        "it",          "NET-CAT6",     8,    3,  "rolls",380),
        ("Sensor Temperature PT100",       "hvac_parts",  "SENS-PT100",   15,   5,  "pcs", 120),
        ("Gate Valve 2 inch",              "plumbing",    "GV-2IN",       18,   5,  "pcs", 95),
        ("Capacitor 25MFD",                "electrical",  "CAP-25MFD",    20,   8,  "pcs", 35),
        ("Safety Gloves Size L",           "safety",      "GLOVE-L",      60,   20, "pairs",25),
        ("Hard Hat Yellow",                "safety",      "HHAT-YEL",     30,   10, "pcs", 45),
        ("Safety Shoes Size 42",           "safety",      "SHOE-42",      12,   4,  "pairs",285),
        ("Multimeter Digital",             "tools",       "MULTI-DIG",    8,    3,  "pcs", 320),
        ("Pressure Gauge 0-10bar",         "tools",       "PG-0-10",      10,   4,  "pcs", 145),
        ("Drill Bits Set Masonry",         "tools",       "DRILL-MAS",    15,   5,  "sets", 85),
    ]
    seeded = 0
    for name, cat, sku, qty, min_qty, unit, price in inventory:
        ok, err = insert("inventory_items",
            ["id","hotel_id","name","category","sku","quantity","minimum_quantity",
             "unit","unit_price","currency","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, name, cat, sku, qty, min_qty, unit, price, "EGP", "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " inventory items")

# ── SEED 12: Suppliers ────────────────────────────────────────
log("\n12. Suppliers")
if count("suppliers") < 10:
    suppliers = [
        ("Carrier Egypt HVAC",         "hvac_equipment",  "carrier.eg@email.com",     "+20-2-1001", "Cairo"),
        ("Schneider Electric Egypt",   "electrical",      "schneider.eg@email.com",   "+20-2-1002", "Cairo"),
        ("Grundfos Egypt",             "pumps",           "grundfos.eg@email.com",    "+20-2-1003", "Cairo"),
        ("ABB Egypt",                  "electrical",      "abb.eg@email.com",         "+20-2-1004", "Cairo"),
        ("Siemens Egypt",              "controls",        "siemens.eg@email.com",     "+20-2-1005", "Cairo"),
        ("Atlas Copco Egypt",          "compressors",     "atlascopco.eg@email.com",  "+20-2-1006", "Cairo"),
        ("SKF Egypt",                  "bearings",        "skf.eg@email.com",         "+20-2-1007", "Cairo"),
        ("Tyco Fire Egypt",            "fire_safety",     "tyco.eg@email.com",        "+20-2-1008", "Cairo"),
        ("Honeywell Egypt",            "controls",        "honeywell.eg@email.com",   "+20-2-1009", "Cairo"),
        ("Johnson Controls Egypt",     "hvac_controls",   "jci.eg@email.com",         "+20-2-1010", "Cairo"),
        ("Emerson Electric Egypt",     "electrical",      "emerson.eg@email.com",     "+20-2-1011", "Cairo"),
        ("Delta Electronics Egypt",    "power",           "delta.eg@email.com",       "+20-2-1012", "Cairo"),
    ]
    seeded = 0
    for name, cat, email, phone, city in suppliers:
        ok, err = insert("suppliers",
            ["id","hotel_id","name","category","contact_email","contact_phone",
             "country","city","is_active","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, name, cat, email, phone, "Egypt", city, True, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " suppliers")

# ── SEED 13: Purchase Orders ──────────────────────────────────
log("\n13. Purchase Orders")
if count("purchase_orders") < 15:
    # Get supplier IDs
    sup_out, _ = sql("SELECT id FROM suppliers LIMIT 8;")
    sup_ids = [s for s in sup_out.split("\n") if s.strip()]
    
    po_statuses = ["draft","submitted","approved","ordered","partial_received","received"]
    pos = [
        ("HVAC Filters Q3 2026",             350000),
        ("Electrical Supplies Batch 7",      285000),
        ("Plumbing Materials Monthly",       195000),
        ("Fire Safety Equipment",            425000),
        ("Spare Parts Chillers",             680000),
        ("IT Equipment Network",             320000),
        ("Safety Equipment Annual",          145000),
        ("Pump Spare Parts Q2",              290000),
        ("Electrical Cables Batch 3",        215000),
        ("HVAC Refrigerant Stock",           385000),
        ("Civil Materials Renovation",       520000),
        ("Controls & Sensors",              180000),
        ("Generator Spare Parts",           445000),
        ("Mechanical Parts Q3",             265000),
        ("Consumables Monthly Batch",        125000),
    ]
    seeded = 0
    for i, (title, amount) in enumerate(pos):
        status = po_statuses[i % len(po_statuses)]
        sup_id = sup_ids[i % len(sup_ids)] if sup_ids else None
        po_num = "PO-2026-" + str(1001+i).zfill(4)
        ok, err = insert("purchase_orders",
            ["id","hotel_id","po_number","title","supplier_id","total_amount",
             "currency","status","order_date","expected_delivery","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, po_num, title, sup_id, amount, "EGP", status,
             "NOW()", "(NOW() + INTERVAL '14 days')", "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " purchase orders")

# ── SEED 14: Maintenance Plans ────────────────────────────────
log("\n14. Maintenance Plans")
if count("maintenance_plans") < 20:
    # Get asset IDs
    asset_out, _ = sql("SELECT id, name FROM assets LIMIT 15;")
    asset_rows = [r for r in asset_out.split("\n") if "|" in r]
    
    freq_opts = ["monthly","quarterly","semi_annual","annual"]
    seeded = 0
    for i, row in enumerate(asset_rows[:15]):
        parts = row.split("|")
        if len(parts) >= 2:
            asset_id = parts[0].strip()
            asset_name = parts[1].strip()
            freq = freq_opts[i % len(freq_opts)]
            ok, err = insert("maintenance_plans",
                ["id","hotel_id","asset_id","title","frequency","next_due_date",
                 "status","description","created_at","updated_at"],
                [str(uuid.uuid4()), HOTEL_ID, asset_id,
                 "PM - " + asset_name, freq,
                 "(NOW() + INTERVAL '" + str((i+1)*10) + " days')",
                 "active" if i % 3 != 0 else "overdue",
                 "Preventive maintenance for " + asset_name,
                 "NOW()", "NOW()"])
            if ok: seeded += 1
    log("  Seeded " + str(seeded) + " maintenance plans")

# ── SEED 15: RFQs ─────────────────────────────────────────────
log("\n15. RFQs (Request for Quotations)")
if count("rfqs") < 10:
    rfq_statuses = ["draft","sent","received","comparing","awarded","cancelled"]
    rfqs = [
        ("HVAC Chillers Annual Service Contract",  580000),
        ("Electrical Panel Replacement Tender",    920000),
        ("Plumbing System Overhaul",               450000),
        ("Elevator Modernization Package",          1200000),
        ("BMS Upgrade Project",                    680000),
        ("Fire System Complete Upgrade",           850000),
        ("Generator Replacement Project",          1500000),
        ("Solar Energy System Installation",       2800000),
        ("Building Facade Renovation",             4200000),
        ("Lobby Renovation Package",               3800000),
    ]
    seeded = 0
    for i, (title, budget) in enumerate(rfqs):
        status = rfq_statuses[i % len(rfq_statuses)]
        rfq_num = "RFQ-2026-" + str(1001+i).zfill(4)
        ok, err = insert("rfqs",
            ["id","hotel_id","rfq_number","title","budget_estimate",
             "currency","status","submission_deadline","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, rfq_num, title, budget, "EGP", status,
             "(NOW() + INTERVAL '14 days')", "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " RFQs")

# ── SEED 16: Notifications ────────────────────────────────────
log("\n16. Notifications")
if count("notifications") < 30:
    notifs = [
        ("CRITICAL: Chiller Unit 4B Failure",       "critical", False),
        ("Work Order WO-2026-042 Assigned",          "info",     False),
        ("Invoice INV-2026-0001 Payment Due",        "warning",  False),
        ("New Service Request: Room 412",            "info",     True),
        ("PM Plan Overdue: Elevator A",              "warning",  False),
        ("Quote QT-2026-1001 Approved",              "success",  True),
        ("Inventory Low Stock: Air Filters",         "warning",  False),
        ("Contract AMC-2026-001 Expiring in 30 days","warning",  False),
        ("Work Order Completed: Kitchen Exhaust Fan","success",  True),
        ("New Lead: Grand Cairo Hotel",              "info",     True),
        ("Emergency: Generator Alarm Active",        "critical", False),
        ("Purchase Order PO-2026-1001 Delivered",    "success",  True),
        ("RFQ Deadline Tomorrow: BMS Upgrade",       "warning",  False),
        ("Technician Mohamed Ali Checked In",        "info",     True),
        ("Monthly Report Ready for Review",          "info",     False),
        ("SLA Breach Risk: WO-2026-039",             "warning",  False),
        ("New Contract Signed: Sharm Resort",        "success",  True),
        ("System Maintenance Scheduled Sunday",      "info",     False),
        ("Budget Variance Alert: Project Lobby",     "warning",  False),
        ("Performance Review Due: Q2 2026",          "info",     True),
    ]
    seeded = 0
    for title, type_, is_read in notifs:
        ok, err = insert("notifications",
            ["id","hotel_id","title","notification_type","is_read","created_at","updated_at"],
            [str(uuid.uuid4()), HOTEL_ID, title, type_, is_read, "NOW()", "NOW()"])
        if ok: seeded += 1
    log("  Seeded " + str(seeded) + " notifications")

# ── FINAL COUNTS ──────────────────────────────────────────────
log("\n" + "=" * 60)
log("SEED DATA COMPLETE — Final Counts:")
tables = ["hotels","sites","leads","technicians","assets","work_orders",
          "service_requests","quotes","contracts","invoices","projects",
          "inventory_items","suppliers","purchase_orders","maintenance_plans",
          "rfqs","notifications","warehouses"]
for table in tables:
    c = count(table)
    status = "✅" if c > 0 else "⚠️ "
    log("  " + status + " " + table + ": " + str(c))
