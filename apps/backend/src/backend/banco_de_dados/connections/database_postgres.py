from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .database_clients import settings

# models herdam daqui
class Base(DeclarativeBase):
    pass


class PostgresConnectionHandler:
    def __init__(self):
        self.__engine = create_async_engine(settings.URL_POSTGRES)
        self.__session_factory = async_sessionmaker(
            self.__engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        

    def get_session(self) -> AsyncSession:
        return self.__session_factory()  

# instância global — usada pelo get_db e pelo Alembic
postgres = PostgresConnectionHandler()       


# dependência do FastAPI
async def get_db():
    async with postgres.get_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise