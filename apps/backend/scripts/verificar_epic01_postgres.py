"""Teste destrutivo para banco PostgreSQL temporário e exclusivo do Epic 1.

Execute apenas em um banco descartável: faz downgrade e altera dados de teste.
"""

import asyncio
import subprocess

from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from backend.banco_de_dados.connections.database_clients import settings
from backend.modulos.dominio.modelos import (
    Empreendimento,
    Etapa,
    LocalObra,
    Marco,
    ProgressoMarco,
    Taxonomia,
)
from backend.modulos.dominio.regras import EstadoMarco
from backend.modulos.dominio.servicos import alterar_estado


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
        await verificar_concorrencia(engine)
    finally:
        await engine.dispose()


async def verificar_concorrencia(engine) -> None:
    """Duas transições concorrentes não podem concluir com o mesmo estado antigo."""
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory.begin() as session:
        obra = Empreendimento(nome="Teste concorrência")
        session.add(obra)
        await session.flush()
        torre = LocalObra(empreendimento_id=obra.id, nome="A", tipo="TORRE")
        session.add(torre)
        await session.flush()
        pavimento = LocalObra(
            empreendimento_id=obra.id, parent_id=torre.id, nome="1", tipo="PAVIMENTO"
        )
        session.add(pavimento)
        await session.flush()
        unidade = LocalObra(
            empreendimento_id=obra.id, parent_id=pavimento.id, nome="101", tipo="UNIDADE"
        )
        taxonomia = Taxonomia(empreendimento_id=obra.id, nome="Teste")
        session.add_all([unidade, taxonomia])
        await session.flush()
        etapa = Etapa(taxonomia_id=taxonomia.id, nome="Estrutura")
        session.add(etapa)
        await session.flush()
        marco = Marco(etapa_id=etapa.id, nome="Concluído")
        session.add(marco)
        await session.flush()
        progresso = ProgressoMarco(local_obra_id=unidade.id, marco_id=marco.id)
        session.add(progresso)
        await session.flush()
        progresso_id = progresso.id

    bloqueado = asyncio.Event()
    liberar = asyncio.Event()

    async def primeira():
        async with factory.begin() as session:
            await alterar_estado(session, progresso_id, EstadoMarco.EM_ANDAMENTO)
            bloqueado.set()
            await asyncio.wait_for(liberar.wait(), timeout=10)

    async def segunda():
        await bloqueado.wait()
        async with factory.begin() as session:
            try:
                await alterar_estado(session, progresso_id, EstadoMarco.EM_ANDAMENTO)
            except ValueError:
                return
            raise AssertionError("Transição simultânea repetida foi aceita")

    primeira_tarefa = asyncio.create_task(primeira())
    segunda_tarefa = asyncio.create_task(segunda())
    try:
        await asyncio.wait_for(bloqueado.wait(), timeout=10)
        await asyncio.sleep(0.2)
        assert not segunda_tarefa.done(), "A segunda transição não aguardou o bloqueio"
    finally:
        liberar.set()
    await asyncio.wait_for(asyncio.gather(primeira_tarefa, segunda_tarefa), timeout=10)


if __name__ == "__main__":
    migrar("upgrade", "20260923_0001")
    asyncio.run(verificar())
    print("Epic 1: migrations, dados legados e metadata verificados em PostgreSQL")
