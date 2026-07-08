from sqlalchemy import Column, Integer, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class WorkloadModel(Base):
    __tablename__ = 'workloads'
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, unique=True)
    leads_assigned = Column(Integer, default=0)
    max_leads = Column(Integer)

DATABASE_URL = "sqlite+aiosqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)