from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from infrastructure.repository.lead_repository import LeadRepository

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def get_lead_repository(db: Session = Depends(SessionLocal)) -> LeadRepository:
    yield LeadRepository(db)