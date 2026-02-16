from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.node import Node
from app.models.vm import VM
from app.services.proxmox import proxmox_client

logger = logging.getLogger(__name__)

REDIS_VM_LIST_TTL = 300  # 5 minutes
REDIS_METRICS_TTL = 30   # 30 seconds


class InfrastructureService:
    """Business logic for infrastructure management."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.proxmox = proxmox_client

    async def get_nodes(self) -> list[Node]:
        """Retrieve all nodes from the database."""
        result = await self.session.execute(
            select(Node).order_by(Node.hostname)
        )
        return list(result.scalars().all())

    async def get_vms(self, node_id: uuid.UUID | None = None) -> list[VM]:
        """Retrieve VMs from the database, optionally filtered by node."""
        query = select(VM).options(selectinload(VM.node))
        if node_id:
            query = query.where(VM.node_id == node_id)
        query = query.order_by(VM.name)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_vm_by_id(self, vm_id: uuid.UUID) -> VM | None:
        """Retrieve a single VM by its database ID."""
        result = await self.session.execute(
            select(VM).options(selectinload(VM.node)).where(VM.id == vm_id)
        )
        return result.scalar_one_or_none()

    async def get_vm_by_vmid(self, vmid: int) -> VM | None:
        """Retrieve a single VM by its Proxmox VMID."""
        result = await self.session.execute(
            select(VM).options(selectinload(VM.node)).where(VM.vmid == vmid)
        )
        return result.scalar_one_or_none()

    async def get_vm_metrics(self, node_name: str, vmid: int) -> dict:
        """Fetch current metrics for a VM from Proxmox (non-blocking)."""
        status = await asyncio.to_thread(self.proxmox.get_vm_status, node_name, vmid)
        if not status:
            return {}

        maxmem = status.get("maxmem", 1)
        mem = status.get("mem", 0)
        maxdisk = status.get("maxdisk", 1)
        disk = status.get("disk", 0)

        return {
            "vmid": vmid,
            "cpu_usage": round(status.get("cpu", 0) * 100, 2),
            "memory_usage": round((mem / maxmem) * 100, 2) if maxmem else 0,
            "disk_usage": round((disk / maxdisk) * 100, 2) if maxdisk else 0,
            "network_in": status.get("netin", 0),
            "network_out": status.get("netout", 0),
            "uptime": status.get("uptime", 0),
        }

    async def start_vm(self, node_name: str, vmid: int) -> str | None:
        """Start a VM via Proxmox API (non-blocking)."""
        return await asyncio.to_thread(self.proxmox.start_vm, node_name, vmid)

    async def stop_vm(self, node_name: str, vmid: int) -> str | None:
        """Stop a VM via Proxmox API (non-blocking)."""
        return await asyncio.to_thread(self.proxmox.stop_vm, node_name, vmid)

    async def restart_vm(self, node_name: str, vmid: int) -> str | None:
        """Restart a VM via Proxmox API (non-blocking)."""
        return await asyncio.to_thread(self.proxmox.restart_vm, node_name, vmid)

    async def sync_nodes_and_vms(self) -> None:
        """Pull latest node/VM data from Proxmox and update the database."""
        nodes_data = await asyncio.to_thread(self.proxmox.get_nodes)
        now = datetime.now(timezone.utc)

        for node_data in nodes_data:
            node_name = node_data.get("node", "")
            node_status = await asyncio.to_thread(self.proxmox.get_node_status, node_name)

            result = await self.session.execute(
                select(Node).where(Node.proxmox_node_name == node_name)
            )
            node = result.scalar_one_or_none()

            memory_info = node_status.get("memory", {})
            rootfs_info = node_status.get("rootfs", {})
            cpuinfo = node_status.get("cpuinfo", {})

            # Get node IP from network interfaces
            node_ip = "unknown"
            try:
                interfaces = await asyncio.to_thread(self.proxmox.api.nodes(node_name).network.get)
                for iface in interfaces:
                    if iface.get("address"):
                        node_ip = iface["address"]
                        break
            except Exception:
                pass

            memory_total = memory_info.get("total", node_data.get("maxmem", 1))
            memory_used = memory_info.get("used", node_data.get("mem", 0))

            # Sum all storage pools for total disk, fall back to rootfs
            disk_total = 0
            disk_used = 0
            try:
                storage_pools = await asyncio.to_thread(self.proxmox.api.nodes(node_name).storage.get)
                for pool in storage_pools:
                    disk_total += pool.get("total", 0)
                    disk_used += pool.get("used", 0)
            except Exception:
                disk_total = rootfs_info.get("total", node_data.get("maxdisk", 1))
                disk_used = rootfs_info.get("used", node_data.get("disk", 0))

            if disk_total == 0:
                disk_total = rootfs_info.get("total", node_data.get("maxdisk", 1))
                disk_used = rootfs_info.get("used", node_data.get("disk", 0))

            node_values = {
                "hostname": node_name,
                "ip_address": node_ip,
                "provider": "proxmox",
                "status": "online" if node_data.get("status") == "online" else "offline",
                "cpu_cores": cpuinfo.get("cores", cpuinfo.get("cpus", node_data.get("maxcpu", 0))),
                "memory_total_mb": int(memory_total / 1024 / 1024),
                "disk_total_gb": int(disk_total / 1024 / 1024 / 1024),
                "proxmox_node_name": node_name,
                "last_seen_at": now,
                "metadata_": {
                    "cpu_usage": round(node_data.get("cpu", 0) * 100, 2),
                    "memory_usage": round((memory_used / memory_total) * 100, 2) if memory_total else 0,
                    "disk_usage": round((disk_used / disk_total) * 100, 2) if disk_total else 0,
                },
            }

            if node is None:
                node = Node(**node_values)
                self.session.add(node)
                await self.session.flush()
            else:
                for key, value in node_values.items():
                    setattr(node, key, value)

            await self._sync_vms_for_node(node, node_name)

        await self.session.commit()
        logger.info("Infrastructure sync complete")

    def _build_vm_values(
        self,
        node: Node,
        vm_data: dict,
        vm_type: str,
        config: dict | None = None,
    ) -> dict:
        """Build the common VM field dict for upsert (F6 dedup)."""
        vmid = vm_data.get("vmid", 0)
        default_name = f"vm-{vmid}" if vm_type == "qemu" else f"ct-{vmid}"
        return {
            "node_id": node.id,
            "vmid": vmid,
            "name": vm_data.get("name", default_name),
            "status": vm_data.get("status", "unknown"),
            "type": vm_type,
            "cpu_cores": vm_data.get("maxcpu", vm_data.get("cpus", 1)),
            "memory_mb": int(vm_data.get("maxmem", 0) / 1024 / 1024),
            "disk_gb": round(vm_data.get("maxdisk", 0) / 1024 / 1024 / 1024, 2),
            "tags": vm_data.get("tags", "").split(";") if vm_data.get("tags") else None,
            "config": config if config else None,
        }

    async def _sync_vms_for_node(self, node: Node, node_name: str) -> None:
        """Sync VMs for a specific node."""
        qemu_vms = await asyncio.to_thread(self.proxmox.get_vms, node_name)
        lxc_containers = await asyncio.to_thread(self.proxmox.get_containers, node_name)

        existing_result = await self.session.execute(
            select(VM).where(VM.node_id == node.id)
        )
        existing_vms = {vm.vmid: vm for vm in existing_result.scalars().all()}

        seen_vmids: set[int] = set()

        for vm_data in qemu_vms:
            vmid = vm_data.get("vmid", 0)
            seen_vmids.add(vmid)
            config = await asyncio.to_thread(self.proxmox.get_vm_config, node_name, vmid)
            vm_values = self._build_vm_values(node, vm_data, "qemu", config)

            if vmid in existing_vms:
                for key, value in vm_values.items():
                    setattr(existing_vms[vmid], key, value)
            else:
                self.session.add(VM(**vm_values))

        for vm_data in lxc_containers:
            vmid = vm_data.get("vmid", 0)
            seen_vmids.add(vmid)
            vm_values = self._build_vm_values(node, vm_data, "lxc")

            if vmid in existing_vms:
                for key, value in vm_values.items():
                    setattr(existing_vms[vmid], key, value)
            else:
                self.session.add(VM(**vm_values))

        for vmid, vm in existing_vms.items():
            if vmid not in seen_vmids:
                await self.session.delete(vm)
