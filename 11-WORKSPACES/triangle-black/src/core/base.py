"""
Shared SQLAlchemy declarative base.
All models must import Base from here — never create their own.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()
