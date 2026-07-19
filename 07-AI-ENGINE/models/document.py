from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer

from db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(255))

    source: Mapped[str] = mapped_column(String(255))

    content: Mapped[str]