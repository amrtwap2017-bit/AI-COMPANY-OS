from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True)
    email = Column(String, index=True)
    status = Column(String, index=True)
    source = Column(String, index=True)
    assigned_agent_id = Column(Integer, index=True)

DATABASE_URL = "sqlite:///./test.db"
echo = False
db_engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False}, echo=echo)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)

Base.metadata.create_all(bind=db_engine)