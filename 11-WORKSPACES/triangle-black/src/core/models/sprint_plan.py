from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class SprintPlan(Base):
    __tablename__ = 'sprint_plans'
    id = Column(Integer, primary_key=True)
    workspace_id = Column(String)
    epic = Column(String)
    context = Column(String)
