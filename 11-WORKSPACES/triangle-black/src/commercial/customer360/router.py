from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/customer-360", tags=["customer-360"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def rows(result): return [row_to_dict(r) for r in result]

@router.get("/{customer_id}")
def get_customer_360(
    customer_id: str,
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Full customer journey: Lead → Quote → Contract → WOs → Invoices → CS
    Identifies customer by: lead.id, contract.client_name, or company name
    """
    result = {}

    # 1. Find the lead
    lead = row_to_dict(db.execute(text(
        "SELECT * FROM leads WHERE id=:id OR company_name ILIKE :name LIMIT 1"
    ), {"id": customer_id, "name": f"%{customer_id}%"}).fetchone())
    result["lead"] = lead

    company = lead.get("company_name", customer_id)

    # 2. Find contracts
    result["contracts"] = rows(db.execute(text(
        "SELECT * FROM contracts WHERE client_name ILIKE :c OR lead_id=:lid ORDER BY created_at DESC"
    ), {"c": f"%{company}%", "lid": customer_id}).fetchall())

    # 3. Work orders linked to contracts
    contract_ids = [c["id"] for c in result["contracts"] if c.get("id")]
    if contract_ids:
        placeholders = ",".join([f"'{cid}'" for cid in contract_ids[:10]])
        result["work_orders"] = rows(db.execute(text(
            f"SELECT * FROM work_orders WHERE contract_id IN ({placeholders}) ORDER BY created_at DESC LIMIT 20"
        )).fetchall())
    else:
        result["work_orders"] = []

    # 4. Invoices
    result["invoices"] = rows(db.execute(text(
        "SELECT * FROM invoices WHERE client_name ILIKE :c ORDER BY created_at DESC LIMIT 10"
    ), {"c": f"%{company}%"}).fetchall())

    # 5. CS Health
    result["cs_health"] = row_to_dict(db.execute(text(
        "SELECT * FROM customer_health_scores WHERE client_name ILIKE :c ORDER BY recorded_at DESC LIMIT 1"
    ), {"c": f"%{company}%"}).fetchone())

    # 6. Summary metrics
    result["summary"] = {
        "company": company,
        "total_contracts": len(result["contracts"]),
        "active_contracts": len([c for c in result["contracts"] if c.get("status") == "active"]),
        "total_work_orders": len(result["work_orders"]),
        "open_work_orders": len([w for w in result["work_orders"] if w.get("status") in ["open","in_progress"]]),
        "total_invoiced": sum(float(i.get("amount",0) or 0) for i in result["invoices"]),
        "health_score": result["cs_health"].get("health_score", 0),
    }

    return result

@router.get("/")
def list_customers(
    hotel_id: str = Query(default=None),
    limit: int = Query(default=50),
    db: Session = Depends(get_db)
):
    """List all customers with their contract summary"""
    q = """
    SELECT
        c.client_name as company,
        COUNT(DISTINCT c.id) as total_contracts,
        SUM(c.total_value) as total_value,
        MAX(c.end_date) as last_contract_end,
        SUM(CASE WHEN c.status='active' THEN 1 ELSE 0 END) as active_contracts
    FROM contracts c
    WHERE 1=1
    GROUP BY c.client_name
    ORDER BY total_contracts DESC
    LIMIT :limit
    """
    p = {"limit": limit}
    if hotel_id:
        q = q.replace("WHERE 1=1", "WHERE c.hotel_id=:hid")
        p["hid"] = hotel_id
    try:
        return rows(db.execute(text(q), p).fetchall())
    except Exception as e:
        return []
