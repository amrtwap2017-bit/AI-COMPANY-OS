from sqlalchemy.orm import Session
from infrastructure.database import get_db

def get_repository(db: Session = Depends(get_db)):
    repository = ItemRepository(db)
    try:
        yield repository
    finally:
        pass