from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_session
from app.schemas.infrastructure import Meta
from app.schemas.metrics import (
    MetricResponse,
    MetricTimeSeries,
    MetricTimeSeriesPoint,
    MetricsOverviewResponse,
    MetricsTimeSeriesResponse,
    ResourceOverview,
)
from app.services.metrics import MetricsService

router = APIRouter()


@router.get("/overview", response_model=MetricsOverviewResponse)
async def get_metrics_overview(
    session: AsyncSession = Depends(get_session),
) -> MetricsOverviewResponse:
    """Get aggregate metrics overview across all infrastructure."""
    service = MetricsService(session)
    overview = await service.get_overview()
    return MetricsOverviewResponse(
        data=ResourceOverview(**overview),
        meta=Meta(timestamp=datetime.now(timezone.utc)),
    )


@router.get("/{source_id}", response_model=MetricsTimeSeriesResponse)
async def get_metrics_for_source(
    source_id: uuid.UUID,
    range: str = Query("1h", pattern="^(1h|6h|24h|7d)$"),
    session: AsyncSession = Depends(get_session),
) -> MetricsTimeSeriesResponse:
    """Get time-series metrics for a specific source (node, VM, or service)."""
    service = MetricsService(session)
    metrics = await service.get_metrics_for_source(source_id, range)

    series_map: dict[str, MetricTimeSeries] = {}
    for metric in metrics:
        if metric.metric_name not in series_map:
            series_map[metric.metric_name] = MetricTimeSeries(
                metric_name=metric.metric_name,
                unit=metric.unit,
                data=[],
            )
        series_map[metric.metric_name].data.append(
            MetricTimeSeriesPoint(value=metric.value, timestamp=metric.timestamp)
        )

    return MetricsTimeSeriesResponse(
        data=list(series_map.values()),
        meta=Meta(timestamp=datetime.now(timezone.utc), total=len(series_map)),
    )
