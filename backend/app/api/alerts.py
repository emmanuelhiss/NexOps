from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_session
from app.models.alert import Alert, AlertRule
from app.schemas.alerts import (
    AlertListResponse,
    AlertResponse,
    AlertRuleCreate,
    AlertRuleListResponse,
    AlertRuleResponse,
    AlertRuleUpdate,
)
from app.schemas.infrastructure import Meta

router = APIRouter()


@router.get("", response_model=AlertListResponse)
async def list_alerts(
    status: str | None = None,
    session: AsyncSession = Depends(get_session),
) -> AlertListResponse:
    """List alerts, optionally filtered by status."""
    query = select(Alert).order_by(Alert.fired_at.desc())
    if status:
        query = query.where(Alert.status == status)
    result = await session.execute(query)
    alerts = list(result.scalars().all())
    return AlertListResponse(
        data=[AlertResponse.model_validate(a) for a in alerts],
        meta=Meta(timestamp=datetime.now(timezone.utc), total=len(alerts)),
    )


@router.get("/rules", response_model=AlertRuleListResponse)
async def list_alert_rules(
    session: AsyncSession = Depends(get_session),
) -> AlertRuleListResponse:
    """List all alert rules."""
    result = await session.execute(
        select(AlertRule).order_by(AlertRule.name)
    )
    rules = list(result.scalars().all())
    return AlertRuleListResponse(
        data=[AlertRuleResponse.model_validate(r) for r in rules],
        meta=Meta(timestamp=datetime.now(timezone.utc), total=len(rules)),
    )


@router.post("/rules", response_model=dict, status_code=201)
async def create_alert_rule(
    body: AlertRuleCreate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Create a new alert rule."""
    rule = AlertRule(
        name=body.name,
        description=body.description,
        metric_name=body.metric_name,
        condition=body.condition,
        threshold=body.threshold,
        duration_seconds=body.duration_seconds,
        severity=body.severity,
        enabled=body.enabled,
        notification_channels=body.notification_channels,
    )
    session.add(rule)
    await session.commit()
    await session.refresh(rule)
    return {
        "data": AlertRuleResponse.model_validate(rule),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.put("/rules/{rule_id}", response_model=dict)
async def update_alert_rule(
    rule_id: uuid.UUID,
    body: AlertRuleUpdate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Update an existing alert rule."""
    result = await session.execute(
        select(AlertRule).where(AlertRule.id == rule_id)
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Alert rule with id '{rule_id}' not found")

    ALLOWED_FIELDS = {"name", "description", "metric_name", "condition", "threshold", "duration_seconds", "severity", "enabled", "notification_channels"}
    for key, value in body.model_dump(exclude_unset=True).items():
        if key in ALLOWED_FIELDS:
            setattr(rule, key, value)

    await session.commit()
    await session.refresh(rule)
    return {
        "data": AlertRuleResponse.model_validate(rule),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.delete("/rules/{rule_id}", status_code=204)
async def delete_alert_rule(
    rule_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete an alert rule."""
    result = await session.execute(
        select(AlertRule).where(AlertRule.id == rule_id)
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Alert rule with id '{rule_id}' not found")

    await session.delete(rule)
    await session.commit()
