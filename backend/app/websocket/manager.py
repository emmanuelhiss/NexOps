from __future__ import annotations

import asyncio
import json
import logging

from fastapi import WebSocket
from redis.asyncio import Redis

from app.config import settings
from app.websocket.events import CHANNEL

logger = logging.getLogger(__name__)

HEARTBEAT_INTERVAL = 30  # seconds


class ConnectionManager:
    """Manages WebSocket connections and relays Redis pub/sub events."""

    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._redis: Redis | None = None
        self._subscriber_task: asyncio.Task | None = None
        self._heartbeat_task: asyncio.Task | None = None

    async def startup(self) -> None:
        """Start the Redis subscriber and heartbeat loops."""
        self._redis = Redis.from_url(settings.redis_url, decode_responses=True)
        self._subscriber_task = asyncio.create_task(self._subscribe())
        self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        logger.info("WebSocket manager started")

    async def shutdown(self) -> None:
        """Stop background tasks and close all connections."""
        if self._subscriber_task:
            self._subscriber_task.cancel()
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
        for ws in list(self._connections):
            await self._safe_close(ws)
        self._connections.clear()
        if self._redis:
            await self._redis.aclose()
        logger.info("WebSocket manager stopped")

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and track a new WebSocket connection."""
        await websocket.accept()
        self._connections.add(websocket)
        logger.info("WebSocket client connected (%d total)", len(self._connections))

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a disconnected client."""
        self._connections.discard(websocket)
        logger.info("WebSocket client disconnected (%d total)", len(self._connections))

    async def broadcast(self, message: str) -> None:
        """Send a message to all connected clients."""
        stale: list[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_text(message)
            except Exception:
                stale.append(ws)
        for ws in stale:
            self._connections.discard(ws)

    async def _subscribe(self) -> None:
        """Listen to the Redis channel and broadcast events to clients."""
        while True:
            try:
                assert self._redis is not None
                pubsub = self._redis.pubsub()
                await pubsub.subscribe(CHANNEL)
                logger.info("Subscribed to Redis channel %s", CHANNEL)
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        await self.broadcast(message["data"])
            except asyncio.CancelledError:
                break
            except Exception:
                logger.warning("Redis subscriber error, reconnecting in 2s", exc_info=True)
                await asyncio.sleep(2)

    async def _heartbeat_loop(self) -> None:
        """Send periodic pings to detect dead connections."""
        while True:
            try:
                await asyncio.sleep(HEARTBEAT_INTERVAL)
                ping = json.dumps({"type": "ping"})
                stale: list[WebSocket] = []
                for ws in list(self._connections):
                    try:
                        await ws.send_text(ping)
                    except Exception:
                        stale.append(ws)
                for ws in stale:
                    self._connections.discard(ws)
            except asyncio.CancelledError:
                break
            except Exception:
                logger.warning("Heartbeat error", exc_info=True)


ws_manager = ConnectionManager()
