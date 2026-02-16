from __future__ import annotations

import asyncio
import ipaddress
import logging
import socket
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx
from sqlalchemy import select

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

HEALTH_CHECK_TIMEOUT = 10


def _is_url_safe(url: str) -> bool:
    """Check that URL does not resolve to a private, loopback, or link-local IP."""
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        return False
    try:
        resolved = socket.getaddrinfo(hostname, None)
        for _, _, _, _, sockaddr in resolved:
            ip = ipaddress.ip_address(sockaddr[0])
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                return False
    except (socket.gaierror, ValueError):
        return False
    return True


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def health_check(self) -> dict[str, str]:
    """Ping health check URLs for all services every 30 seconds."""
    try:
        asyncio.run(_check_health())
        return {"status": "success"}
    except Exception as exc:
        logger.exception("Health check failed")
        raise self.retry(exc=exc)


async def _check_health() -> None:
    """Run async health checks for all services."""
    from app.database import async_session_maker
    from app.models.service import Service

    async with async_session_maker() as session:
        result = await session.execute(
            select(Service).where(Service.health_check_url.is_not(None))
        )
        services = list(result.scalars().all())

        async with httpx.AsyncClient(timeout=HEALTH_CHECK_TIMEOUT) as client:
            for service in services:
                if not _is_url_safe(service.health_check_url):
                    service.status = "unhealthy"
                    logger.warning(
                        "Blocked health check for %s: URL %s resolves to private IP",
                        service.name,
                        service.health_check_url,
                    )
                    service.last_health_check = datetime.now(timezone.utc)
                    continue

                try:
                    response = await client.get(service.health_check_url)
                    if response.status_code < 400:
                        service.status = "healthy"
                    else:
                        service.status = "unhealthy"
                except httpx.TimeoutException:
                    service.status = "unhealthy"
                    logger.warning("Health check timed out for %s", service.name)
                except httpx.RequestError:
                    service.status = "unhealthy"
                    logger.warning("Health check failed for %s", service.name)

                service.last_health_check = datetime.now(timezone.utc)

        await session.commit()
        logger.info("Health check complete for %d services", len(services))
