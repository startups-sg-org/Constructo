import asyncio

from sqlalchemy import text

from backend.banco_de_dados.connections.database_postgres import postgres


async def test_connection():
    async with postgres.get_session() as session:
        result = await session.execute(text("SELECT 1"))
        print(result.scalar_one())


if __name__ == "__main__":
    asyncio.run(test_connection())