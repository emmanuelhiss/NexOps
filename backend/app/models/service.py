from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7

if TYPE_CHECKING:
    from app.models.vm import VM


class Service(Base, TimestampMixin):
    """Represents a managed application or service."""

    __tablename__ = "services"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=generate_uuid7,
    )
    name: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(50), default="vm")
    status: Mapped[str] = mapped_column(String(20), default="unknown")
    health_check_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    vm_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("vms.id", ondelete="SET NULL"), nullable=True
    )
    namespace: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    metadata_: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )
    last_health_check: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    vm: Mapped[VM | None] = relationship(back_populates="services")
