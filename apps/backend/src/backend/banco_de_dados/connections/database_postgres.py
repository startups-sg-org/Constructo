from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from .database_clients import settings


class Base(DeclarativeBase):
    pass


class PostgresConnectionHandler:
    def __init__(self) -> None:
        self.__engine = create_async_engine(
            settings.database_url,
            pool_pre_ping=True,
        )
        self.__session_factory = async_sessionmaker(
            self.__engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

    def get_session(self) -> AsyncSession:
        return self.__session_factory()

    @property
    def engine(self) -> AsyncEngine:
        return self.__engine

    async def dispose(self) -> None:
        await self.__engine.dispose()


postgres = PostgresConnectionHandler()


async def get_db() -> AsyncIterator[AsyncSession]:
    async with postgres.get_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
