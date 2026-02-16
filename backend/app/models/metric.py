from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Double, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, generate_uuid7


class Metric(Base):
    """Stores time-series metric data for nodes, VMs, and services."""

    __tablename__ = "metrics"
    __table_args__ = (
        Index(
            "ix_metrics_source_time",
            "source_type",
            "source_id",
            "metric_name",
            "timestamp",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=generate_uuid7,
    )
    source_type: Mapped[str] = mapped_column(String(20))
    source_id: Mapped[uuid.UUID]
    metric_name: Mapped[str] = mapped_column(String(100))
    value: Mapped[float] = mapped_column(Double)
    unit: Mapped[str] = mapped_column(String(20))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))
