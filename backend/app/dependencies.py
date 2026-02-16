from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_maker


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an async database session for dependency injection."""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
