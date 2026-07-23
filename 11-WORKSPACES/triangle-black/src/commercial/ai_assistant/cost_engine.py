"""
Triangle Black Cost Engine — Sprint 61
Computes WO costs, contract margins, and operational profitability.
All costs are estimates based on available data until time-tracking is added.
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
    wo_type   = (wo.get("type")     or "general").lower()
    priority  = (wo.get("priority") or "medium").lower()
    status    = (wo.get("status")   or "open").lower()

    hourly    = HOURLY_RATES.get(wo_type, 300)
    hours     = ESTIMATED_HOURS.get(priority, 2)

    # If WO has actual start/end times, use real duration
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
        "wo_id":         wo.get("id"),
        "wo_title":      wo.get("title", ""),
        "wo_type":       wo_type,
        "priority":      priority,
        "status":        status,
        "hours_estimated": round(hours, 1),
        "hourly_rate_egp": hourly,
        "labor_cost_egp":  labor_cost,
        "overhead_egp":    overhead_cost,
        "total_cost_egp":  total_cost,
    }


def compute_contract_profitability(contract: dict, wo_costs: list) -> dict:
    """Compute margin for a single contract from its linked WOs."""
    contract_id    = contract.get("id")
    contract_value = float(contract.get("contract_value") or 0)

    linked_costs   = [c for c in wo_costs if c.get("contract_id") == contract_id]
    total_wo_cost  = sum(c["total_cost_egp"] for c in linked_costs)
    gross_margin   = round(contract_value - total_wo_cost, 2)
    margin_pct     = round((gross_margin / contract_value * 100) if contract_value > 0 else 0, 1)

    return {
        "contract_id":      contract_id,
        "client_name":      contract.get("client_name", ""),
        "contract_value":   contract_value,
        "total_cost_egp":   round(total_wo_cost, 2),
        "gross_margin_egp": gross_margin,
        "margin_pct":       margin_pct,
        "wo_count":         len(linked_costs),
        "status":           "profitable" if gross_margin > 0 else "at_risk",
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
                "SELECT id, title, type, priority, status, "
                "technician_id, contract_id, asset_id, "
                "started_at, completed_at "
                "FROM work_orders"
            )).fetchall()
            wos = [dict(r._mapping) for r in wo_rows]
        except Exception as e:
            wos = []

        # Compute WO costs
        wo_costs = []
        for wo in wos:
            cost = compute_wo_cost(wo)
            cost["contract_id"] = wo.get("contract_id")
            wo_costs.append(cost)

        report["work_orders"] = wo_costs

        # Fetch contracts
        try:
            contract_rows = conn.execute(text(
                "SELECT id, client_name, status, "
                "total_value as contract_value, start_date, end_date "
                "FROM contracts WHERE status = 'active'"
            )).fetchall()
            contracts = [dict(r._mapping) for r in contract_rows]
        except Exception:
            contracts = []

        # Compute contract profitability
        contract_reports = []
        for c in contracts:
            try:
                value = float(str(c.get("contract_value") or 0).replace(",", ""))
                c["contract_value"] = value
            except Exception:
                c["contract_value"] = 0
            cp = compute_contract_profitability(c, wo_costs)
            contract_reports.append(cp)

        contract_reports.sort(key=lambda x: x["margin_pct"])
        report["contracts"] = contract_reports

        # Summary
        total_wo_cost   = sum(c["total_cost_egp"] for c in wo_costs)
        total_revenue   = sum(c["contract_value"]  for c in contract_reports)
        total_margin    = sum(c["gross_margin_egp"] for c in contract_reports)
        completed_costs = [c for c in wo_costs if c["status"] == "completed"]
        avg_wo_cost     = (
            sum(c["total_cost_egp"] for c in completed_costs) / len(completed_costs)
            if completed_costs else 0
        )

        report["summary"] = {
            "total_work_orders":   len(wo_costs),
            "total_wo_cost_egp":   round(total_wo_cost, 2),
            "avg_wo_cost_egp":     round(avg_wo_cost, 2),
            "total_contract_value": round(total_revenue, 2),
            "total_margin_egp":    round(total_margin, 2),
            "overall_margin_pct":  round(
                (total_margin / total_revenue * 100) if total_revenue > 0 else 0, 1
            ),
            "contracts_analyzed":  len(contract_reports),
            "at_risk_contracts":   sum(1 for c in contract_reports if c["status"] == "at_risk"),
        }

    return report
