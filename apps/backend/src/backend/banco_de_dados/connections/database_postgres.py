from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .database_clients import settings

# models herdam daqui
class Base(DeclarativeBase):
    pass


class PostgresConnectionHandler:
    '''PostGresConnectionHandler
    AsyncSession: SqlAlchemy faz o meio de campo com o banco de dados e os repositórios ou models por meio da dependencia AsyncSession
    '''
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


# dependência do FastAPI, essa depencência é usada para criar uma sessão de banco de dados para cada requisição, e garantir que a sessão seja fechada corretamente após o uso.
async def get_db():
    async with postgres.get_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise