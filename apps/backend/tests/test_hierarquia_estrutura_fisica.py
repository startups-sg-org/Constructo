"""Regras de negócio da hierarquia física do empreendimento."""

import asyncio

import pytest
from sqlalchemy import event
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from backend.banco_de_dados.connections.database_postgres import Base
from backend.modulos.dominio.esquemas import LocalCriar
from backend.modulos.dominio.modelos import Empreendimento
from backend.modulos.dominio.regras import TipoLocal
from backend.modulos.dominio.servicos import criar_local, mover_local


async def _cenario():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    @event.listens_for(engine.sync_engine, "connect")
    def chaves_estrangeiras(dbapi_connection, _):
        dbapi_connection.execute("PRAGMA foreign_keys=ON")

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    return engine, async_sessionmaker(engine, expire_on_commit=False)


async def _criar_local(session, empreendimento_id, nome, tipo, pai=None):
    return await criar_local(
        session,
        LocalCriar(
            empreendimento_id=empreendimento_id,
            parent_id=pai.id if pai is not None else None,
            nome=nome,
            tipo=tipo,
        ),
    )


def test_cria_hierarquias_validas_com_torre_e_bloco():
    async def executar():
        engine, factory = await _cenario()
        try:
            async with factory() as session:
                empreendimento = Empreendimento(nome="Aurora")
                session.add(empreendimento)
                await session.flush()

                torre = await _criar_local(session, empreendimento.id, "Torre A", TipoLocal.TORRE)
                bloco = await _criar_local(session, empreendimento.id, "Bloco B", TipoLocal.BLOCO)
                pavimento_torre = await _criar_local(
                    session, empreendimento.id, "1º pavimento", TipoLocal.PAVIMENTO, torre
                )
                pavimento_bloco = await _criar_local(
                    session, empreendimento.id, "Térreo", TipoLocal.PAVIMENTO, bloco
                )
                unidade_torre = await _criar_local(
                    session, empreendimento.id, "101", TipoLocal.UNIDADE, pavimento_torre
                )
                unidade_bloco = await _criar_local(
                    session, empreendimento.id, "Loja 1", TipoLocal.UNIDADE, pavimento_bloco
                )

                assert pavimento_torre.parent_id == torre.id
                assert pavimento_bloco.parent_id == bloco.id
                assert unidade_torre.parent_id == pavimento_torre.id
                assert unidade_bloco.parent_id == pavimento_bloco.id
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_bloqueia_combinacoes_invalidas_com_mensagens_compreensiveis():
    async def executar():
        engine, factory = await _cenario()
        try:
            async with factory() as session:
                empreendimento = Empreendimento(nome="Aurora")
                session.add(empreendimento)
                await session.flush()
                torre = await _criar_local(session, empreendimento.id, "Torre A", TipoLocal.TORRE)
                bloco = await _criar_local(session, empreendimento.id, "Bloco A", TipoLocal.BLOCO)
                pavimento = await _criar_local(
                    session, empreendimento.id, "1º pavimento", TipoLocal.PAVIMENTO, torre
                )
                unidade = await _criar_local(
                    session, empreendimento.id, "101", TipoLocal.UNIDADE, pavimento
                )

                casos = [
                    (TipoLocal.TORRE, torre, "Torre não pode possuir pai"),
                    (TipoLocal.BLOCO, bloco, "Bloco não pode possuir pai"),
                    (TipoLocal.PAVIMENTO, None, "Pavimento deve possuir torre ou bloco"),
                    (TipoLocal.PAVIMENTO, pavimento, "Pavimento deve possuir torre ou bloco"),
                    (TipoLocal.UNIDADE, None, "Unidade deve possuir pavimento"),
                    (TipoLocal.UNIDADE, torre, "Unidade deve possuir pavimento"),
                    (TipoLocal.UNIDADE, bloco, "Unidade deve possuir pavimento"),
                    (TipoLocal.TORRE, unidade, "Unidade não pode possuir filhos"),
                ]

                for indice, (tipo, pai, mensagem) in enumerate(casos):
                    with pytest.raises(ValueError, match=mensagem):
                        await _criar_local(
                            session, empreendimento.id, f"Inválido {indice}", tipo, pai
                        )
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_bloqueia_pai_de_outro_empreendimento():
    async def executar():
        engine, factory = await _cenario()
        try:
            async with factory() as session:
                empreendimento = Empreendimento(nome="Aurora")
                outro = Empreendimento(nome="Solar")
                session.add_all([empreendimento, outro])
                await session.flush()
                torre_alheia = await _criar_local(session, outro.id, "Torre A", TipoLocal.TORRE)
                pavimento_alheio = await _criar_local(
                    session, outro.id, "1º pavimento", TipoLocal.PAVIMENTO, torre_alheia
                )

                with pytest.raises(
                    ValueError,
                    match="Pai e filho devem pertencer ao mesmo empreendimento",
                ):
                    await _criar_local(
                        session,
                        empreendimento.id,
                        "1º pavimento",
                        TipoLocal.PAVIMENTO,
                        torre_alheia,
                    )

                with pytest.raises(
                    ValueError,
                    match="Pai e filho devem pertencer ao mesmo empreendimento",
                ):
                    await _criar_local(
                        session,
                        empreendimento.id,
                        "101",
                        TipoLocal.UNIDADE,
                        pavimento_alheio,
                    )
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_move_pavimento_entre_raizes_validas_e_bloqueia_ciclo():
    async def executar():
        engine, factory = await _cenario()
        try:
            async with factory() as session:
                empreendimento = Empreendimento(nome="Aurora")
                session.add(empreendimento)
                await session.flush()
                torre = await _criar_local(session, empreendimento.id, "Torre A", TipoLocal.TORRE)
                bloco = await _criar_local(session, empreendimento.id, "Bloco A", TipoLocal.BLOCO)
                pavimento = await _criar_local(
                    session, empreendimento.id, "1º pavimento", TipoLocal.PAVIMENTO, torre
                )
                unidade = await _criar_local(
                    session, empreendimento.id, "101", TipoLocal.UNIDADE, pavimento
                )

                movido = await mover_local(session, pavimento.id, bloco.id)
                assert movido.parent_id == bloco.id

                with pytest.raises(ValueError, match="Ciclo detectado"):
                    await mover_local(session, bloco.id, unidade.id)
                assert bloco.parent_id is None
        finally:
            await engine.dispose()

    asyncio.run(executar())
