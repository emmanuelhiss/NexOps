from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7

if TYPE_CHECKING:
    from app.models.vm import VM


class Node(Base, TimestampMixin):
    """Represents a physical or virtual infrastructure node."""

    __tablename__ = "nodes"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=generate_uuid7,
    )
    hostname: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    ip_address: Mapped[str] = mapped_column(String(45))
    provider: Mapped[str] = mapped_column(String(50), default="proxmox")
    status: Mapped[str] = mapped_column(String(20), default="online")
    cpu_cores: Mapped[int] = mapped_column(Integer)
    memory_total_mb: Mapped[int] = mapped_column(Integer)
    disk_total_gb: Mapped[int] = mapped_column(Integer)
    proxmox_node_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    metadata_: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )
    last_seen_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    vms: Mapped[list[VM]] = relationship(
        back_populates="node", cascade="all, delete-orphan"
    )
