from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from uuid_extensions import uuid7


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


def generate_uuid7() -> uuid.UUID:
    """Generate a time-sortable UUID7."""
    return uuid7()


def utc_now() -> datetime:
    """Return the current UTC datetime."""
    return datetime.now(timezone.utc)


class TimestampMixin:
    """Mixin that adds created_at and updated_at columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )
