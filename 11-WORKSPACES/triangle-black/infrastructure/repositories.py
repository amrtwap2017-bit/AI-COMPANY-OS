from sqlalchemy.orm import Session
from domain.entities import Item

class ItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Item).all()

    def search(self, query: str):
        return self.db.query(Item).filter(Item.name.contains(query)).all()

    def filter(self, criteria: dict):
        return self.db.query(Item).filter_by(**criteria).all()