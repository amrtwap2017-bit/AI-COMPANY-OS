from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.invoices.schemas import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from src.commercial.invoices.repository import InvoiceRepository

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("/", summary="List invoices")
def list_invoices(db = Depends(get_db)):
    try:
        from sqlalchemy import text
        rows = db.execute(text(
            "SELECT id, invoice_number, total_amount, status, due_date, created_at FROM invoices"
        )).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception as e:
        return []

@router.post("/", response_model=InvoiceResponse, status_code=201)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    invoice_data = payload.dict()
    invoice_data["hotel_id"] = hotel_id
    return InvoiceRepository(db).create_invoice(invoice_data)

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    invoice = InvoiceRepository(db).get_invoice(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail='Invoice not found')
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: str,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    invoice_data = payload.dict(exclude_unset=True)
    return InvoiceRepository(db).update_invoice(invoice_id, invoice_data)

@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    if not InvoiceRepository(db).delete_invoice(invoice_id):
        raise HTTPException(status_code=404, detail='Invoice not found')
import uuid, datetime


# ── S71-02: Invoice Payment Tracking (Program I) ──────────────────────────────

def _ensure_payment_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS invoice_payments (
            id              VARCHAR(36) PRIMARY KEY,
            invoice_id      VARCHAR(36) NOT NULL,
            amount          NUMERIC(15,2) NOT NULL,
            currency        VARCHAR(10) DEFAULT 'EGP',
            payment_method  VARCHAR(50),
            reference_no    VARCHAR(100),
            paid_by         VARCHAR(36),
            payment_date    TIMESTAMP NOT NULL,
            notes           TEXT,
            created_at      TIMESTAMP NOT NULL
        )
    """))
    db.commit()

@router.post("/{invoice_id}/payment", summary="Record invoice payment")
def record_payment(invoice_id: str, data: dict, db: Session = Depends(get_db)):
    """Record a payment against an invoice. Partial payments supported."""
    row = db.execute(
        text("SELECT * FROM invoices WHERE id = :id"), {"id": invoice_id}
    ).fetchone()
    if not row:
        raise HTTPException(404, "Invoice not found")

    inv = row_to_dict(row)
    amount = float(data.get("amount") or 0)
    if amount <= 0:
        raise HTTPException(400, "amount must be > 0")

    _ensure_payment_table(db)
    payment_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()

    db.execute(text("""
        INSERT INTO invoice_payments
            (id, invoice_id, amount, currency, payment_method, reference_no,
             paid_by, payment_date, notes, created_at)
        VALUES
            (:id, :invoice_id, :amount, :currency, :method, :ref,
             :paid_by, :payment_date, :notes, :created_at)
    """), {
        "id":           payment_id,
        "invoice_id":   invoice_id,
        "amount":       amount,
        "currency":     data.get("currency", "EGP"),
        "method":       data.get("payment_method", "bank_transfer"),
        "ref":          data.get("reference_no", ""),
        "paid_by":      data.get("paid_by", ""),
        "payment_date": data.get("payment_date", now),
        "notes":        data.get("notes", ""),
        "created_at":   now,
    })

    # Check if fully paid
    total_paid_row = db.execute(text(
        "SELECT COALESCE(sum(amount),0) as paid FROM invoice_payments WHERE invoice_id = :id"
    ), {"id": invoice_id}).fetchone()
    total_paid = float(row_to_dict(total_paid_row).get("paid") or 0)
    invoice_total = float(inv.get("total_amount") or 0)

    new_status = inv.get("status")
    if total_paid >= invoice_total:
        new_status = "paid"
    elif total_paid > 0:
        new_status = "partially_paid"

    if new_status != inv.get("status"):
        db.execute(text(
            "UPDATE invoices SET status = :s WHERE id = :id"
        ), {"s": new_status, "id": invoice_id})

    db.commit()

    return {
        "success":      True,
        "payment_id":   payment_id,
        "invoice_id":   invoice_id,
        "amount_paid":  amount,
        "total_paid":   total_paid,
        "invoice_total": invoice_total,
        "outstanding":  max(0, invoice_total - total_paid),
        "invoice_status": new_status,
        "currency":     "EGP",
        "message":      f"Payment of {amount:,.0f} EGP recorded",
    }

@router.get("/{invoice_id}/payments", summary="Invoice payment history")
def get_invoice_payments(invoice_id: str, db: Session = Depends(get_db)):
    """All payments made against an invoice."""
    try:
        _ensure_payment_table(db)
        rows = db.execute(text("""
            SELECT * FROM invoice_payments
            WHERE invoice_id = :id
            ORDER BY payment_date DESC
        """), {"id": invoice_id}).fetchall()
        payments = [row_to_dict(r) for r in rows]
        total = sum(float(p.get("amount") or 0) for p in payments)
    except Exception as e:
        return {"payments": [], "total_paid": 0, "error": str(e)}

    # Get invoice details
    inv_row = db.execute(
        text("SELECT id, total_amount, status FROM invoices WHERE id = :id"),
        {"id": invoice_id}
    ).fetchone()
    inv = row_to_dict(inv_row) if inv_row else {}

    return {
        "invoice_id":    invoice_id,
        "invoice_total": float(inv.get("total_amount") or 0),
        "total_paid":    round(total, 2),
        "outstanding":   round(float(inv.get("total_amount") or 0) - total, 2),
        "status":        inv.get("status"),
        "payments":      payments,
        "currency":      "EGP",
    }

@router.get("/payment-summary", summary="Overall invoice payment summary")
def payment_summary(db: Session = Depends(get_db)):
    """Finance overview — total invoiced, collected, outstanding."""
    try:
        inv_row = db.execute(text("""
            SELECT
                count(*) as total,
                COALESCE(sum(total_amount),0) as total_invoiced,
                sum(CASE WHEN status='paid' THEN total_amount ELSE 0 END) as collected,
                sum(CASE WHEN status IN ('unpaid','overdue','partially_paid')
                         THEN total_amount ELSE 0 END) as outstanding
            FROM invoices
        """)).fetchone()
        d = row_to_dict(inv_row)
    except Exception:
        d = {"total":0,"total_invoiced":0,"collected":0,"outstanding":0}

    try:
        _ensure_payment_table(db)
        pay_row = db.execute(text(
            "SELECT COALESCE(sum(amount),0) as total_payments FROM invoice_payments"
        )).fetchone()
        actual_collected = float(row_to_dict(pay_row).get("total_payments") or 0)
    except Exception:
        actual_collected = float(d.get("collected") or 0)

    total_invoiced = float(d.get("total_invoiced") or 0)
    collection_rate = round(actual_collected / total_invoiced * 100, 1) if total_invoiced > 0 else 0

    return {
        "total_invoices":     int(d.get("total") or 0),
        "total_invoiced_egp": round(total_invoiced, 2),
        "collected_egp":      round(actual_collected, 2),
        "outstanding_egp":    round(total_invoiced - actual_collected, 2),
        "collection_rate_pct": collection_rate,
        "currency":           "EGP",
        "generated_at":       datetime.datetime.utcnow().isoformat(),
    }
