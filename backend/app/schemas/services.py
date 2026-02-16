from __future__ import annotations

import ipaddress
import uuid
from datetime import datetime
from urllib.parse import urlparse

from pydantic import BaseModel, field_validator

from app.schemas.infrastructure import Meta

ALLOWED_SCHEMES = {"http", "https"}


def _validate_health_check_url(url: str | None) -> str | None:
    """Validate that health_check_url uses http(s), has a valid hostname, and does not target private IPs."""
    if url is None:
        return None
    parsed = urlparse(url)
    if parsed.scheme not in ALLOWED_SCHEMES:
        raise ValueError("health_check_url must use http or https")
    if not parsed.hostname:
        raise ValueError("health_check_url must include a valid hostname")

    # Block direct private/loopback/link-local IP addresses
    try:
        ip = ipaddress.ip_address(parsed.hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            raise ValueError("health_check_url must not target private or loopback addresses")
    except ValueError as exc:
        if "private" in str(exc) or "loopback" in str(exc):
            raise
        # Not an IP literal (it's a hostname) — allowed at schema level.
        # Runtime DNS resolution check happens in health_checker.

    return url


class ServiceCreate(BaseModel):
    """Schema for creating a new service."""

    name: str
    description: str | None = None
    type: str = "vm"
    health_check_url: str | None = None
    vm_id: uuid.UUID | None = None
    namespace: str | None = None
    metadata: dict | None = None

    @field_validator("health_check_url")
    @classmethod
    def validate_url(cls, v: str | None) -> str | None:
        return _validate_health_check_url(v)


class ServiceUpdate(BaseModel):
    """Schema for updating an existing service."""

    name: str | None = None
    description: str | None = None
    type: str | None = None
    status: str | None = None
    health_check_url: str | None = None
    vm_id: uuid.UUID | None = None
    namespace: str | None = None
    metadata: dict | None = None

    @field_validator("health_check_url")
    @classmethod
    def validate_url(cls, v: str | None) -> str | None:
        return _validate_health_check_url(v)


class ServiceResponse(BaseModel):
    """Schema for a single service in API responses."""

    id: uuid.UUID
    name: str
    description: str | None = None
    type: str
    status: str
    health_check_url: str | None = None
    vm_id: uuid.UUID | None = None
    namespace: str | None = None
    metadata: dict | None = None
    last_health_check: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ServiceListResponse(BaseModel):
    """Paginated list of services."""

    data: list[ServiceResponse]
    meta: Meta
