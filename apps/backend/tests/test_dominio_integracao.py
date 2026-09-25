"""Integração da camada de domínio em SQLite, com chaves estrangeiras ligadas.

Concorrência e execução Alembic em PostgreSQL precisam de verificação própria.
"""

import asyncio
from datetime import UTC, datetime, timedelta

import pytest
from pydantic import ValidationError
from sqlalchemy import event
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from backend.banco_de_dados.connections.database_postgres import Base
from backend.modulos.dominio.esquemas import (
    EtapaCriar,
    EvidenciaCriar,
    LocalCriar,
    ProgressoMarcoCriar,
    PublicacaoCriar,
)
from backend.modulos.dominio.modelos import (
    Empreendimento,
    Marco,
    Taxonomia,
)
from backend.modulos.dominio.regras import EstadoMarco, TipoLocal
from backend.modulos.dominio.servicos import (
    alterar_estado,
    calcular_progresso_empreendimento,
    calcular_progresso_unidade,
    criar_etapa,
    criar_local,
    criar_progresso,
    criar_publicacao,
    mover_etapa,
    mover_local,
    pode_ler_unidade,
    publicacoes_da_unidade,
    publicar_rascunho,
    registrar_evidencia,
    vincular_comprador,
    vincular_gestor,
)
from backend.modulos.usuarios.modelos import Usuario


def usuario(nome: str, papel: str, *, ativo: bool = True) -> Usuario:
    return Usuario(
        cpf="12345678901",
        nome=nome,
        sobrenome="Teste",
        email=f"{nome}@exemplo.com",
        senha="hash",
        telefone="63999999999",
        empreendimento="legado",
        unidade="704",
        ativo=ativo,
        papel=papel,
    )


async def cenario():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    @event.listens_for(engine.sync_engine, "connect")
    def chaves_estrangeiras(dbapi_connection, _):
        dbapi_connection.execute("PRAGMA foreign_keys=ON")

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    return engine, async_sessionmaker(engine, expire_on_commit=False)


async def base(session):
    gestor = usuario("gestor", "GESTOR")
    comprador = usuario("comprador", "COMPRADOR")
    inativo = usuario("inativo", "GESTOR", ativo=False)
    obra = Empreendimento(nome="Aurora")
    outra = Empreendimento(nome="Outra")
    session.add_all([gestor, comprador, inativo, obra, outra])
    await session.flush()
    taxonomia = Taxonomia(empreendimento_id=obra.id, nome="Padrão")
    outra_taxonomia = Taxonomia(empreendimento_id=outra.id, nome="Outra")
    session.add_all([taxonomia, outra_taxonomia])
    await session.flush()
    return gestor, comprador, inativo, obra, outra, taxonomia, outra_taxonomia


def test_hierarquias_vinculos_e_ciclos():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                gestor, comprador, inativo, obra, outra, tax, outra_tax = await base(session)
                torre = await criar_local(
                    session, LocalCriar(empreendimento_id=obra.id, nome="A", tipo=TipoLocal.TORRE)
                )
                pavimento = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        parent_id=torre.id,
                        nome="7",
                        tipo=TipoLocal.PAVIMENTO,
                    ),
                )
                unidade = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        parent_id=pavimento.id,
                        nome="704",
                        tipo=TipoLocal.UNIDADE,
                    ),
                )
                with pytest.raises(ValueError):
                    await criar_local(
                        session,
                        LocalCriar(
                            empreendimento_id=outra.id,
                            parent_id=pavimento.id,
                            nome="errado",
                            tipo=TipoLocal.UNIDADE,
                        ),
                    )
                with pytest.raises(ValueError):
                    await mover_local(session, torre.id, unidade.id)
                raiz = await criar_etapa(
                    session, EtapaCriar(taxonomia_id=tax.id, nome="Instalações")
                )
                sub = await criar_etapa(
                    session, EtapaCriar(taxonomia_id=tax.id, parent_id=raiz.id, nome="Hidráulica")
                )
                with pytest.raises(ValueError):
                    await criar_etapa(
                        session, EtapaCriar(taxonomia_id=tax.id, parent_id=sub.id, nome="3º nível")
                    )
                with pytest.raises(ValueError):
                    await criar_etapa(
                        session,
                        EtapaCriar(taxonomia_id=outra_tax.id, parent_id=raiz.id, nome="Outra obra"),
                    )
                with pytest.raises(ValueError):
                    await mover_etapa(session, raiz.id, sub.id)
                with pytest.raises(ValueError):
                    await vincular_gestor(session, inativo.id, obra.id)
                with pytest.raises(ValueError):
                    await vincular_comprador(session, comprador.id, pavimento.id)
                await vincular_gestor(session, gestor.id, obra.id)
                await vincular_comprador(session, comprador.id, unidade.id)
                assert await pode_ler_unidade(session, comprador.id, unidade.id)
                assert not await pode_ler_unidade(session, comprador.id, pavimento.id)
                await session.rollback()
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_progresso_publicacao_e_isolamento_de_empreendimento():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                gestor, comprador, _, obra, _, tax, outra_tax = await base(session)
                await vincular_gestor(session, gestor.id, obra.id)
                torre = await criar_local(
                    session, LocalCriar(empreendimento_id=obra.id, nome="A", tipo=TipoLocal.TORRE)
                )
                pavimento = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        parent_id=torre.id,
                        nome="7",
                        tipo=TipoLocal.PAVIMENTO,
                    ),
                )
                unidade = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        parent_id=pavimento.id,
                        nome="704",
                        tipo=TipoLocal.UNIDADE,
                    ),
                )
                await vincular_comprador(session, comprador.id, unidade.id)
                etapa = await criar_etapa(
                    session, EtapaCriar(taxonomia_id=tax.id, nome="Estrutura")
                )
                etapa_alheia = await criar_etapa(
                    session, EtapaCriar(taxonomia_id=outra_tax.id, nome="Outra")
                )
                marco = Marco(etapa_id=etapa.id, nome="Fundação")
                segundo = Marco(etapa_id=etapa.id, nome="Laje")
                alheio = Marco(etapa_id=etapa_alheia.id, nome="Outro")
                session.add_all([marco, segundo, alheio])
                await session.flush()
                with pytest.raises(ValueError):
                    await criar_progresso(
                        session, ProgressoMarcoCriar(local_obra_id=unidade.id, marco_id=alheio.id)
                    )
                with pytest.raises(ValueError):
                    await criar_progresso(
                        session, ProgressoMarcoCriar(local_obra_id=pavimento.id, marco_id=marco.id)
                    )
                progresso = await criar_progresso(
                    session, ProgressoMarcoCriar(local_obra_id=unidade.id, marco_id=marco.id)
                )
                assert await calcular_progresso_unidade(session, unidade.id) == 0
                inicio = datetime.now(UTC)
                await alterar_estado(session, progresso.id, EstadoMarco.EM_ANDAMENTO, agora=inicio)
                with pytest.raises(ValueError):
                    await alterar_estado(
                        session,
                        progresso.id,
                        EstadoMarco.CONCLUIDO,
                        agora=inicio - timedelta(days=1),
                    )
                await alterar_estado(
                    session, progresso.id, EstadoMarco.CONCLUIDO, agora=inicio + timedelta(days=1)
                )
                assert await calcular_progresso_unidade(session, unidade.id, etapa.id) == 50
                assert await calcular_progresso_empreendimento(session, obra.id) == 50
                evidencia = await registrar_evidencia(
                    session,
                    EvidenciaCriar(
                        progresso_marco_id=progresso.id,
                        arquivo_url="privado/foto.jpg",
                        capturado_em=inicio,
                        usuario_id=gestor.id,
                    ),
                )
                assert (
                    await publicacoes_da_unidade(
                        session, usuario_id=comprador.id, local_id=unidade.id
                    )
                    == []
                )
                dados = PublicacaoCriar(
                    progresso_marco_id=progresso.id,
                    titulo="Obra avançou",
                    texto_cliente="Fundação pronta",
                    evidencia_ids=[evidencia.id],
                )
                rascunho = await criar_publicacao(session, dados, autor_id=gestor.id)
                assert rascunho.publicado_em is None
                assert (
                    await publicacoes_da_unidade(
                        session, usuario_id=comprador.id, local_id=unidade.id
                    )
                    == []
                )
                await publicar_rascunho(session, rascunho.id, autor_id=gestor.id)
                assert (
                    len(
                        await publicacoes_da_unidade(
                            session, usuario_id=comprador.id, local_id=unidade.id
                        )
                    )
                    == 1
                )
                await alterar_estado(session, progresso.id, EstadoMarco.EM_ANDAMENTO)
                assert progresso.concluido_em is None
                assert await calcular_progresso_unidade(session, unidade.id) == 0
                await session.rollback()
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_schema_exige_selecao_explicita_de_evidencias():
    with pytest.raises(ValidationError):
        PublicacaoCriar(progresso_marco_id=1, titulo="Obra", texto_cliente="Avanço")
    with pytest.raises(ValidationError):
        PublicacaoCriar(
            progresso_marco_id=1, titulo="Obra", texto_cliente="Avanço", evidencia_ids=[]
        )
