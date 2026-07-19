from sqlalchemy import String, JSON, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from hub.db.base import Base

class GraphNode(Base):
    __tablename__ = "graph_nodes"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    type: Mapped[str] = mapped_column(String, index=True)
    key: Mapped[str] = mapped_column(String, index=True)
    props: Mapped[dict] = mapped_column(JSON, default=dict)

    __table_args__ = (Index("ix_graph_nodes_type_key", "type", "key", unique=True),)

class GraphEdge(Base):
    __tablename__ = "graph_edges"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    from_id: Mapped[str] = mapped_column(String, ForeignKey("graph_nodes.id"), index=True)
    to_id: Mapped[str] = mapped_column(String, ForeignKey("graph_nodes.id"), index=True)
    type: Mapped[str] = mapped_column(String, index=True)
    props: Mapped[dict] = mapped_column(JSON, default=dict)
