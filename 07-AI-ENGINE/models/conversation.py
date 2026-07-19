from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

from db.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)

    role: Mapped[str]

    message: Mapped[str]