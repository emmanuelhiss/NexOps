from __future__ import annotations

import asyncio
import logging

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def collect_metrics(self) -> dict[str, str]:
    """Collect VM metrics from Proxmox every 30 seconds."""
    try:
        asyncio.run(_collect())
        return {"status": "success"}
    except Exception as exc:
        logger.exception("Metrics collection failed")
        raise self.retry(exc=exc)


async def _collect() -> None:
    """Run the async metrics collection."""
    from app.database import async_session_maker
    from app.services.metrics import MetricsService

    async with async_session_maker() as session:
        service = MetricsService(session)
        await service.collect_vm_metrics()
