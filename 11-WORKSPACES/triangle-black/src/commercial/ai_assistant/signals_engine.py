from sqlalchemy import create_engine, text
from datetime import datetime


def generate_signals(db_url: str) -> list:
    engine = create_engine(db_url)
    signals = []

    with engine.connect() as conn:

        try:
            r = conn.execute(text(
                "SELECT count(*) FROM work_orders "
                "WHERE status='open' AND priority='critical'"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "WO_CRITICAL_OPEN",
                    "title": f"{count} Critical Work Orders Open",
                    "message": f"{count} critical-priority work orders are still open and unassigned.",
                    "priority": "critical",
                    "category": "operations",
                    "count": count,
                    "recommended_action": "Assign available technicians immediately.",
                    "data_source": "work_orders"
                })
        except Exception:
            pass

        try:
            r = conn.execute(text(
                "SELECT count(*) FROM technicians "
                "WHERE is_active=true "
                "AND max_work_orders > 0 "
                "AND (current_work_orders::float / max_work_orders::float) >= 0.85"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "TECH_HIGH_CAPACITY",
                    "title": f"{count} Technicians Near Full Capacity",
                    "message": f"{count} active technicians are at 85 percent or above capacity.",
                    "priority": "high",
                    "category": "resources",
                    "count": count,
                    "recommended_action": "Redistribute work orders or bring in additional technicians.",
                    "data_source": "technicians"
                })
        except Exception:
            pass

        try:
            r = conn.execute(text(
                "SELECT count(*) FROM work_orders "
                "WHERE status='in_progress' "
                "AND updated_at < NOW() - INTERVAL '24 hours'"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "WO_STALLED",
                    "title": f"{count} Work Orders Stalled Over 24 Hours",
                    "message": f"{count} in-progress work orders have not been updated in over 24 hours.",
                    "priority": "high",
                    "category": "operations",
                    "count": count,
                    "recommended_action": "Contact assigned technicians for a status update.",
                    "data_source": "work_orders"
                })
        except Exception:
            pass

        try:
            r = conn.execute(text(
                "SELECT count(*) FROM assets "
                "WHERE status IN ('fault', 'breakdown', 'critical_fault')"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "ASSET_FAULT",
                    "title": f"{count} Assets in Fault State",
                    "message": f"{count} assets are currently in fault or breakdown status.",
                    "priority": "critical",
                    "category": "maintenance",
                    "count": count,
                    "recommended_action": "Dispatch technicians to all faulted assets immediately.",
                    "data_source": "assets"
                })
        except Exception:
            pass

        try:
            r = conn.execute(text(
                "SELECT count(*) FROM stock_balances sb "
                "JOIN inventory_items ii ON sb.item_id = ii.id "
                "WHERE sb.qty_on_hand < ii.min_stock AND ii.min_stock > 0"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "STOCK_BELOW_MIN",
                    "title": f"{count} Items Below Minimum Stock",
                    "message": f"{count} inventory items are below their minimum stock threshold.",
                    "priority": "high",
                    "category": "inventory",
                    "count": count,
                    "recommended_action": "Create purchase requests for all items below minimum.",
                    "data_source": "stock_balances"
                })
        except Exception:
            pass

        try:
            r = conn.execute(text(
                "SELECT count(*) FROM purchase_requests "
                "WHERE status='draft' "
                "AND created_at < NOW() - INTERVAL '3 days'"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "PR_PENDING_OLD",
                    "title": f"{count} Purchase Requests Awaiting Approval",
                    "message": f"{count} purchase requests have been in draft state for over 3 days.",
                    "priority": "medium",
                    "category": "procurement",
                    "count": count,
                    "recommended_action": "Review and approve or reject all pending purchase requests.",
                    "data_source": "purchase_requests"
                })
        except Exception:
            pass

        try:
            r = conn.execute(text(
                "SELECT count(*) FROM work_orders "
                "WHERE status='open' "
                "AND due_date IS NOT NULL "
                "AND due_date < NOW()"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "WO_OVERDUE",
                    "title": f"{count} Work Orders Past Due Date",
                    "message": f"{count} open work orders have passed their due date.",
                    "priority": "high",
                    "category": "operations",
                    "count": count,
                    "recommended_action": "Escalate overdue work orders to operations manager.",
                    "data_source": "work_orders"
                })
        except Exception:
            pass


        try:
            r = conn.execute(text(
                "SELECT count(DISTINCT a.id) FROM assets a "
                "WHERE (SELECT count(*) FROM work_orders wo "
                "WHERE wo.asset_id = a.id "
                "AND wo.type = 'corrective' "
                "AND wo.created_at > NOW() - INTERVAL '30 days') > 2"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "PREVENTIVE_PM_NEEDED",
                    "title": f"{count} Assets Need Preventive Maintenance",
                    "message": (
                        f"{count} assets have had more than 2 corrective work orders "
                        "in the last 30 days, indicating a need for preventive maintenance."
                    ),
                    "priority": "high",
                    "category": "maintenance",
                    "count": count,
                    "recommended_action": (
                        "Schedule preventive maintenance for all high-frequency "
                        "corrective assets immediately."
                    ),
                    "data_source": "assets + work_orders"
                })
        except Exception:
            pass


        try:
            r = conn.execute(text(
                "SELECT count(*) FROM contracts "
                "WHERE end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'"
            ))
            count = r.scalar() or 0
            if count > 0:
                signals.append({
                    "signal_id": "CONTRACTS_EXPIRING",
                    "title": f"{count} Contracts Expiring in 30 Days",
                    "message": (
                        f"{count} contracts are expiring within the next 30 days "
                        "and require renewal action."
                    ),
                    "priority": "high",
                    "category": "commercial",
                    "count": count,
                    "recommended_action": (
                        "Review expiring contracts and initiate renewal pipeline immediately."
                    ),
                    "data_source": "contracts"
                })
        except Exception:
            pass


        try:
            from src.commercial.ai_assistant.cost_engine import generate_cost_report
            DB_URL = "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"
            cost_report = generate_cost_report(DB_URL)
            at_risk_contracts = cost_report.get("summary", {}).get("at_risk_contracts", 0)
            if at_risk_contracts > 0:
                signals.append({
                    "signal_id": "COST_OVERRUN",
                    "title": f"{at_risk_contracts} Contracts With Cost Overrun",
                    "message": (
                        f"{at_risk_contracts} contracts have allocated costs "
                        "exceeding their contract value."
                    ),
                    "priority": "high",
                    "category": "commercial",
                    "count": at_risk_contracts,
                    "recommended_action": (
                        "Review contract profitability at /analytics/costs "
                        "and adjust resource allocation."
                    ),
                    "data_source": "cost_engine + contracts"
                })
        except Exception:
            pass

    priority_order = {"critical": 0, "high": 1, "medium": 2}
    return sorted(signals, key=lambda x: priority_order.get(x.get("priority", "medium"), 3))


def get_signal_summary(signals: list) -> dict:
    return {
        "critical": sum(1 for s in signals if s.get("priority") == "critical"),
        "high":     sum(1 for s in signals if s.get("priority") == "high"),
        "medium":   sum(1 for s in signals if s.get("priority") == "medium"),
        "total":    len(signals)
    }
