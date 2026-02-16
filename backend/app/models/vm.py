from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7

if TYPE_CHECKING:
    from app.models.node import Node
    from app.models.service import Service


class VM(Base, TimestampMixin):
    """Represents a virtual machine or container managed by a node."""

    __tablename__ = "vms"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=generate_uuid7,
    )
    node_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("nodes.id", ondelete="CASCADE")
    )
    vmid: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="stopped")
    type: Mapped[str] = mapped_column(String(20), default="qemu")
    cpu_cores: Mapped[int] = mapped_column(Integer)
    memory_mb: Mapped[int] = mapped_column(Integer)
    disk_gb: Mapped[float] = mapped_column(Float)
    ip_address: Mapped[str | None] = mapped_column(
        String(45), nullable=True
    )
    os_type: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    tags: Mapped[list[str] | None] = mapped_column(
        ARRAY(String), nullable=True
    )
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    node: Mapped[Node] = relationship(back_populates="vms")
    services: Mapped[list[Service]] = relationship(
        back_populates="vm", cascade="all, delete-orphan"
    )
