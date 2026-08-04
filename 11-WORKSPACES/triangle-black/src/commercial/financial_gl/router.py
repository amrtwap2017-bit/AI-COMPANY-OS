from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import JournalRepository
from .schemas import JournalEntryCreate, JournalEntryResponse

router = APIRouter(prefix="/financial/gl", tags=["financial-gl"])

@router.get("/", response_model=List[JournalEntryResponse])
def list_entries(hotel_id: str = Depends(get_hotel_id), skip: int = 0, limit: int = 100,
                 db: Session = Depends(get_db)):
    return JournalRepository(db).list(hotel_id, skip, limit)

@router.post("/", response_model=JournalEntryResponse, status_code=201)
def create_entry(payload: JournalEntryCreate, hotel_id: str = Depends(get_hotel_id),
                 db: Session = Depends(get_db)):
    return JournalRepository(db).create(payload.model_dump(exclude_none=True), hotel_id)

@router.get("/summary")
def get_summary(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return JournalRepository(db).summary(hotel_id)

@router.get("/{entry_id}", response_model=JournalEntryResponse)
def get_entry(entry_id: str, hotel_id: str = Depends(get_hotel_id),
              db: Session = Depends(get_db)):
    obj = JournalRepository(db).get(entry_id, hotel_id)
    if not obj: raise HTTPException(404, "Entry not found")
    return obj


# ── Sprint-016: Chart of Accounts Endpoints ───────────────────────────────────
from src.commercial.financial_gl.schemas import (
    AccountCreate, AccountUpdate, AccountOut, AccountListResponse
)
from src.commercial.financial_gl.repository import (
    create_account, get_account, list_accounts, update_account
)


@router.get("/accounts/", response_model=AccountListResponse)
def list_chart_accounts(
    account_type: str = None,
    is_active: bool = None,
    limit: int = 100,
    offset: int = 0,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    total, items = list_accounts(db, hotel_id, account_type, is_active, limit, offset)
    return AccountListResponse(count=total, results=items)


@router.post("/accounts/", response_model=AccountOut, status_code=201)
def create_chart_account(
    data: AccountCreate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return create_account(db, hotel_id, data)


@router.get("/accounts/{account_id}", response_model=AccountOut)
def get_chart_account(
    account_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    acc = get_account(db, hotel_id, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc


@router.patch("/accounts/{account_id}", response_model=AccountOut)
def update_chart_account(
    account_id: str,
    data: AccountUpdate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    acc = update_account(db, hotel_id, account_id, data)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc
# ─────────────────────────────────────────────────────────────────────────────


# ── Sprint-025: Balance Sheet Report ─────────────────────────────────────────
from datetime import datetime as _bsdt


@router.get("/balance-sheet")
def get_balance_sheet(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Financial Balance Sheet aggregated from chart_of_accounts.
    Groups accounts by type: asset, liability, equity, revenue, expense.
    hotel_id from JWT — tenant-isolated.
    """
    from sqlalchemy import text as _t

    TYPES = ["asset", "liability", "equity", "revenue", "expense"]
    result = {}

    for acc_type in TYPES:
        try:
            rows = db.execute(_t("""
                SELECT account_code, account_name, account_type, is_active
                FROM chart_of_accounts
                WHERE hotel_id = :hid
                  AND account_type = :atype
                  AND is_active = TRUE
                ORDER BY account_code
            """), {"hid": hotel_id, "atype": acc_type}).fetchall()

            accounts = [
                {
                    "code":    str(r[0]),
                    "name":    str(r[1]),
                    "type":    str(r[2]),
                    "balance": 0.0,
                }
                for r in rows
            ]
            result[acc_type] = {
                "total":    0.0,
                "count":    len(accounts),
                "accounts": accounts,
            }
        except Exception as e:
            result[acc_type] = {"total": 0.0, "count": 0, "accounts": [], "error": str(e)}

    # Net income = revenue - expenses
    try:
        rev_total  = result.get("revenue", {}).get("total", 0.0)
        exp_total  = result.get("expense", {}).get("total", 0.0)
        net_income = round(rev_total - exp_total, 2)
    except Exception:
        net_income = 0.0

    # Total assets = assets (simple — no contra accounts)
    total_assets = result.get("asset", {}).get("total", 0.0)
    total_liab   = result.get("liability", {}).get("total", 0.0)
    total_equity = result.get("equity", {}).get("total", 0.0)

    return {
        "generated_at":   _bsdt.utcnow().isoformat(),
        "hotel_id":       hotel_id,
        "assets":         result.get("asset",     {"total": 0, "count": 0, "accounts": []}),
        "liabilities":    result.get("liability",  {"total": 0, "count": 0, "accounts": []}),
        "equity":         result.get("equity",     {"total": 0, "count": 0, "accounts": []}),
        "revenue":        result.get("revenue",    {"total": 0, "count": 0, "accounts": []}),
        "expenses":       result.get("expense",    {"total": 0, "count": 0, "accounts": []}),
        "net_income":     net_income,
        "total_assets":   total_assets,
        "total_liabilities_equity": round(total_liab + total_equity, 2),
        "summary": {
            "asset_count":     result.get("asset",    {}).get("count", 0),
            "liability_count": result.get("liability", {}).get("count", 0),
            "equity_count":    result.get("equity",   {}).get("count", 0),
            "revenue_count":   result.get("revenue",  {}).get("count", 0),
            "expense_count":   result.get("expense",  {}).get("count", 0),
        }
    }
# ─────────────────────────────────────────────────────────────────────────────
