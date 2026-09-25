"""Teste destrutivo para banco PostgreSQL temporário e exclusivo do Epic 1.

Execute apenas em um banco descartável: faz downgrade e altera dados de teste.
"""

import asyncio
import subprocess

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from backend.banco_de_dados.connections.database_clients import settings


def migrar(*argumentos: str) -> None:
    subprocess.run(["alembic", *argumentos], check=True)


async def verificar() -> None:
    engine = create_async_engine(settings.database_url)
    try:
        async with engine.begin() as conexao:
            await conexao.execute(
                text("""
                INSERT INTO usuarios
                (cpf, nome, sobrenome, email, senha, telefone, empreendimento, unidade)
                VALUES ('12345678901', 'Teste', 'Migração', 'epic01@exemplo.com',
                        'hash', '63999999999', 'Legado', '704')
            """)
            )
        migrar("upgrade", "head")
        async with engine.connect() as conexao:
            papel = await conexao.scalar(
                text("""
                SELECT papel FROM usuarios WHERE email = 'epic01@exemplo.com'
            """)
            )
            assert papel == "COMPRADOR", "Usuário antigo não foi preservado"
            for nome in (
                "empreendimentos",
                "locais_obra",
                "taxonomias",
                "etapas",
                "marcos",
                "progressos_marco",
                "evidencias",
                "publicacoes",
                "publicacoes_evidencias",
                "usuarios_empreendimentos",
                "usuarios_unidades",
            ):
                assert (
                    await conexao.scalar(text("SELECT to_regclass(:tabela)"), {"tabela": nome})
                    == nome
                )
        migrar("downgrade", "20260925_0002")
        migrar("upgrade", "head")
        migrar("check")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    migrar("upgrade", "20260923_0001")
    asyncio.run(verificar())
    print("Epic 1: migrations, dados legados e metadata verificados em PostgreSQL")
