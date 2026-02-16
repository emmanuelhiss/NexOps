from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.infrastructure import Meta


class MetricResponse(BaseModel):
    """Schema for a single metric data point."""

    id: uuid.UUID
    source_type: str
    source_id: uuid.UUID
    metric_name: str
    value: float
    unit: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class MetricTimeSeriesPoint(BaseModel):
    """A single point in a time series."""

    value: float
    timestamp: datetime


class MetricTimeSeries(BaseModel):
    """Time series data for a single metric."""

    metric_name: str
    unit: str
    data: list[MetricTimeSeriesPoint]


class MetricsTimeSeriesResponse(BaseModel):
    """Time series metrics response for a service."""

    data: list[MetricTimeSeries]
    meta: Meta


class ResourceOverview(BaseModel):
    """Aggregate resource usage across all nodes."""

    total_nodes: int
    total_vms: int
    running_vms: int
    active_alerts: int
    avg_cpu_usage: float
    avg_memory_usage: float
    avg_disk_usage: float


class MetricsOverviewResponse(BaseModel):
    """Aggregate metrics overview response."""

    data: ResourceOverview
    meta: Meta
