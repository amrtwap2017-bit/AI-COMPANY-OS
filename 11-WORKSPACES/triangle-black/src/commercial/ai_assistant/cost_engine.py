"""
Triangle Black Cost Engine — Sprint 62 (Fixed)
Computes WO costs, contract margins, and operational profitability.
Since WOs do not have contract_id, costs are distributed proportionally
by contract value share within the same hotel.
"""
from __future__ import annotations
from sqlalchemy import create_engine, text
from datetime import datetime

# ── Cost Configuration (EGP) ──────────────────────────────────
HOURLY_RATES = {
    "hvac":        350,
    "electrical":  400,
    "plumbing":    300,
    "mechanical":  350,
    "civil":       250,
    "corrective":  300,
    "preventive":  200,
    "general":     250,
}

ESTIMATED_HOURS = {
    "critical": 8,
    "high":     4,
    "medium":   2,
    "low":      1,
}

OVERHEAD_RATE = 0.20


def compute_wo_cost(wo: dict) -> dict:
    """Estimate work order cost from type, priority, and duration."""
    wo_type  = (wo.get("type")     or "general").lower()
    priority = (wo.get("priority") or "medium").lower()
    status   = (wo.get("status")   or "open").lower()
    hourly   = HOURLY_RATES.get(wo_type, 300)
    hours    = ESTIMATED_HOURS.get(priority, 2)

    if wo.get("started_at") and wo.get("completed_at"):
        try:
            start = datetime.fromisoformat(str(wo["started_at"]).replace("Z", ""))
            end   = datetime.fromisoformat(str(wo["completed_at"]).replace("Z", ""))
            hours = max(0.5, (end - start).total_seconds() / 3600)
        except Exception:
            pass

    labor_cost    = round(hourly * hours, 2)
    overhead_cost = round(labor_cost * OVERHEAD_RATE, 2)
    total_cost    = round(labor_cost + overhead_cost, 2)

    return {
        "wo_id":            wo.get("id"),
        "wo_title":         wo.get("title", ""),
        "wo_type":          wo_type,
        "priority":         priority,
        "status":           status,
        "hotel_id":         wo.get("hotel_id"),
        "hours_estimated":  round(hours, 1),
        "hourly_rate_egp":  hourly,
        "labor_cost_egp":   labor_cost,
        "overhead_egp":     overhead_cost,
        "total_cost_egp":   total_cost,
    }


def generate_cost_report(db_url: str) -> dict:
    """Full cost and profitability report from live DB."""
    engine = create_engine(db_url)
    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "work_orders":  [],
        "contracts":    [],
        "summary":      {},
    }

    with engine.connect() as conn:
        # Fetch all WOs
        try:
            wo_rows = conn.execute(text(
                "SELECT id, title, type, priority, status, hotel_id, "
                "started_at, completed_at FROM work_orders"
            )).fetchall()
            wos = [dict(r._mapping) for r in wo_rows]
        except Exception:
            wos = []

        # Compute WO costs
        wo_costs = []
        for wo in wos:
            cost = compute_wo_cost(wo)
            wo_costs.append(cost)
        report["work_orders"] = wo_costs

        # Fetch contracts
        try:
            contract_rows = conn.execute(text(
                "SELECT id, title as client_name, status, hotel_id, "
                "total_value as contract_value, start_date, end_date "
                "FROM contracts WHERE status NOT IN ('cancelled', 'rejected')"
            )).fetchall()
            contracts = [dict(r._mapping) for r in contract_rows]
        except Exception:
            contracts = []

        # Group WO costs by hotel_id
        hotel_costs = {}
        for c in wo_costs:
            hid = c.get("hotel_id")
            if hid:
                hotel_costs[hid] = hotel_costs.get(hid, 0) + c["total_cost_egp"]

        # Group contracts by hotel_id and compute total value per hotel
        hotel_contract_values = {}
        for c in contracts:
            hid = c.get("hotel_id")
            val = float(c.get("contract_value") or 0)
            hotel_contract_values[hid] = hotel_contract_values.get(hid, 0) + val

        # Distribute WO costs proportionally by contract value share
        contract_reports = []
        for c in contracts:
            hid   = c.get("hotel_id")
            val   = float(c.get("contract_value") or 0)
            hotel_total_val   = hotel_contract_values.get(hid, 1) or 1
            hotel_total_cost  = hotel_costs.get(hid, 0)
            share = val / hotel_total_val if hotel_total_val > 0 else 0
            allocated_cost    = round(hotel_total_cost * share, 2)
            gross_margin      = round(val - allocated_cost, 2)
            margin_pct        = round((gross_margin / val * 100) if val > 0 else 0, 1)

            contract_reports.append({
                "contract_id":       c.get("id"),
                "client_name":       c.get("client_name", ""),
                "status":            c.get("status", ""),
                "contract_value":    val,
                "allocated_cost_egp": allocated_cost,
                "gross_margin_egp":  gross_margin,
                "margin_pct":        margin_pct,
                "profitability":     "profitable" if gross_margin > 0 else "at_risk",
            })

        contract_reports.sort(key=lambda x: x["margin_pct"])
        report["contracts"] = contract_reports

        # Summary
        total_wo_cost    = sum(c["total_cost_egp"] for c in wo_costs)
        total_revenue    = sum(c["contract_value"]  for c in contract_reports)
        total_margin     = sum(c["gross_margin_egp"] for c in contract_reports)
        completed        = [c for c in wo_costs if c["status"] == "completed"]
        avg_wo_cost      = (
            sum(c["total_cost_egp"] for c in completed) / len(completed)
            if completed else 0
        )
        at_risk = sum(1 for c in contract_reports if c["profitability"] == "at_risk")

        report["summary"] = {
            "total_work_orders":    len(wo_costs),
            "total_wo_cost_egp":    round(total_wo_cost, 2),
            "avg_wo_cost_egp":      round(avg_wo_cost, 2),
            "total_contract_value": round(total_revenue, 2),
            "total_margin_egp":     round(total_margin, 2),
            "overall_margin_pct":   round(
                (total_margin / total_revenue * 100) if total_revenue > 0 else 0, 1
            ),
            "contracts_analyzed":   len(contract_reports),
            "at_risk_contracts":    at_risk,
        }

    return report
