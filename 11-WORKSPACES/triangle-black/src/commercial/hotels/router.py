from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.auth import get_current_user
from src.core.database import get_db
from .models import Hotel
from .schemas import HotelCreate, HotelUpdate, HotelResponse
from .repository import HotelRepository


router = APIRouter()


@router.post("/hotels", response_model=HotelResponse)
def create_hotel(hotel: HotelCreate,
                   db: Session = Depends(get_db),
                   current_user: dict = Depends(get_current_user)) -> HotelResponse:
    hotel_data = hotel.dict()
    hotel_repo = HotelRepository(db)
    new_hotel = hotel_repo.create(hotel_data)
    return HotelResponse.from_orm(new_hotel)


@router.get("/hotels", response_model=list[HotelResponse])
def list_hotels(db: Session = Depends(get_db),
                 current_user: dict = Depends(get_current_user)) -> list[HotelResponse]:
    hotel_repo = HotelRepository(db)
    hotels = hotel_repo.list()
    return [HotelResponse.from_orm(hotel) for hotel in hotels]


@router.get("/hotels/{hotel_id}", response_model=HotelResponse)
def get_hotel(hotel_id: str,
               db: Session = Depends(get_db),
               current_user: dict = Depends(get_current_user)) -> HotelResponse:
    hotel_repo = HotelRepository(db)
    hotel = hotel_repo.get(hotel_id)
    if not hotel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Hotel not found")
    return HotelResponse.from_orm(hotel)


@router.patch("/hotels/{hotel_id}", response_model=HotelResponse)
def update_hotel(hotel_id: str,
                 hotel_update: HotelUpdate,
                 db: Session = Depends(get_db),
                 current_user: dict = Depends(get_current_user)) -> HotelResponse:
    hotel_repo = HotelRepository(db)
    updated_hotel = hotel_repo.update(hotel_id, hotel_update.dict())
    if not updated_hotel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Hotel not found")
    return HotelResponse.from_orm(updated_hotel)


@router.delete("/hotels/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel(hotel_id: str,
                 db: Session = Depends(get_db),
                 current_user: dict = Depends(get_current_user)) -> None:
    hotel_repo = HotelRepository(db)
    if not hotel_repo.delete(hotel_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Hotel not found")