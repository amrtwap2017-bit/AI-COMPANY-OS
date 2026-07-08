from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.commercial.quotation.models import Quote
from src.commercial.quotation.schemas import QuoteCreate, QuoteUpdate, QuoteResponse
from src.commercial.quotation.repository import QuoteRepository

router = APIRouter()

@router.post('/quotes/', response_model=QuoteResponse)
def create_quote(quote_data: QuoteCreate, db: Session = Depends(get_db)) -> QuoteResponse:
    quote_repo = QuoteRepository(db)
    quote = quote_repo.create(quote_data.dict())
    return QuoteResponse.from_orm(quote)

@router.get('/quotes/{id}', response_model=QuoteResponse)
def get_quote(id: int, db: Session = Depends(get_db)) -> QuoteResponse:
    quote_repo = QuoteRepository(db)
    quote = quote_repo.get(id)
    if not quote:
        raise HTTPException(status_code=404, detail='Quote not found')
    return QuoteResponse.from_orm(quote)

@router.put('/quotes/{id}', response_model=QuoteResponse)
def update_quote(id: int, quote_data: QuoteUpdate, db: Session = Depends(get_db)) -> QuoteResponse:
    quote_repo = QuoteRepository(db)
    quote = quote_repo.update(id, quote_data.dict())
    return QuoteResponse.from_orm(quote)

@router.delete('/quotes/{id}', status_code=204)
def delete_quote(id: int, db: Session = Depends(get_db)) -> None:
    quote_repo = QuoteRepository(db)
    quote_repo.delete(id)