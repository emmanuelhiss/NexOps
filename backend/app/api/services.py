from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_session
from app.models.service import Service
from app.schemas.infrastructure import Meta
from app.schemas.services import (
    ServiceCreate,
    ServiceListResponse,
    ServiceResponse,
    ServiceUpdate,
)

router = APIRouter()


@router.get("", response_model=ServiceListResponse)
async def list_services(
    session: AsyncSession = Depends(get_session),
) -> ServiceListResponse:
    """List all registered services."""
    result = await session.execute(select(Service).order_by(Service.name))
    services = list(result.scalars().all())
    return ServiceListResponse(
        data=[ServiceResponse.model_validate(s) for s in services],
        meta=Meta(timestamp=datetime.now(timezone.utc), total=len(services)),
    )


@router.get("/{service_id}", response_model=dict)
async def get_service(
    service_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Get details for a single service."""
    result = await session.execute(
        select(Service).where(Service.id == service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail=f"Service with id '{service_id}' not found")
    return {
        "data": ServiceResponse.model_validate(service),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.post("", response_model=dict, status_code=201)
async def create_service(
    body: ServiceCreate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Create a new managed service."""
    service = Service(
        name=body.name,
        description=body.description,
        type=body.type,
        health_check_url=body.health_check_url,
        vm_id=body.vm_id,
        namespace=body.namespace,
        metadata_=body.metadata,
    )
    session.add(service)
    await session.commit()
    await session.refresh(service)
    return {
        "data": ServiceResponse.model_validate(service),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.put("/{service_id}", response_model=dict)
async def update_service(
    service_id: uuid.UUID,
    body: ServiceUpdate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Update an existing service."""
    result = await session.execute(
        select(Service).where(Service.id == service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail=f"Service with id '{service_id}' not found")

    ALLOWED_FIELDS = {"name", "description", "type", "status", "health_check_url", "vm_id", "namespace", "metadata_"}
    update_data = body.model_dump(exclude_unset=True)
    if "metadata" in update_data:
        update_data["metadata_"] = update_data.pop("metadata")
    for key, value in update_data.items():
        if key in ALLOWED_FIELDS:
            setattr(service, key, value)

    await session.commit()
    await session.refresh(service)
    return {
        "data": ServiceResponse.model_validate(service),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.delete("/{service_id}", status_code=204)
async def delete_service(
    service_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a service."""
    result = await session.execute(
        select(Service).where(Service.id == service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail=f"Service with id '{service_id}' not found")

    await session.delete(service)
    await session.commit()
