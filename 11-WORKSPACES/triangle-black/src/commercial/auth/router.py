"""
User FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from .schemas import UserCreate, UserUpdate, UserResponse
from .repository import UserRepository

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=201)
def create(payload: UserCreate, db: Session = Depends(get_db)):
    return UserRepository(db).create(payload.model_dump())


@router.get("/", response_model=List[UserResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return UserRepository(db).list(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
def get(user_id: str, db: Session = Depends(get_db)):
    obj = UserRepository(db).get(user_id)
    if not obj:
        raise HTTPException(status_code=404, detail="User not found")
    return obj


@router.patch("/{user_id}", response_model=UserResponse)
def update(user_id: str, payload: UserUpdate, db: Session = Depends(get_db)):
    obj = UserRepository(db).update(user_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="User not found")
    return obj


@router.delete("/{user_id}", status_code=204)
def delete(user_id: str, db: Session = Depends(get_db)):
    if not UserRepository(db).delete(user_id):
        raise HTTPException(status_code=404, detail="User not found")
