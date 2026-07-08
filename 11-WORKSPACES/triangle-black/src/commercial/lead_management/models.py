from sqlalchemy import Column, Integer, String, Enum, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class LeadStatus(Enum):
    new = 'new'
    qualified = 'qualified'
    assigned = 'assigned'
    converted = 'converted'
    lost = 'lost'

class Priority(Enum):
    high = 'high'
    medium = 'medium'
    low = 'low'

class Lead(Base):
    __tablename__ = 'leads'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    company = Column(String, nullable=False)
    source = Column(Enum(Source), nullable=False)
    status = Column(Enum(LeadStatus), default=LeadStatus.new, nullable=False)
    priority = Column(Enum(Priority), nullable=False)
    score = Column(Float, nullable=False)
    notes = Column(String)