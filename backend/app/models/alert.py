from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    Double,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid7


class AlertRule(Base, TimestampMixin):
    """Defines conditions under which alerts should fire."""

    __tablename__ = "alert_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=generate_uuid7,
    )
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    metric_name: Mapped[str] = mapped_column(String(100))
    condition: Mapped[str] = mapped_column(String(20))
    threshold: Mapped[float] = mapped_column(Double)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    severity: Mapped[str] = mapped_column(String(20), default="warning")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_channels: Mapped[list[str] | None] = mapped_column(
        ARRAY(String), nullable=True
    )

    alerts: Mapped[list[Alert]] = relationship(
        back_populates="rule", cascade="all, delete-orphan"
    )


class Alert(Base):
    """Represents a fired alert instance."""

    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=generate_uuid7,
    )
    rule_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("alert_rules.id", ondelete="CASCADE")
    )
    source_type: Mapped[str] = mapped_column(String(20))
    source_id: Mapped[uuid.UUID]
    severity: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="firing")
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    fired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    acknowledged_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    rule: Mapped[AlertRule] = relationship(back_populates="alerts")
