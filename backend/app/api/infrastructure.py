from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_session
from app.models.vm import VM
from app.schemas.infrastructure import (
    Meta,
    NodeListResponse,
    NodeResponse,
    VMListResponse,
    VMMetricsResponse,
    VMResponse,
)
from app.services.infrastructure import InfrastructureService

router = APIRouter()


async def _get_vm_or_404(
    service: InfrastructureService, vm_id: uuid.UUID
) -> VM:
    """Look up a VM and validate it has a Proxmox node (shared by action endpoints)."""
    vm = await service.get_vm_by_id(vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail=f"VM with id '{vm_id}' not found")
    if not vm.node or not vm.node.proxmox_node_name:
        raise HTTPException(status_code=500, detail="VM has no associated node")
    return vm


@router.get("/nodes", response_model=NodeListResponse)
async def list_nodes(
    session: AsyncSession = Depends(get_session),
) -> NodeListResponse:
    """List all infrastructure nodes."""
    service = InfrastructureService(session)
    nodes = await service.get_nodes()
    return NodeListResponse(
        data=[NodeResponse.model_validate(n) for n in nodes],
        meta=Meta(timestamp=datetime.now(timezone.utc), total=len(nodes)),
    )


@router.get("/vms", response_model=VMListResponse)
async def list_vms(
    node_id: uuid.UUID | None = None,
    session: AsyncSession = Depends(get_session),
) -> VMListResponse:
    """List all VMs, optionally filtered by node."""
    service = InfrastructureService(session)
    vms = await service.get_vms(node_id)
    return VMListResponse(
        data=[VMResponse.model_validate(vm) for vm in vms],
        meta=Meta(timestamp=datetime.now(timezone.utc), total=len(vms)),
    )


@router.get("/vms/{vm_id}", response_model=dict)
async def get_vm(
    vm_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Get details for a single VM."""
    service = InfrastructureService(session)
    vm = await service.get_vm_by_id(vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail=f"VM with id '{vm_id}' not found")
    return {
        "data": VMResponse.model_validate(vm),
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
    }


@router.get("/vms/{vm_id}/metrics", response_model=VMMetricsResponse)
async def get_vm_metrics(
    vm_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> VMMetricsResponse:
    """Get current resource metrics for a VM."""
    service = InfrastructureService(session)
    vm = await _get_vm_or_404(service, vm_id)

    metrics = await service.get_vm_metrics(vm.node.proxmox_node_name, vm.vmid)
    if not metrics:
        raise HTTPException(status_code=503, detail="Unable to fetch metrics from Proxmox")
    return VMMetricsResponse(**metrics)


@router.post("/vms/{vm_id}/start")
async def start_vm(
    vm_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Start a VM."""
    service = InfrastructureService(session)
    vm = await _get_vm_or_404(service, vm_id)

    result = await service.start_vm(vm.node.proxmox_node_name, vm.vmid)
    if result is None:
        raise HTTPException(status_code=503, detail="Failed to start VM")
    return {"data": {"status": "starting", "task": result}, "meta": {"timestamp": datetime.now(timezone.utc).isoformat()}}


@router.post("/vms/{vm_id}/stop")
async def stop_vm(
    vm_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Stop a VM."""
    service = InfrastructureService(session)
    vm = await _get_vm_or_404(service, vm_id)

    result = await service.stop_vm(vm.node.proxmox_node_name, vm.vmid)
    if result is None:
        raise HTTPException(status_code=503, detail="Failed to stop VM")
    return {"data": {"status": "stopping", "task": result}, "meta": {"timestamp": datetime.now(timezone.utc).isoformat()}}


@router.post("/vms/{vm_id}/restart")
async def restart_vm(
    vm_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Restart a VM."""
    service = InfrastructureService(session)
    vm = await _get_vm_or_404(service, vm_id)

    result = await service.restart_vm(vm.node.proxmox_node_name, vm.vmid)
    if result is None:
        raise HTTPException(status_code=503, detail="Failed to restart VM")
    return {"data": {"status": "restarting", "task": result}, "meta": {"timestamp": datetime.now(timezone.utc).isoformat()}}
