from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

from db.base import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str]

    description: Mapped[str]