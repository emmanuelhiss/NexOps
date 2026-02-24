from __future__ import annotations

import json
import logging
from typing import Any

import redis

from app.config import settings

logger = logging.getLogger(__name__)

CHANNEL = "nexops:events"

_redis_client: redis.Redis | None = None


def _get_redis() -> redis.Redis:
    """Lazily create a sync Redis client (safe in both Celery and FastAPI)."""
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis.from_url(
            settings.redis_url, decode_responses=True
        )
    return _redis_client


def publish_event(event_type: str, data: dict[str, Any] | None = None) -> None:
    """Publish an event to the nexops:events Redis channel.

    Callable from Celery workers (sync) and FastAPI endpoints (sync context).
    """
    message = json.dumps({"type": event_type, "data": data or {}})
    try:
        _get_redis().publish(CHANNEL, message)
        logger.debug("Published event %s", event_type)
    except redis.RedisError:
        logger.warning("Failed to publish event %s", event_type, exc_info=True)
