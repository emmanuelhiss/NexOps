from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.metric import Metric
from app.models.node import Node
from app.models.vm import VM
from app.services.proxmox import proxmox_client

logger = logging.getLogger(__name__)

TIME_RANGE_MAP = {
    "1h": timedelta(hours=1),
    "6h": timedelta(hours=6),
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
}


class MetricsService:
    """Business logic for metrics collection and retrieval."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.proxmox = proxmox_client

    async def get_overview(self) -> dict:
        """Get aggregate resource overview across all nodes."""
        nodes_result = await self.session.execute(select(Node))
        nodes = list(nodes_result.scalars().all())

        vms_result = await self.session.execute(select(VM))
        vms = list(vms_result.scalars().all())

        alerts_result = await self.session.execute(
            select(Alert).where(Alert.status == "firing")
        )
        active_alerts = list(alerts_result.scalars().all())

        running_vms = [vm for vm in vms if vm.status == "running"]

        total_cpu = 0.0
        total_mem = 0.0
        total_disk = 0.0
        node_count = len(nodes)

        for node in nodes:
            node_status = self.proxmox.get_node_status(node.proxmox_node_name or node.hostname)
            if node_status:
                total_cpu += node_status.get("cpu", 0) * 100
                memory = node_status.get("memory", {})
                if memory.get("total", 0) > 0:
                    total_mem += (memory.get("used", 0) / memory["total"]) * 100
                rootfs = node_status.get("rootfs", {})
                if rootfs.get("total", 0) > 0:
                    total_disk += (rootfs.get("used", 0) / rootfs["total"]) * 100

        return {
            "total_nodes": node_count,
            "total_vms": len(vms),
            "running_vms": len(running_vms),
            "active_alerts": len(active_alerts),
            "avg_cpu_usage": round(total_cpu / max(node_count, 1), 2),
            "avg_memory_usage": round(total_mem / max(node_count, 1), 2),
            "avg_disk_usage": round(total_disk / max(node_count, 1), 2),
        }

    async def get_metrics_for_source(
        self,
        source_id: uuid.UUID,
        time_range: str = "1h",
    ) -> list[Metric]:
        """Retrieve time-series metrics for a given source."""
        delta = TIME_RANGE_MAP.get(time_range, timedelta(hours=1))
        since = datetime.now(timezone.utc) - delta

        result = await self.session.execute(
            select(Metric)
            .where(
                Metric.source_id == source_id,
                Metric.timestamp >= since,
            )
            .order_by(Metric.timestamp.asc())
        )
        return list(result.scalars().all())

    async def collect_vm_metrics(self) -> None:
        """Collect metrics from all VMs and store them in the database."""
        vms_result = await self.session.execute(
            select(VM).where(VM.status == "running")
        )
        vms = list(vms_result.scalars().all())
        now = datetime.now(timezone.utc)

        for vm in vms:
            node_result = await self.session.execute(
                select(Node).where(Node.id == vm.node_id)
            )
            node = node_result.scalar_one_or_none()
            if not node or not node.proxmox_node_name:
                continue

            status = self.proxmox.get_vm_status(node.proxmox_node_name, vm.vmid)
            if not status:
                continue

            maxmem = status.get("maxmem", 1)
            mem = status.get("mem", 0)
            maxdisk = status.get("maxdisk", 1)
            disk = status.get("disk", 0)

            metrics_data = [
                ("cpu_usage", round(status.get("cpu", 0) * 100, 2), "percent"),
                ("memory_usage", round((mem / maxmem) * 100, 2) if maxmem else 0, "percent"),
                ("disk_usage", round((disk / maxdisk) * 100, 2) if maxdisk else 0, "percent"),
                ("network_in", status.get("netin", 0), "bytes"),
                ("network_out", status.get("netout", 0), "bytes"),
            ]

            for metric_name, value, unit in metrics_data:
                metric = Metric(
                    source_type="vm",
                    source_id=vm.id,
                    metric_name=metric_name,
                    value=value,
                    unit=unit,
                    timestamp=now,
                )
                self.session.add(metric)

        await self.session.commit()
        logger.info("Collected metrics for %d running VMs", len(vms))
