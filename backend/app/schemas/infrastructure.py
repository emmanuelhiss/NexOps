from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class Meta(BaseModel):
    """Standard metadata for API responses."""

    timestamp: datetime
    total: int | None = None
    page: int | None = None
    per_page: int | None = None


class NodeResponse(BaseModel):
    """Schema for a single node in API responses."""

    id: uuid.UUID
    hostname: str
    ip_address: str
    provider: str
    status: str
    cpu_cores: int
    memory_total_mb: int
    disk_total_gb: int
    proxmox_node_name: str | None = None
    metadata: dict | None = Field(default=None, validation_alias="metadata_")
    last_seen_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class NodeListResponse(BaseModel):
    """Paginated list of nodes."""

    data: list[NodeResponse]
    meta: Meta


class VMResponse(BaseModel):
    """Schema for a single VM in API responses."""

    id: uuid.UUID
    node_id: uuid.UUID
    vmid: int
    name: str
    status: str
    type: str
    cpu_cores: int
    memory_mb: int
    disk_gb: float
    ip_address: str | None = None
    os_type: str | None = None
    tags: list[str] | None = None
    config: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VMListResponse(BaseModel):
    """Paginated list of VMs."""

    data: list[VMResponse]
    meta: Meta


class VMMetricsResponse(BaseModel):
    """Current resource usage metrics for a VM."""

    vmid: int
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_in: float
    network_out: float
    uptime: int
