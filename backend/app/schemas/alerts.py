from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.infrastructure import Meta

VALID_CONDITIONS = Literal["gt", "lt", "gte", "lte", "eq"]
VALID_SEVERITIES = Literal["info", "warning", "critical"]


class AlertRuleCreate(BaseModel):
    """Schema for creating an alert rule."""

    name: str
    description: str | None = None
    metric_name: str
    condition: VALID_CONDITIONS
    threshold: float
    duration_seconds: int = 0
    severity: VALID_SEVERITIES = "warning"
    enabled: bool = True
    notification_channels: list[str] | None = None


class AlertRuleUpdate(BaseModel):
    """Schema for updating an alert rule."""

    name: str | None = None
    description: str | None = None
    metric_name: str | None = None
    condition: VALID_CONDITIONS | None = None
    threshold: float | None = None
    duration_seconds: int | None = None
    severity: VALID_SEVERITIES | None = None
    enabled: bool | None = None
    notification_channels: list[str] | None = None


class AlertRuleResponse(BaseModel):
    """Schema for an alert rule in API responses."""

    id: uuid.UUID
    name: str
    description: str | None = None
    metric_name: str
    condition: str
    threshold: float
    duration_seconds: int
    severity: str
    enabled: bool
    notification_channels: list[str] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AlertResponse(BaseModel):
    """Schema for an alert in API responses."""

    id: uuid.UUID
    rule_id: uuid.UUID
    source_type: str
    source_id: uuid.UUID
    severity: str
    status: str
    title: str
    description: str | None = None
    fired_at: datetime
    acknowledged_at: datetime | None = None
    resolved_at: datetime | None = None

    model_config = {"from_attributes": True}


class AlertListResponse(BaseModel):
    """Paginated list of alerts."""

    data: list[AlertResponse]
    meta: Meta


class AlertRuleListResponse(BaseModel):
    """Paginated list of alert rules."""

    data: list[AlertRuleResponse]
    meta: Meta
