### AI Signals Engine Design

#### 10 Automated Signals

1. **HVAC Chiller Unit 1 has 3 corrective WOs in 30 days - schedule PM now**
   - **Data Source:** `work_orders` table, query to count open and in-progress WOs for HVAC Chiller Unit 1.
   - **Threshold:** 3 WOs in the last 30 days.
   - **Recommended Action:** Schedule Preventive Maintenance (PM) immediately.
   - **API Endpoint:** GET /api/v1/ai/signals/hvac_chiller_unit_1_pm

2. **Technician Mohamed Hassan at 90% capacity - redistribute WOs**
   - **Data Source:** `technicians` table, query to get current workload of technician Mohamed Hassan.
   - **Threshold:** Capacity exceeds 90%.
   - **Recommended Action:** Reassign some work orders to other technicians.
   - **API Endpoint:** GET /api/v1/ai/signals/technician_capacity

3. **Carrier Egypt has not responded to RFQ-2026-001 in 5 days**
   - **Data Source:** `rfqs` table, query to check the status of RFQ-2026-001.
   - **Threshold:** Not responded for more than 5 days.
   - **Recommended Action:** Follow up with Carrier Egypt.
   - **API Endpoint:** GET /api/v1/ai/signals/rfq_not_responded

4. **Pool chemical stock below minimum - auto-PR recommended**
   - **Data Source:** `inventory` table, query to check the stock level of pool chemicals.
   - **Threshold:** Stock level is below minimum threshold.
   - **Recommended Action:** Automatically create a Purchase Request (PR).
   - **API Endpoint:** GET /api/v1/ai/signals/pool_chemical_stock

5. **3 contracts expiring in 30 days - renewal pipeline**
   - **Data Source:** `contracts` table, query to count contracts expiring in the next 30 days.
   - **Threshold:** 3 or more contracts expiring in 30 days.
   - **Recommended Action:** Create a renewal pipeline and assign it to the appropriate team.
   - **API Endpoint:** GET /api/v1/ai/signals/expiring_contracts

6. **High risk project phase - monitor progress**
   - **Data Source:** `projects` table, query to check the risk level of current phases.
   - **Threshold:** High-risk phase identified.
   - **Recommended Action:** Monitor progress closely and adjust resources if necessary.
   - **API Endpoint:** GET /api/v1/ai/signals/high_risk_project_phase

7. **Pending approval items exceed 50%**
   - **Data Source:** `pending_approval` table, query to count pending items.
   - **Threshold:** More than 50% of total pending items.
   - **Recommended Action:** Review and approve pending items promptly.
   - **API Endpoint:** GET /api/v1/ai/signals/pending_approval_items

8. **Low stock on critical inventory item**
   - **Data Source:** `inventory` table, query to check the stock level of critical items.
   - **Threshold:** Stock level is below critical threshold.
   - **Recommended Action:** Create a Purchase Order (PO) immediately.
   - **API Endpoint:** GET /api/v1/ai/signals/critical_inventory_stock

9. **Technician John Doe has no available WOs for the next 24 hours**
   - **Data Source:** `technicians` table, query to check technician's availability.
   - **Threshold:** No available work orders for the next 24 hours.
   - **Recommended Action:** Assign some work orders or redistribute existing ones.
   - **API Endpoint:** GET /api/v1/ai/signals/technician_availability

10. **Maintenance schedule for HVAC Chiller Unit 2 is overdue**
    - **Data Source:** `maintenance_schedules` table, query to check the status of maintenance schedules.
    - **Threshold:** Maintenance schedule is overdue.
    - **Recommended Action:** Schedule immediate maintenance and notify relevant team.
    - **API Endpoint:** GET /api/v1/ai/signals/maintenance_schedule_overdue

#### Signal Priority Scoring
- **Critical:** Signals that require immediate attention (e.g., high-risk project phase, critical inventory stock).
- **High:** Signals that need urgent action but not immediately (e.g., technician capacity, pending approval items).
- **Medium:** Signals that are important but can be addressed later (e.g., low stock on non-critical items).

#### Using Ollama to Write Human-Readable Signal Messages
Ollama is a language model that can generate human-readable text based on the input data. You can use it to translate the signal messages into Arabic or English.

```python
import ollama

def generate_signal_message(signal_data):
    message = f"Signal: {signal_data['message']}\n"
    message += f"Action: {signal_data['action']}\n"
    message += f"Priority: {signal_data['priority']}"
    
    # Translate to Arabic using Ollama
    arabic_translation = ollama.translate(message, 'en', 'ar')
    return arabic_translation

# Example usage
signal_data = {
    "message": "HVAC Chiller Unit 1 has 3 corrective WOs in 30 days - schedule PM now",
    "action": "Schedule Preventive Maintenance (PM) immediately.",
    "priority": "Critical"
}
print(generate_signal_message(signal_data))
```

#### Real-Time Refresh Strategy
- **Polling Interval:**