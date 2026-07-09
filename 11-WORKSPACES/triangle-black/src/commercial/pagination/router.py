from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import Query
from .models import PaginatedResponse
from .schemas import PaginatedResponseCreate, PaginatedResponseUpdate, PaginatedResponseResponse
from src.core.auth import get_current_user
from src.core.database import get_db
from src.core.pagination import paginate


test_router = APIRouter()

@test_router.post(
    "/api/v1/paginated_responses",
    response_model=PaginatedResponseResponse,
)
def create_paginated_response(
    paginated_response_create: PaginatedResponseCreate,
    db: Session = Depends(get_db),
):
    return PaginatedResponseRepository(db).create(paginated_response_create.dict())

@test_router.get(
    "/api/v1/paginated_responses",
    response_model=PaginatedResponseResponse,
)
def get_paginated_response(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=0, le=100),
    db: Session = Depends(get_db),
):
    paginated_response_list = PaginatedResponseRepository(db).list(skip=skip, limit=limit)
    total_count = len(paginated_response_list)
    return PaginatedResponseResponse(
        id=str(uuid.uuid4()),
        hotel_id="tb-default-hotel-000000000001",
        data=[response.data for response in paginated_response_list],
        skip=skip,
        limit=limit,
        total_count=total_count,
    )

@test_router.put(
    "/api/v1/paginated_responses/{paginated_response_id}",
    response_model=PaginatedResponseResponse,
)
def update_paginated_response(
    paginated_response_id: str,
    paginated_response_update: PaginatedResponseUpdate,
    db: Session = Depends(get_db),
):
    paginated_response = PaginatedResponseRepository(db).get(paginated_response_id)
    if not paginated_response:
        raise HTTPException(status_code=404, detail="Paginated Response not found")
    updated_paginated_response = PaginatedResponseRepository(db).update(
        paginated_response_id,
        paginated_response_update.dict(exclude_unset=True),
    )
    return PaginatedResponseResponse(
        id=updated_paginated_response.id,
        hotel_id="tb-default-hotel-000000000001",
        data=[response.data for response in updated_paginated_response],
        skip=updated_paginated_response.skip,
        limit=updated_paginated_response.limit,
        total_count=len(updated_paginated_response),
    )

@test_router.delete(
    "/api/v1/paginated_responses/{paginated_response_id}",
)
def delete_paginated_response(
    paginated_response_id: str,
    db: Session = Depends(get_db),
):
    if not PaginatedResponseRepository(db).delete(paginated_response_id):
        raise HTTPException(status_code=404, detail="Paginated Response not found")
    return {"detail": "Paginated Response deleted"}