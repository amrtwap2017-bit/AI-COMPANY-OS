from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import EmployeeRepository
from .schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    hotel_id: str = Depends(get_hotel_id),
    skip: int = 0, limit: int = 100,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return EmployeeRepository(db).list(hotel_id, skip, limit, department, status)

@router.post("/", response_model=EmployeeResponse, status_code=201)
def create_employee(
    payload: EmployeeCreate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return EmployeeRepository(db).create(payload.model_dump(exclude_none=True), hotel_id)

@router.get("/{emp_id}", response_model=EmployeeResponse)
def get_employee(
    emp_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    obj = EmployeeRepository(db).get(emp_id, hotel_id)
    if not obj: raise HTTPException(404, "Employee not found")
    return obj

@router.patch("/{emp_id}", response_model=EmployeeResponse)
def update_employee(
    emp_id: str,
    payload: EmployeeUpdate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    obj = EmployeeRepository(db).update(emp_id, payload.model_dump(exclude_none=True), hotel_id)
    if not obj: raise HTTPException(404, "Employee not found")
    return obj

@router.delete("/{emp_id}", status_code=204)
def delete_employee(
    emp_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    if not EmployeeRepository(db).delete(emp_id, hotel_id):
        raise HTTPException(404, "Employee not found")
