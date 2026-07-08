from sqlalchemy.orm import Session
from src.commercial.quotation.models import Quote

class QuoteRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, quote_data: dict) -> Quote:
        quote = Quote(**quote_data)
        self.db.add(quote)
        self.db.commit()
        self.db.refresh(quote)
        return quote

    def get(self, quote_id: int) -> Quote:
        return self.db.query(Quote).filter(Quote.id == quote_id).first()

    def list(self) -> list[Quote]:
        return self.db.query(Quote).all()

    def update(self, quote_id: int, quote_data: dict) -> Quote:
        quote = self.get(quote_id)
        for key, value in quote_data.items():
            setattr(quote, key, value)
        self.db.commit()
        self.db.refresh(quote)
        return quote

    def delete(self, quote_id: int) -> None:
        quote = self.get(quote_id)
        self.db.delete(quote)
        self.db.commit()