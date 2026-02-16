from __future__ import annotations

import asyncio
import logging

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def sync_infrastructure(self) -> dict[str, str]:
    """Sync node and VM data from Proxmox every 5 minutes."""
    try:
        asyncio.run(_sync())
        return {"status": "success"}
    except Exception as exc:
        logger.exception("Infrastructure sync failed")
        raise self.retry(exc=exc)


async def _sync() -> None:
    """Run the async infrastructure sync."""
    from app.database import async_session_maker
    from app.services.infrastructure import InfrastructureService

    async with async_session_maker() as session:
        service = InfrastructureService(session)
        await service.sync_nodes_and_vms()
