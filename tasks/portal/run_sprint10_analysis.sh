#!/bin/bash
# SPRINT 10 - AI Core Intelligence Analysis
# Qwen 2.5 7b analyzes 8 critical modules

OLLAMA="http://localhost:11434/api/generate"
MODEL="qwen2.5-coder:7b"
OUT="/home/amr/AI-COMPANY-OS/tasks/portal/sprint10"
mkdir -p "$OUT"

log() { echo "[$(date +%H:%M:%S)] $*"; }

ask() {
    local prompt="$1" out="$2"
    python3 - << PYEOF
import subprocess, json, sys

prompt = """$prompt"""
payload = json.dumps({
    "model": "$MODEL",
    "stream": False,
    "prompt": prompt,
    "options": {"temperature": 0.1, "num_predict": 1200}
})
r = subprocess.run(
    ["curl", "-s", "-X", "POST", "$OLLAMA",
     "-H", "Content-Type: application/json", "-d", payload],
    capture_output=True, text=True, timeout=300
)
try:
    resp = json.loads(r.stdout).get("response", "")
    with open("$out", "w") as f:
        f.write(resp)
    print(f"  OK: {len(resp)} chars")
except Exception as e:
    print(f"  ERR: {e}")
    with open("$out", "w") as f:
        f.write(f"Error: {e}")
PYEOF
}

log "SPRINT 10 - AI CORE INTELLIGENCE ANALYSIS"
log "Output: $OUT"
echo ""

# TASK 10-01: AI Request Intake System
log "[10-01] AI Request Intake Design..."
ask "You are designing an AI request intake system for a hotel engineering company in Egypt called Triangle Black.

CONTEXT:
- They receive maintenance requests via WhatsApp, Email, site visits
- Requests are in Arabic and English mixed
- Examples: 'HVAC unit in room 412 not cooling', 'AC broken lobby', 'مكيف الغرفة 204 لا يبرد'
- They need to convert these to structured work orders automatically

EXISTING SYSTEM:
- work_orders table: hotel_id, title, type, priority, status, technician_id, asset_id
- assets table: name, category, location_description, serial_number
- technicians table: name, specializations, current_work_orders, max_work_orders
- Ollama running locally with qwen2.5-coder:7b
- FastAPI backend on port 8001 (AI Engine)

DESIGN A COMPLETE AI REQUEST INTAKE PIPELINE:
1. Input: raw text in Arabic/English
2. Extraction: what fields to extract (type, priority, location, asset_type)
3. Matching: how to match to existing assets in database
4. Output: structured JSON for work order creation
5. API endpoint design: POST /api/v1/ai/intake/request

Include:
- Sample Python code for the Ollama call
- The prompt template for structured extraction
- The FastAPI endpoint signature
- How to handle Arabic text" \
"$OUT/task_10_01_ai_intake.md"

# TASK 10-02: Inventory Intelligence System
log "[10-02] Inventory Intelligence System..."
ask "You are designing an inventory intelligence system for a hotel engineering company.

CURRENT DATABASE:
- inventory_items: id, hotel_id, item_code, name, category, unit_of_measure, min_stock, max_stock, reorder_qty
- stock_balances: item_id, warehouse_id, quantity
- warehouses: id, hotel_id, name, location
- inventory_vendors: id, name, category, contact_person, phone, email, payment_terms

BUSINESS NEED:
When a work order is created for type='hvac' at 'Room 412':
1. System should automatically check if required parts are in stock
2. If YES: reserve parts and link to work order
3. If NO: suggest vendors who supply that category and create purchase request

DESIGN:
1. API endpoint: POST /api/v1/ai/inventory/check
   Input: {work_order_type, asset_category, description}
   Output: {items_available: [], items_missing: [], vendors_suggested: []}

2. The matching logic: how to map work_order_type to inventory categories
   (e.g., hvac -> ['HVAC Parts', 'Refrigerant', 'Filters'])

3. Vendor recommendation: how to score vendors by category + rating + lead_time

4. Auto PR creation: when to automatically create purchase request vs notify human

Write the complete FastAPI endpoint code." \
"$OUT/task_10_02_inventory_intelligence.md"

# TASK 10-03: Smart Dispatch System
log "[10-03] Smart Dispatch Design..."
ask "Design a smart technician dispatch system for hotel engineering.

AVAILABLE DATA:
- technicians: id, name, specializations (JSON array), max_work_orders, current_work_orders, hotel_id, is_active
- work_orders: type (hvac/electrical/plumbing/mechanical/civil), priority, hotel_id, asset_id
- assets: category, location_description, hotel_id

DISPATCH RULES:
1. Match technician specialization to work order type
2. Prefer technicians with lowest current_work_orders
3. Prefer technicians assigned to same hotel_id
4. For critical priority: always pick most experienced in that type
5. For emergency: pick any available technician regardless of hotel

DESIGN:
1. API endpoint: POST /api/v1/ai/dispatch/recommend
   Input: {work_order_id, work_order_type, priority, hotel_id}
   Output: {recommended_technician_id, reason, alternatives: []}

2. Scoring algorithm (write the Python function):
   score = specialization_match * 0.4 + capacity_score * 0.3 + hotel_match * 0.3

3. How to handle: all technicians full (capacity 100%)
4. How to handle: no technician with matching specialization

Write the complete Python scoring function and FastAPI endpoint." \
"$OUT/task_10_03_smart_dispatch.md"

# TASK 10-04: Vendor Intelligence Database
log "[10-04] Vendor Intelligence Design..."
ask "Design a vendor intelligence database for Egyptian hotel engineering procurement.

CONTEXT:
- Triangle Black buys: HVAC parts, electrical equipment, plumbing fixtures, chemicals, safety equipment
- Egyptian suppliers: Carrier Egypt, ABB Egypt, Schneider Egypt, Grundfos Egypt, etc.
- Need to track: delivery reliability, price competitiveness, quality ratings, lead times
- Budget in EGP, typical PO: 50K to 500K EGP

EXISTING TABLES:
- inventory_vendors: id, name, category, phone, email, payment_terms, lead_time_days
- supplier_scorecards: exists but empty
- supplier_intelligence: exists but empty
- rfqs, rfq_vendor_quotes: exists with some data

DESIGN A VENDOR SCORING SYSTEM:
1. What 5 KPIs to track per vendor (delivery, quality, price, response, service)
2. How to calculate composite vendor score (0-100)
3. API: GET /api/v1/vendors/{id}/scorecard
4. How to use AI to suggest best vendor for a specific item category

Also design:
- Vendor comparison matrix for RFQ responses
- Automated price benchmarking
- Lead time prediction based on historical data

Write the Python scoring function and database schema additions." \
"$OUT/task_10_04_vendor_intelligence.md"

# TASK 10-05: Predictive Maintenance AI
log "[10-05] Predictive Maintenance AI..."
ask "Design a predictive maintenance AI system for hotel assets using Ollama (qwen2.5-coder:7b).

AVAILABLE DATA:
- assets: 46 records with category, name, manufacturer, model, service_frequency, criticality, status
- work_orders: 72 records with type, priority, started_at, completed_at, asset_id
- maintenance_plans: 30 PM plans with frequency, next_due_date, plan_type
- maintenance_history_records: exists

ASSET TYPES IN EGYPTIAN HOTELS:
- HVAC: Chillers, AHUs, FCUs, Cooling Towers (critical)
- Electrical: Generators, Switchboards, UPS (critical)
- Plumbing: Pumps, Water heaters (high)
- Elevators: Otis, Kone (critical)
- Pool: Pumps, Treatment systems (medium)

PREDICTIVE MAINTENANCE DESIGN:
1. Asset Health Score formula (0-100):
   - Days since last maintenance (weight: 30%)
   - Number of corrective WOs in last 90 days (weight: 40%)
   - Asset age estimate from installation date (weight: 20%)
   - Criticality multiplier (weight: 10%)

2. Failure prediction: if health score < 40, predict failure in X days

3. API endpoint: GET /api/v1/ai/maintenance/health-scores
   Returns: [{asset_id, asset_name, health_score, risk_level, predicted_failure_date, recommended_action}]

4. How to use Ollama to generate human-readable maintenance recommendations

Write the complete Python implementation." \
"$OUT/task_10_05_predictive_maintenance.md"

# TASK 10-06: Supply Chain Automation
log "[10-06] Supply Chain Automation..."
ask "Design supply chain automation for Triangle Black hotel engineering company in Egypt.

BUSINESS CYCLE:
1. Request arrives (WhatsApp/Email)
2. Work order created
3. Check inventory for required parts
4. If parts missing: create Purchase Request automatically
5. Get quotes from 3+ vendors (RFQ)
6. Compare quotes, select best
7. Create Purchase Order
8. Receive goods in warehouse
9. Dispatch technician with parts
10. Complete work, close WO, invoice hotel

CURRENT DATABASE STATE:
- purchase_requests: 1 record (needs automation)
- purchase_orders: 21 records
- rfqs: 8 records
- inventory_vendors: 13 vendors by category
- goods_receipts: 0 records (mobile receiving needed)

DESIGN THE AUTOMATION:
1. Auto-PR trigger: when inventory check fails, what data to auto-populate in PR
2. Auto-RFQ: when PR approved, how to auto-send to relevant vendors by category
3. Auto-PO: when all quotes received, scoring and auto-generate PO draft
4. Mobile receiving: what fields technician needs to confirm delivery on phone

Write the Python automation functions for steps 1-4.
Include the FastAPI endpoints:
- POST /api/v1/ai/supply/auto-pr (create PR from WO)
- POST /api/v1/ai/supply/auto-rfq/{pr_id} (send RFQ to vendors)
- GET /api/v1/ai/supply/quote-comparison/{rfq_id} (compare quotes)" \
"$OUT/task_10_06_supply_automation.md"

# TASK 10-07: AI Operations Dashboard
log "[10-07] AI Operations Dashboard..."
ask "Design an AI-powered operations dashboard for a hotel engineering company manager.

The dashboard should be the BRAIN of operations - showing what needs attention NOW.

AVAILABLE REAL-TIME DATA:
- 72 work orders (open, in_progress, completed, cancelled)
- 25 technicians with current capacity
- 46 assets with maintenance schedules
- 30 PM plans with due dates
- 60 inventory items with stock levels
- 12 projects with phases and risks
- 13 pending approval items (quotes + PRs + POs)

DESIGN THE AI SIGNALS ENGINE:
What 10 automated signals should the system generate?
Examples:
- 'HVAC Chiller Unit 1 has 3 corrective WOs in 30 days - schedule PM now'
- 'Technician Mohamed Hassan at 90% capacity - redistribute WOs'
- 'Carrier Egypt has not responded to RFQ-2026-001 in 5 days'
- 'Pool chemical stock below minimum - auto-PR recommended'
- '3 contracts expiring in 30 days - renewal pipeline'

For each signal:
1. Data source (which table + query)
2. Threshold that triggers it
3. Recommended action
4. API endpoint to retrieve signals: GET /api/v1/ai/signals

Also design:
- Signal priority scoring (Critical/High/Medium)
- How to use Ollama to write human-readable signal messages in Arabic/English
- Real-time refresh strategy (polling interval)

Write the Python code for the signals engine." \
"$OUT/task_10_07_ai_dashboard.md"

# TASK 10-08: Mobile Field App Design
log "[10-08] Mobile Field App Design..."
ask "Design the mobile-first field technician interface for a hotel engineering company.

TECHNICIAN DAILY WORKFLOW:
1. Login -> See my assigned work orders for today
2. Navigate to hotel/room/equipment location
3. Scan QR code on asset to pull maintenance history
4. Execute work: check checklist items, take photos, note parts used
5. Record parts consumed from inventory (barcode scan or search)
6. Complete work order with notes
7. Request supervisor approval for parts not in inventory

TECHNICAL CONSTRAINTS:
- Portal is Next.js 16 (responsive, works on mobile)
- Must work on Android phone with Chrome browser
- May have poor WiFi at hotel sites
- Backend is FastAPI with PostgreSQL
- Images can be stored as base64 or file upload

DESIGN FOR NEXT.JS MOBILE:
1. /operations/technicians/[id]/my-day page design
   - Today's WOs sorted by priority
   - Each WO shows: hotel, room, equipment, type
   - Status update buttons: Start, Complete, Need Parts

2. Work order execution page:
   - PM checklist (if PM type)
   - Photo capture (camera API)
   - Parts used: search inventory items
   - Notes/observations field
   - Completion timestamp

3. Quick parts request:
   - Search inventory
   - If found: deduct from stock
   - If not found: create emergency PR with 'urgent' flag

4. Offline consideration:
   - Which data to cache locally
   - Sync when connection restored

Design the React component structure and API calls needed." \
"$OUT/task_10_08_mobile_field.md"

log ""
log "======================================"
log "SPRINT 10 ANALYSIS COMPLETE"
log "======================================"
log ""
ls -la "$OUT/"*.md 2>/dev/null
log ""
log "NEXT STEPS:"
log "1. cat $OUT/task_10_01_ai_intake.md"
log "2. cat $OUT/task_10_02_inventory_intelligence.md"
log "3. Execute the best designs"

