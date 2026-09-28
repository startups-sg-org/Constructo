"""Integração da camada de domínio em SQLite, com chaves estrangeiras ligadas.

Concorrência e execução Alembic em PostgreSQL precisam de verificação própria.
"""

import asyncio
from datetime import UTC, datetime, timedelta

import pytest
from pydantic import ValidationError
from sqlalchemy import event, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import selectinload

from backend.banco_de_dados.connections.database_postgres import Base
from backend.modulos.dominio.esquemas import (
    EmpreendimentoAtualizar,
    EmpreendimentoCriar,
    EtapaAtualizar,
    EtapaCriar,
    EvidenciaCriar,
    LocalCriar,
    LocalLer,
    MarcoAtualizar,
    MarcoCriar,
    ProgressoMarcoCriar,
    PublicacaoCriar,
    TaxonomiaCriar,
    TaxonomiaPersonalizar,
)
from backend.modulos.dominio.modelos import (
    Empreendimento,
    Etapa,
    LocalObra,
    Marco,
    Taxonomia,
)
from backend.modulos.dominio.regras import EstadoMarco, TipoLocal
from backend.modulos.dominio.servicos import (
    alterar_estado,
    atualizar_empreendimento,
    atualizar_etapa,
    atualizar_marco,
    buscar_local,
    buscar_taxonomia_do_empreendimento,
    calcular_progresso_empreendimento,
    calcular_progresso_unidade,
    criar_empreendimento,
    criar_etapa,
    criar_local,
    criar_marco,
    criar_progresso,
    criar_publicacao,
    criar_taxonomia,
    listar_etapas,
    listar_locais,
    listar_marcos,
    mover_etapa,
    mover_local,
    personalizar_taxonomia,
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


def test_criar_taxonomia_valida_empreendimento_e_persiste_campos():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                obra = Empreendimento(nome="Aurora")
                session.add(obra)
                await session.flush()
                taxonomia = await criar_taxonomia(
                    session,
                    TaxonomiaCriar(
                        nome="Padrão",
                        descricao="Estrutura principal",
                        is_padrao=True,
                    ),
                )
                assert taxonomia.is_padrao is True
                assert taxonomia.criado_em is not None
                assert taxonomia.atualizado_em is not None
                assert taxonomia.empreendimento_id is None

                personalizada = await criar_taxonomia(
                    session,
                    TaxonomiaCriar(
                        empreendimento_id=obra.id,
                        nome="Personalizada",
                        descricao="Estrutura da obra",
                    ),
                )
                assert personalizada.is_padrao is False
                assert personalizada.empreendimento_id == obra.id

                with pytest.raises(ValueError):
                    await criar_taxonomia(
                        session,
                        TaxonomiaCriar(
                            empreendimento_id=obra.id,
                            nome="Outra",
                        ),
                    )

                await session.rollback()
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_personaliza_taxonomia_sem_alterar_padrao_ou_outro_empreendimento():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                aurora = Empreendimento(nome="Residencial Aurora")
                horizonte = Empreendimento(nome="Residencial Horizonte")
                padrao = Taxonomia(nome="Taxonomia padrão Constructo", is_padrao=True)
                session.add_all([aurora, horizonte, padrao])
                await session.flush()

                etapa_original = Etapa(
                    taxonomia_id=padrao.id,
                    nome="Estrutura",
                    ordem=1,
                    descricao_tecnica="Descrição técnica padrão",
                    descricao_cliente="Descrição cliente padrão",
                )
                session.add(etapa_original)
                await session.flush()
                sub_original = Etapa(
                    taxonomia_id=padrao.id,
                    parent_id=etapa_original.id,
                    nome="Concreto",
                    ordem=1,
                    descricao_tecnica="Sub técnica padrão",
                    descricao_cliente="Sub cliente padrão",
                )
                session.add(sub_original)
                await session.flush()
                marco_original = Marco(
                    etapa_id=sub_original.id,
                    nome="Concretagem",
                    ordem=1,
                    descricao_tecnica="Marco técnico padrão",
                    descricao_cliente="Marco cliente padrão",
                )
                session.add(marco_original)
                await session.flush()

                aurora_tax = await personalizar_taxonomia(
                    session,
                    aurora.id,
                    TaxonomiaPersonalizar(
                        origem_taxonomia_id=padrao.id,
                        nome="Taxonomia Aurora",
                    ),
                )
                horizonte_tax = await personalizar_taxonomia(
                    session,
                    horizonte.id,
                    TaxonomiaPersonalizar(origem_taxonomia_id=padrao.id),
                )

                etapas_aurora = await listar_etapas(session, aurora_tax.id)
                etapas_horizonte = await listar_etapas(session, horizonte_tax.id)
                assert [item.nome for item in etapas_aurora] == ["Estrutura"]
                assert [item.nome for item in etapas_horizonte] == ["Estrutura"]
                assert etapas_aurora[0].id != etapa_original.id
                assert etapas_horizonte[0].id != etapa_original.id
                assert etapas_aurora[0].id != etapas_horizonte[0].id

                await atualizar_etapa(
                    session,
                    etapas_aurora[0].id,
                    EtapaAtualizar(
                        nome="Estrutura Aurora",
                        ordem=3,
                        descricao_tecnica="Técnica Aurora",
                        descricao_cliente="Cliente Aurora",
                    ),
                )
                sub_aurora = (
                    await listar_etapas(session, aurora_tax.id, parent_id=etapas_aurora[0].id)
                )[0]
                await atualizar_etapa(
                    session,
                    sub_aurora.id,
                    EtapaAtualizar(nome="Concreto Aurora", ordem=2),
                )
                marco_aurora = (await listar_marcos(session, sub_aurora.id))[0]
                await atualizar_marco(
                    session,
                    marco_aurora.id,
                    MarcoAtualizar(
                        nome="Concretagem Aurora",
                        ordem=5,
                        descricao_tecnica="Marco técnico Aurora",
                        descricao_cliente="Marco cliente Aurora",
                    ),
                )
                extra = await criar_marco(
                    session,
                    MarcoCriar(
                        etapa_id=sub_aurora.id,
                        nome="Cura do concreto",
                        ordem=6,
                        descricao_tecnica="Cura técnica",
                        descricao_cliente="Cura cliente",
                    ),
                )

                await session.refresh(etapa_original)
                await session.refresh(sub_original)
                await session.refresh(marco_original)
                etapas_horizonte = await listar_etapas(session, horizonte_tax.id)
                sub_horizonte = (
                    await listar_etapas(
                        session, horizonte_tax.id, parent_id=etapas_horizonte[0].id
                    )
                )[0]
                marcos_horizonte = await listar_marcos(session, sub_horizonte.id)

                assert etapa_original.nome == "Estrutura"
                assert sub_original.nome == "Concreto"
                assert marco_original.nome == "Concretagem"
                assert etapas_horizonte[0].nome == "Estrutura"
                assert sub_horizonte.nome == "Concreto"
                assert [marco.nome for marco in marcos_horizonte] == ["Concretagem"]
                assert [marco.nome for marco in await listar_marcos(session, sub_aurora.id)] == [
                    "Concretagem Aurora",
                    extra.nome,
                ]
                assert (
                    await buscar_taxonomia_do_empreendimento(session, aurora.id)
                ).id == aurora_tax.id

                with pytest.raises(ValueError):
                    await criar_etapa(session, EtapaCriar(taxonomia_id=padrao.id, nome="Indevido"))

                await session.rollback()
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_persiste_descricao_cliente_em_etapa_e_marco():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                taxonomia = Taxonomia(nome="Taxonomia", is_padrao=False)
                session.add(taxonomia)
                await session.flush()
                etapa = await criar_etapa(
                    session,
                    EtapaCriar(
                        taxonomia_id=taxonomia.id,
                        nome="Instalações",
                        descricao_tecnica="Execução técnica",
                        descricao_cliente="Instalação explicada ao comprador",
                    ),
                )
                marco = await criar_marco(
                    session,
                    MarcoCriar(
                        etapa_id=etapa.id,
                        nome="Redes hidráulicas",
                        descricao_tecnica="Redes embutidas",
                        descricao_cliente="Tubulações instaladas nas paredes",
                    ),
                )
                await atualizar_etapa(
                    session,
                    etapa.id,
                    EtapaAtualizar(descricao_cliente="Instalação atualizada ao comprador"),
                )
                await atualizar_marco(
                    session,
                    marco.id,
                    MarcoAtualizar(descricao_cliente="Tubulações atualizadas nas paredes"),
                )
                await session.commit()

            async with factory() as session:
                etapa_persistida = await session.get(Etapa, etapa.id)
                marco_persistido = await session.get(Marco, marco.id)
                assert etapa_persistida is not None
                assert marco_persistido is not None
                assert etapa_persistida.descricao_tecnica == "Execução técnica"
                assert etapa_persistida.descricao_cliente == "Instalação atualizada ao comprador"
                assert marco_persistido.descricao_tecnica == "Redes embutidas"
                assert marco_persistido.descricao_cliente == "Tubulações atualizadas nas paredes"
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_local_obra_persiste_campos_e_relacionamentos():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                _, _, _, obra, _, _, _ = await base(session)
                torre = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        nome=" Torre A ",
                        tipo=TipoLocal.TORRE,
                        ordem=2,
                    ),
                )
                bloco = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        nome="Bloco B",
                        tipo=TipoLocal.BLOCO,
                        ordem=1,
                    ),
                )
                pavimento = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        parent_id=bloco.id,
                        nome="1º pavimento",
                        tipo=TipoLocal.PAVIMENTO,
                    ),
                )
                await session.commit()

            async with factory() as session:
                raizes = await listar_locais(session, obra.id)
                assert [local.id for local in raizes] == [bloco.id, torre.id]

                encontrado = await buscar_local(session, pavimento.id)
                assert encontrado.tipo is TipoLocal.PAVIMENTO
                assert encontrado.ordem == 0
                assert encontrado.criado_em is not None
                assert encontrado.atualizado_em is not None
                assert LocalLer.model_validate(encontrado).nome == "1º pavimento"

                empreendimento = await session.scalar(
                    select(Empreendimento)
                    .where(Empreendimento.id == obra.id)
                    .options(
                        selectinload(Empreendimento.locais_obra).selectinload(LocalObra.filhos),
                        selectinload(Empreendimento.locais_obra).selectinload(LocalObra.pai),
                    )
                )
                assert empreendimento is not None
                locais = {local.id: local for local in empreendimento.locais_obra}
                assert locais[bloco.id].filhos == [locais[pavimento.id]]
                assert locais[pavimento.id].pai is locais[bloco.id]
                assert all(local.empreendimento is empreendimento for local in locais.values())
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


def test_cria_e_persiste_empreendimento():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                criado = await criar_empreendimento(
                    session,
                    EmpreendimentoCriar(
                        nome="  Residencial Aurora  ",
                        descricao="  Duas torres  ",
                        endereco="  Avenida Central, 100  ",
                        status="EM_ANDAMENTO",
                    ),
                )
                identificador = criado.id
                await session.commit()

            async with factory() as session:
                persistido = await session.scalar(
                    select(Empreendimento).where(Empreendimento.id == identificador)
                )
                assert persistido is not None
                assert persistido.nome == "Residencial Aurora"
                assert persistido.descricao == "Duas torres"
                assert persistido.endereco == "Avenida Central, 100"
                assert persistido.status == "EM_ANDAMENTO"
        finally:
            await engine.dispose()

    asyncio.run(executar())


def test_atualiza_empreendimento_sem_alterar_campos_ausentes_ou_estrutura():
    async def executar():
        engine, factory = await cenario()
        try:
            async with factory() as session:
                obra = await criar_empreendimento(
                    session,
                    EmpreendimentoCriar(
                        nome="Aurora",
                        descricao="Duas torres",
                        endereco="Avenida Central, 100",
                        status="PLANEJADO",
                    ),
                )
                local = await criar_local(
                    session,
                    LocalCriar(
                        empreendimento_id=obra.id,
                        nome="Torre A",
                        tipo=TipoLocal.TORRE,
                    ),
                )
                atualizado_em_anterior = obra.atualizado_em

                atualizado = await atualizar_empreendimento(
                    session,
                    obra.id,
                    EmpreendimentoAtualizar(nome="Aurora Norte"),
                )

                assert atualizado.nome == "Aurora Norte"
                assert atualizado.descricao == "Duas torres"
                assert atualizado.endereco == "Avenida Central, 100"
                assert atualizado.status == "PLANEJADO"
                assert atualizado.atualizado_em != atualizado_em_anterior
                locais = (
                    await session.scalars(
                        select(LocalObra).where(LocalObra.empreendimento_id == obra.id)
                    )
                ).all()
                assert [(item.id, item.nome, item.parent_id) for item in locais] == [
                    (local.id, "Torre A", None)
                ]
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
