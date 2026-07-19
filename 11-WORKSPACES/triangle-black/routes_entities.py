"""
TB Admin — All Entity Routes
work_orders, technicians, assets, inventory, warehouses,
purchase_orders, contracts, invoices
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "triangle_black.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

router = APIRouter(prefix="/api/v1")

# ─── WORK ORDERS ──────────────────────────────────────────
@router.get("/work-orders")
def list_work_orders(status: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor()
    if status:
        cur.execute("SELECT * FROM work_orders WHERE status=? ORDER BY id DESC", (status,))
    else:
        cur.execute("SELECT * FROM work_orders ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"work_orders": rows, "total": len(rows)}

@router.get("/work-orders/{wo_id}")
def get_work_order(wo_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM work_orders WHERE id=?", (wo_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Work order not found")
    return dict(row)

class WorkOrderCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "open"
    priority: Optional[str] = "medium"
    assigned_to: Optional[str] = None
    asset_id: Optional[int] = None

@router.post("/work-orders")
def create_work_order(wo: WorkOrderCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO work_orders (title,description,status,priority,assigned_to,asset_id) VALUES (?,?,?,?,?,?)",
        (wo.title, wo.description, wo.status, wo.priority, wo.assigned_to, wo.asset_id)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, **wo.dict(), "message": "Work order created"}

@router.patch("/work-orders/{wo_id}")
def update_work_order(wo_id: int, updates: dict):
    conn = get_db()
    cur = conn.cursor()
    fields = ", ".join([f"{k}=?" for k in updates.keys()])
    values = list(updates.values()) + [wo_id]
    cur.execute(f"UPDATE work_orders SET {fields} WHERE id=?", values)
    conn.commit()
    conn.close()
    return {"id": wo_id, "updated": True}

# ─── TECHNICIANS ──────────────────────────────────────────
@router.get("/technicians")
def list_technicians(status: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor()
    if status:
        cur.execute("SELECT * FROM technicians WHERE status=? ORDER BY id", (status,))
    else:
        cur.execute("SELECT * FROM technicians ORDER BY id")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"technicians": rows, "total": len(rows)}

@router.get("/technicians/{tech_id}")
def get_technician(tech_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM technicians WHERE id=?", (tech_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Technician not found")
    return dict(row)

class TechnicianCreate(BaseModel):
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    specialty: Optional[str] = ""
    status: Optional[str] = "available"

@router.post("/technicians")
def create_technician(tech: TechnicianCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO technicians (name,email,phone,specialty,status) VALUES (?,?,?,?,?)",
        (tech.name, tech.email, tech.phone, tech.specialty, tech.status)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, **tech.dict(), "message": "Technician created"}

# ─── ASSETS ───────────────────────────────────────────────
@router.get("/assets")
def list_assets(status: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor()
    if status:
        cur.execute("SELECT * FROM assets WHERE status=? ORDER BY id", (status,))
    else:
        cur.execute("SELECT * FROM assets ORDER BY id")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"assets": rows, "total": len(rows)}

@router.get("/assets/{asset_id}")
def get_asset(asset_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM assets WHERE id=?", (asset_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Asset not found")
    return dict(row)

class AssetCreate(BaseModel):
    name: str
    asset_type: Optional[str] = ""
    serial_number: Optional[str] = ""
    location: Optional[str] = ""
    status: Optional[str] = "operational"

@router.post("/assets")
def create_asset(asset: AssetCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO assets (name,asset_type,serial_number,location,status) VALUES (?,?,?,?,?)",
        (asset.name, asset.asset_type, asset.serial_number, asset.location, asset.status)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, **asset.dict(), "message": "Asset created"}

# ─── INVENTORY ────────────────────────────────────────────
@router.get("/inventory-items")
def list_inventory(category: Optional[str] = None, warehouse_id: Optional[int] = None):
    conn = get_db()
    cur = conn.cursor()
    query = "SELECT * FROM inventory_items"
    params = []
    conditions = []
    if category:
        conditions.append("category=?")
        params.append(category)
    if warehouse_id:
        conditions.append("warehouse_id=?")
        params.append(warehouse_id)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY id"
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"items": rows, "total": len(rows)}

@router.get("/inventory-items/{item_id}")
def get_inventory_item(item_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM inventory_items WHERE id=?", (item_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return dict(row)

class InventoryItemCreate(BaseModel):
    name: str
    sku: Optional[str] = ""
    quantity: Optional[int] = 0
    unit_price: Optional[float] = 0.0
    category: Optional[str] = ""
    warehouse_id: Optional[int] = 1

@router.post("/inventory-items")
def create_inventory_item(item: InventoryItemCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO inventory_items (name,sku,quantity,unit_price,category,warehouse_id) VALUES (?,?,?,?,?,?)",
        (item.name, item.sku, item.quantity, item.unit_price, item.category, item.warehouse_id)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, **item.dict(), "message": "Inventory item created"}

# ─── WAREHOUSES ───────────────────────────────────────────
@router.get("/warehouses")
def list_warehouses():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM warehouses ORDER BY id")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"warehouses": rows, "total": len(rows)}

@router.get("/warehouses/{wh_id}")
def get_warehouse(wh_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM warehouses WHERE id=?", (wh_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return dict(row)

class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = ""
    capacity: Optional[int] = 1000
    status: Optional[str] = "active"

@router.post("/warehouses")
def create_warehouse(wh: WarehouseCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO warehouses (name,location,capacity,status) VALUES (?,?,?,?)",
        (wh.name, wh.location, wh.capacity, wh.status)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, **wh.dict(), "message": "Warehouse created"}

# ─── PURCHASE ORDERS ──────────────────────────────────────
@router.get("/purchase-orders")
def list_purchase_orders(status: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor()
    if status:
        cur.execute("SELECT * FROM purchase_orders WHERE status=? ORDER BY id DESC", (status,))
    else:
        cur.execute("SELECT * FROM purchase_orders ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"purchase_orders": rows, "total": len(rows)}

@router.get("/purchase-orders/{po_id}")
def get_purchase_order(po_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM purchase_orders WHERE id=?", (po_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return dict(row)

class PurchaseOrderCreate(BaseModel):
    po_number: Optional[str] = ""
    supplier: str
    total_amount: Optional[float] = 0.0
    status: Optional[str] = "pending"

@router.post("/purchase-orders")
def create_purchase_order(po: PurchaseOrderCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO purchase_orders (po_number,supplier,total_amount,status) VALUES (?,?,?,?)",
        (po.po_number, po.supplier, po.total_amount, po.status)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, **po.dict(), "message": "Purchase order created"}

# ─── CONTRACTS ────────────────────────────────────────────
@router.get("/contracts")
def list_contracts():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM contracts ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"contracts": rows, "total": len(rows)}

# ─── INVOICES ─────────────────────────────────────────────
@router.get("/invoices")
def list_invoices(status: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor()
    if status:
        cur.execute("SELECT * FROM invoices WHERE status=? ORDER BY id DESC", (status,))
    else:
        cur.execute("SELECT * FROM invoices ORDER BY id DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"invoices": rows, "total": len(rows)}

# ─── SEARCH (global) ──────────────────────────────────────
@router.get("/searches")
def global_search(q: str = ""):
    if not q:
        return {"results": [], "query": q}
    conn = get_db()
    cur = conn.cursor()
    results = []
    tables = [
        ("leads", ["name","email","company"]),
        ("assets", ["name","location","serial_number"]),
        ("technicians", ["name","specialty"]),
        ("work_orders", ["title","description"]),
    ]
    for table, cols in tables:
        for col in cols:
            cur.execute(f"SELECT id, '{table}' as type, {col} as label FROM {table} WHERE {col} LIKE ? LIMIT 5", (f"%{q}%",))
            rows = [dict(r) for r in cur.fetchall()]
            results.extend(rows)
    conn.close()
    return {"results": results, "total": len(results), "query": q}

# ─── NOTIFICATIONS (stub) ─────────────────────────────────
@router.get("/notifications")
def list_notifications():
    return {"notifications": [
        {"id": 1, "message": "Work order WO-003 is overdue", "type": "warning", "read": False},
        {"id": 2, "message": "Asset HVAC-002 scheduled for maintenance", "type": "info", "read": False},
        {"id": 3, "message": "Low stock: Bearing 6205 (8 remaining)", "type": "alert", "read": True},
    ], "unread": 2}

# ─── REPORTS (stub) ───────────────────────────────────────
@router.get("/reports")
def list_reports():
    return {"reports": [
        {"id": 1, "name": "Monthly Maintenance Report", "type": "maintenance", "period": "2024-01"},
        {"id": 2, "name": "Asset Health Summary", "type": "assets", "period": "2024-Q1"},
        {"id": 3, "name": "Technician Performance", "type": "hr", "period": "2024-01"},
    ], "total": 3}

# ─── DASHBOARD SUMMARY ────────────────────────────────────
@router.get("/dashboard")
def dashboard_summary():
    conn = get_db()
    cur = conn.cursor()
    def count(table, where="1=1"):
        cur.execute(f"SELECT COUNT(*) FROM {table} WHERE {where}")
        return cur.fetchone()[0]
    summary = {
        "work_orders": {
            "total": count("work_orders"),
            "open": count("work_orders", "status='open'"),
            "in_progress": count("work_orders", "status='in-progress'"),
            "urgent": count("work_orders", "priority='urgent'"),
        },
        "assets": {
            "total": count("assets"),
            "operational": count("assets", "status='operational'"),
            "maintenance": count("assets", "status='maintenance'"),
        },
        "technicians": {
            "total": count("technicians"),
            "available": count("technicians", "status='available'"),
            "on_job": count("technicians", "status='on-job'"),
        },
        "inventory": {
            "total_items": count("inventory_items"),
        },
        "leads": {
            "total": count("leads"),
            "qualified": count("leads", "status='qualified'"),
        },
    }
    conn.close()
    return summary
