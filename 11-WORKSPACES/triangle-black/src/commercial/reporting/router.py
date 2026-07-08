"""
Report FastAPI router
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import ReportCreate, ReportUpdate, ReportResponse
from .repository import ReportRepository

router = APIRouter(prefix="/reports", tags=["reports"])


def get_db():
    raise NotImplementedError("Configure DB session in app factory")


@router.post("/", response_model=ReportResponse, status_code=201)
def create(payload: ReportCreate, db: Session = Depends(get_db)):
    return ReportRepository(db).create(payload.model_dump())


@router.get("/", response_model=List[ReportResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ReportRepository(db).list(skip=skip, limit=limit)


@router.get("/{report_id}", response_model=ReportResponse)
def get(report_id: str, db: Session = Depends(get_db)):
    obj = ReportRepository(db).get(report_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Report not found")
    return obj


@router.patch("/{report_id}", response_model=ReportResponse)
def update(report_id: str, payload: ReportUpdate, db: Session = Depends(get_db)):
    obj = ReportRepository(db).update(report_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Report not found")
    return obj


@router.delete("/{report_id}", status_code=204)
def delete(report_id: str, db: Session = Depends(get_db)):
    if not ReportRepository(db).delete(report_id):
        raise HTTPException(status_code=404, detail="Report not found")
