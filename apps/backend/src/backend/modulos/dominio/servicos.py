"""Operações transacionais do Epic 1; os futuros routers usam a mesma sessão.

Quem chama confirma ou desfaz a transação. No FastAPI, get_db já faz isso.
"""

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modulos.usuarios.modelos import Usuario

from .esquemas import (
    EmpreendimentoAtualizar,
    EmpreendimentoCriar,
    EtapaAtualizar,
    EtapaCriar,
    EvidenciaCriar,
    LocalAtualizar,
    LocalCriar,
    LocalHierarquiaLer,
    LocalLer,
    MarcoAtualizar,
    MarcoCriar,
    ProgressoMarcoCriar,
    PublicacaoCriar,
    TaxonomiaCriar,
    TaxonomiaConfigurar,
    TaxonomiaPersonalizar,
)
from .modelos import (
    Empreendimento,
    Etapa,
    Evidencia,
    LocalObra,
    Marco,
    ProgressoMarco,
    Publicacao,
    PublicacaoEvidencia,
    Taxonomia,
    UsuarioEmpreendimento,
    UsuarioUnidade,
)
from .regras import (
    EstadoMarco,
    Papel,
    TipoLocal,
    calcular_progresso,
    validar_transicao,
)


async def _exigir(session: AsyncSession, classe, identificador: int):
    obj = await session.get(classe, identificador)
    if obj is None:
        raise ValueError(f"{classe.__name__} inexistente: {identificador}")
    return obj


async def _exigir_taxonomia_editavel(session: AsyncSession, taxonomia_id: int) -> Taxonomia:
    taxonomia = await _exigir(session, Taxonomia, taxonomia_id)
    if taxonomia.is_padrao and taxonomia.empreendimento_id is None:
        raise ValueError("Taxonomia padrão deve ser personalizada antes de ser alterada")
    return taxonomia


async def criar_empreendimento(session: AsyncSession, dados: EmpreendimentoCriar) -> Empreendimento:
    empreendimento = Empreendimento(**dados.model_dump(mode="json"))
    session.add(empreendimento)
    await session.flush()
    await session.refresh(empreendimento)
    return empreendimento


async def listar_empreendimentos(session: AsyncSession) -> list[Empreendimento]:
    return list(
        (
            await session.scalars(
                select(Empreendimento).order_by(
                    Empreendimento.criado_em.desc(), Empreendimento.id.desc()
                )
            )
        ).all()
    )


async def listar_empreendimentos_do_gestor(
    session: AsyncSession, usuario_id: int
) -> list[Empreendimento]:
    consulta = (
        select(Empreendimento)
        .join(UsuarioEmpreendimento)
        .where(UsuarioEmpreendimento.usuario_id == usuario_id)
        .order_by(Empreendimento.criado_em.desc(), Empreendimento.id.desc())
    )
    return list((await session.scalars(consulta)).all())


async def buscar_empreendimento(session: AsyncSession, empreendimento_id: int) -> Empreendimento:
    return await _exigir(session, Empreendimento, empreendimento_id)


async def atualizar_empreendimento(
    session: AsyncSession,
    empreendimento_id: int,
    dados: EmpreendimentoAtualizar,
) -> Empreendimento:
    empreendimento = await buscar_empreendimento(session, empreendimento_id)
    alteracoes = dados.model_dump(exclude_unset=True, mode="json")

    for campo, valor in alteracoes.items():
        setattr(empreendimento, campo, valor)

    empreendimento.atualizado_em = datetime.now(UTC)
    await session.flush()
    await session.refresh(empreendimento)
    return empreendimento


async def _validar_pai_local(
    session: AsyncSession,
    tipo: TipoLocal,
    parent_id: int | None,
    empreendimento_id: int,
    *,
    movido_id: int | None = None,
) -> None:
    pai = await _exigir(session, LocalObra, parent_id) if parent_id is not None else None
    if pai is not None and pai.empreendimento_id != empreendimento_id:
        raise ValueError("Pai e filho devem pertencer ao mesmo empreendimento")

    if movido_id is not None:
        visitados = {movido_id}
        ancestral = pai
        while ancestral is not None:
            if ancestral.id in visitados:
                raise ValueError("Ciclo detectado na estrutura física do empreendimento")
            if ancestral.empreendimento_id != empreendimento_id:
                raise ValueError("Pai e filho devem pertencer ao mesmo empreendimento")
            visitados.add(ancestral.id)
            ancestral = (
                await _exigir(session, LocalObra, ancestral.parent_id)
                if ancestral.parent_id is not None
                else None
            )

    tipo_pai = TipoLocal(pai.tipo) if pai is not None else None
    if tipo_pai is TipoLocal.UNIDADE:
        raise ValueError("Unidade não pode possuir filhos")
    if tipo is TipoLocal.TORRE and tipo_pai is not None:
        raise ValueError("Torre não pode possuir pai")
    if tipo is TipoLocal.BLOCO and tipo_pai is not None:
        raise ValueError("Bloco não pode possuir pai")
    if tipo is TipoLocal.PAVIMENTO and tipo_pai not in {TipoLocal.TORRE, TipoLocal.BLOCO}:
        raise ValueError("Pavimento deve possuir torre ou bloco como pai")
    if tipo is TipoLocal.UNIDADE and tipo_pai is not TipoLocal.PAVIMENTO:
        raise ValueError("Unidade deve possuir pavimento como pai")


async def criar_local(session: AsyncSession, dados: LocalCriar) -> LocalObra:
    await _exigir(session, Empreendimento, dados.empreendimento_id)
    await _validar_pai_local(session, dados.tipo, dados.parent_id, dados.empreendimento_id)
    local = LocalObra(**dados.model_dump())
    session.add(local)
    await session.flush()
    await session.refresh(local)
    return local


async def buscar_local(session: AsyncSession, local_id: int) -> LocalObra:
    return await _exigir(session, LocalObra, local_id)


async def atualizar_local(
    session: AsyncSession,
    empreendimento_id: int,
    local_id: int,
    dados: LocalAtualizar,
) -> LocalObra:
    local = await buscar_local(session, local_id)
    if local.empreendimento_id != empreendimento_id:
        raise ValueError("Local não pertence ao empreendimento")

    local.nome = dados.nome
    local.ordem = dados.ordem
    local.atualizado_em = datetime.now(UTC)
    await session.flush()
    await session.refresh(local)
    return local


async def listar_locais(
    session: AsyncSession, empreendimento_id: int, *, parent_id: int | None = None
) -> list[LocalObra]:
    await _exigir(session, Empreendimento, empreendimento_id)
    consulta = select(LocalObra).where(
        LocalObra.empreendimento_id == empreendimento_id,
        LocalObra.parent_id == parent_id,
    )
    return list((await session.scalars(consulta.order_by(LocalObra.ordem, LocalObra.id))).all())


async def listar_estrutura_fisica(
    session: AsyncSession, empreendimento_id: int
) -> list[LocalHierarquiaLer]:
    await _exigir(session, Empreendimento, empreendimento_id)
    locais = list(
        (
            await session.scalars(
                select(LocalObra)
                .where(LocalObra.empreendimento_id == empreendimento_id)
                .order_by(LocalObra.ordem, LocalObra.id)
            )
        ).all()
    )
    nos = {
        local.id: LocalHierarquiaLer(
            **LocalLer.model_validate(local).model_dump(),
            filhos=[],
        )
        for local in locais
    }
    raizes: list[LocalHierarquiaLer] = []

    for local in locais:
        no = nos[local.id]
        if local.parent_id is None:
            raizes.append(no)
        else:
            pai = nos.get(local.parent_id)
            if pai is not None:
                pai.filhos.append(no)

    return raizes


async def mover_local(session: AsyncSession, local_id: int, parent_id: int | None) -> LocalObra:
    local = await session.scalar(
        select(LocalObra).where(LocalObra.id == local_id).with_for_update()
    )
    if local is None:
        raise ValueError("Local inexistente")
    await _validar_pai_local(
        session, TipoLocal(local.tipo), parent_id, local.empreendimento_id, movido_id=local.id
    )
    local.parent_id = parent_id
    await session.flush()
    return local


async def criar_taxonomia(session: AsyncSession, dados: TaxonomiaCriar) -> Taxonomia:
    if dados.is_padrao and dados.empreendimento_id is not None:
        raise ValueError("Taxonomia padrão não deve pertencer a um empreendimento")
    if not dados.is_padrao and dados.empreendimento_id is None:
        raise ValueError("Taxonomia personalizada deve pertencer a um empreendimento")
    if dados.empreendimento_id is not None:
        await _exigir(session, Empreendimento, dados.empreendimento_id)
        existente = await session.scalar(
            select(Taxonomia).where(Taxonomia.empreendimento_id == dados.empreendimento_id)
        )
        if existente is not None:
            raise ValueError("Empreendimento já possui taxonomia")

    taxonomia = Taxonomia(**dados.model_dump())
    session.add(taxonomia)
    await session.flush()
    await session.refresh(taxonomia)
    return taxonomia


async def buscar_taxonomia(session: AsyncSession, taxonomia_id: int) -> Taxonomia:
    return await _exigir(session, Taxonomia, taxonomia_id)


async def listar_taxonomias_disponiveis(session: AsyncSession) -> list[Taxonomia]:
    return list(
        (
            await session.scalars(
                select(Taxonomia)
                .where(Taxonomia.is_padrao.is_(True), Taxonomia.empreendimento_id.is_(None))
                .order_by(Taxonomia.nome, Taxonomia.id)
            )
        ).all()
    )


async def configurar_taxonomia(
    session: AsyncSession, empreendimento_id: int, dados: TaxonomiaConfigurar
) -> Taxonomia:
    return await personalizar_taxonomia(
        session,
        empreendimento_id,
        TaxonomiaPersonalizar(
            origem_taxonomia_id=dados.origem_taxonomia_id,
            nome=dados.nome,
            descricao=dados.descricao,
        ),
    )


async def buscar_taxonomia_do_empreendimento(
    session: AsyncSession, empreendimento_id: int
) -> Taxonomia:
    await _exigir(session, Empreendimento, empreendimento_id)
    taxonomia = await session.scalar(
        select(Taxonomia).where(Taxonomia.empreendimento_id == empreendimento_id)
    )
    if taxonomia is None:
        raise ValueError("Empreendimento não possui taxonomia")
    return taxonomia


async def exigir_taxonomia_do_empreendimento(
    session: AsyncSession, empreendimento_id: int, taxonomia_id: int
) -> Taxonomia:
    taxonomia = await session.scalar(
        select(Taxonomia).where(
            Taxonomia.id == taxonomia_id,
            Taxonomia.empreendimento_id == empreendimento_id,
        )
    )
    if taxonomia is None:
        raise ValueError("Taxonomia não pertence ao empreendimento")
    return taxonomia


async def personalizar_taxonomia(
    session: AsyncSession, empreendimento_id: int, dados: TaxonomiaPersonalizar
) -> Taxonomia:
    await _exigir(session, Empreendimento, empreendimento_id)
    existente = await session.scalar(
        select(Taxonomia).where(Taxonomia.empreendimento_id == empreendimento_id)
    )
    if existente is not None:
        raise ValueError("Empreendimento já possui taxonomia personalizada")

    origem = await _exigir(session, Taxonomia, dados.origem_taxonomia_id)
    if origem.empreendimento_id == empreendimento_id:
        raise ValueError("Origem já pertence ao empreendimento informado")
    copia = Taxonomia(
        empreendimento_id=empreendimento_id,
        origem_taxonomia_id=origem.id,
        nome=dados.nome or origem.nome,
        descricao=dados.descricao if dados.descricao is not None else origem.descricao,
        is_padrao=False,
    )
    session.add(copia)
    await session.flush()

    etapas_origem = list(
        (
            await session.scalars(
                select(Etapa)
                .where(Etapa.taxonomia_id == origem.id)
                .order_by(Etapa.parent_id.is_not(None), Etapa.parent_id, Etapa.ordem, Etapa.id)
            )
        ).all()
    )
    mapa_etapas: dict[int, int] = {}
    for etapa_origem in etapas_origem:
        etapa = Etapa(
            taxonomia_id=copia.id,
            parent_id=mapa_etapas.get(etapa_origem.parent_id),
            nome=etapa_origem.nome,
            descricao_tecnica=etapa_origem.descricao_tecnica,
            descricao_cliente=etapa_origem.descricao_cliente,
            ordem=etapa_origem.ordem,
        )
        session.add(etapa)
        await session.flush()
        mapa_etapas[etapa_origem.id] = etapa.id

    if mapa_etapas:
        marcos = list(
            (
                await session.scalars(
                    select(Marco)
                    .where(Marco.etapa_id.in_(list(mapa_etapas)))
                    .order_by(Marco.etapa_id, Marco.ordem, Marco.id)
                )
            ).all()
        )
        session.add_all(
            Marco(
                etapa_id=mapa_etapas[marco.etapa_id],
                nome=marco.nome,
                descricao_tecnica=marco.descricao_tecnica,
                descricao_cliente=marco.descricao_cliente,
                ordem=marco.ordem,
            )
            for marco in marcos
        )

    await session.flush()
    await session.refresh(copia)
    return copia


async def _validar_pai_etapa(
    session: AsyncSession, taxonomia_id: int, parent_id: int | None, *, movida_id: int | None = None
) -> None:
    if parent_id is None:
        return
    pai = await _exigir(session, Etapa, parent_id)
    if pai.taxonomia_id != taxonomia_id:
        raise ValueError("Etapa pai pertence a outra taxonomia")
    if pai.parent_id is not None:
        raise ValueError("A V1 permite apenas etapa e subetapa")
    if movida_id is not None:
        if parent_id == movida_id:
            raise ValueError("Uma etapa não pode ser seu próprio pai")
        filhos = (await session.scalars(select(Etapa.id).where(Etapa.parent_id == movida_id))).all()
        if filhos:
            raise ValueError("Mover esta etapa aprofundaria suas subetapas")


async def criar_etapa(session: AsyncSession, dados: EtapaCriar) -> Etapa:
    await _exigir_taxonomia_editavel(session, dados.taxonomia_id)
    await _validar_pai_etapa(session, dados.taxonomia_id, dados.parent_id)
    etapa = Etapa(**dados.model_dump())
    session.add(etapa)
    await session.flush()
    return etapa


async def atualizar_etapa(session: AsyncSession, etapa_id: int, dados: EtapaAtualizar) -> Etapa:
    etapa = await session.scalar(select(Etapa).where(Etapa.id == etapa_id).with_for_update())
    if etapa is None:
        raise ValueError("Etapa inexistente")
    await _exigir_taxonomia_editavel(session, etapa.taxonomia_id)

    alteracoes = dados.model_dump(exclude_unset=True)
    if "parent_id" in alteracoes:
        await _validar_pai_etapa(
            session, etapa.taxonomia_id, alteracoes["parent_id"], movida_id=etapa.id
        )

    for campo, valor in alteracoes.items():
        setattr(etapa, campo, valor)

    await session.flush()
    await session.refresh(etapa)
    return etapa


async def listar_etapas(
    session: AsyncSession, taxonomia_id: int, *, parent_id: int | None = None
) -> list[Etapa]:
    await _exigir(session, Taxonomia, taxonomia_id)
    return list(
        (
            await session.scalars(
                select(Etapa)
                .where(Etapa.taxonomia_id == taxonomia_id, Etapa.parent_id == parent_id)
                .order_by(Etapa.ordem, Etapa.id)
            )
        ).all()
    )


async def exigir_etapa_do_empreendimento(
    session: AsyncSession, empreendimento_id: int, etapa_id: int
) -> Etapa:
    etapa = await session.scalar(
        select(Etapa)
        .join(Taxonomia)
        .where(
            Etapa.id == etapa_id,
            Taxonomia.empreendimento_id == empreendimento_id,
        )
    )
    if etapa is None:
        raise ValueError("Etapa não pertence ao empreendimento")
    return etapa


async def mover_etapa(session: AsyncSession, etapa_id: int, parent_id: int | None) -> Etapa:
    etapa = await session.scalar(select(Etapa).where(Etapa.id == etapa_id).with_for_update())
    if etapa is None:
        raise ValueError("Etapa inexistente")
    await _exigir_taxonomia_editavel(session, etapa.taxonomia_id)
    await _validar_pai_etapa(session, etapa.taxonomia_id, parent_id, movida_id=etapa.id)
    etapa.parent_id = parent_id
    await session.flush()
    return etapa


async def criar_marco(session: AsyncSession, dados: MarcoCriar) -> Marco:
    etapa = await _exigir(session, Etapa, dados.etapa_id)
    await _exigir_taxonomia_editavel(session, etapa.taxonomia_id)
    marco = Marco(**dados.model_dump())
    session.add(marco)
    await session.flush()
    await session.refresh(marco)
    return marco


async def atualizar_marco(session: AsyncSession, marco_id: int, dados: MarcoAtualizar) -> Marco:
    marco = await session.scalar(select(Marco).where(Marco.id == marco_id).with_for_update())
    if marco is None:
        raise ValueError("Marco inexistente")
    etapa = await _exigir(session, Etapa, marco.etapa_id)
    await _exigir_taxonomia_editavel(session, etapa.taxonomia_id)

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(marco, campo, valor)

    await session.flush()
    await session.refresh(marco)
    return marco


async def listar_marcos(session: AsyncSession, etapa_id: int) -> list[Marco]:
    await _exigir(session, Etapa, etapa_id)
    return list(
        (
            await session.scalars(
                select(Marco).where(Marco.etapa_id == etapa_id).order_by(Marco.ordem, Marco.id)
            )
        ).all()
    )


async def exigir_marco_do_empreendimento(
    session: AsyncSession, empreendimento_id: int, marco_id: int
) -> Marco:
    marco = await session.scalar(
        select(Marco)
        .join(Etapa)
        .join(Taxonomia)
        .where(
            Marco.id == marco_id,
            Taxonomia.empreendimento_id == empreendimento_id,
        )
    )
    if marco is None:
        raise ValueError("Marco não pertence ao empreendimento")
    return marco


async def vincular_gestor(
    session: AsyncSession, usuario_id: int, empreendimento_id: int
) -> UsuarioEmpreendimento:
    usuario = await _exigir(session, Usuario, usuario_id)
    await _exigir(session, Empreendimento, empreendimento_id)
    if not usuario.ativo or usuario.papel != Papel.GESTOR:
        raise ValueError("Gestor deve estar ativo e ter papel GESTOR")
    vinculo = UsuarioEmpreendimento(usuario_id=usuario_id, empreendimento_id=empreendimento_id)
    session.add(vinculo)
    await session.flush()
    return vinculo


async def vincular_comprador(
    session: AsyncSession, usuario_id: int, local_id: int
) -> UsuarioUnidade:
    usuario = await _exigir(session, Usuario, usuario_id)
    local = await _exigir(session, LocalObra, local_id)
    if not usuario.ativo or usuario.papel != Papel.COMPRADOR or local.tipo != TipoLocal.UNIDADE:
        raise ValueError("Vínculo requer comprador ativo e local do tipo UNIDADE")
    vinculo = UsuarioUnidade(usuario_id=usuario_id, local_obra_id=local_id)
    session.add(vinculo)
    await session.flush()
    return vinculo


async def pode_gerir(session: AsyncSession, usuario_id: int, empreendimento_id: int) -> bool:
    usuario = await session.get(Usuario, usuario_id)
    if usuario is None or not usuario.ativo:
        return False
    if usuario.papel == Papel.ADMIN:
        return True
    if usuario.papel != Papel.GESTOR:
        return False
    return await session.get(UsuarioEmpreendimento, (usuario_id, empreendimento_id)) is not None


async def pode_ler_unidade(session: AsyncSession, usuario_id: int, local_id: int) -> bool:
    usuario = await session.get(Usuario, usuario_id)
    if usuario is None or not usuario.ativo or usuario.papel != Papel.COMPRADOR:
        return False
    return await session.get(UsuarioUnidade, (usuario_id, local_id)) is not None


async def criar_progresso(session: AsyncSession, dados: ProgressoMarcoCriar) -> ProgressoMarco:
    local = await _exigir(session, LocalObra, dados.local_obra_id)
    if local.tipo != TipoLocal.UNIDADE:
        raise ValueError("O progresso só pode ser registrado em uma unidade")
    marco = await _exigir(session, Marco, dados.marco_id)
    etapa = await _exigir(session, Etapa, marco.etapa_id)
    taxonomia = await _exigir(session, Taxonomia, etapa.taxonomia_id)
    if taxonomia.empreendimento_id != local.empreendimento_id:
        raise ValueError("Marco e unidade pertencem a empreendimentos diferentes")
    progresso = ProgressoMarco(**dados.model_dump())
    session.add(progresso)
    await session.flush()
    await session.refresh(progresso)
    return progresso


async def alterar_estado(
    session: AsyncSession, progresso_id: int, novo: EstadoMarco, *, agora: datetime | None = None
) -> ProgressoMarco:
    progresso = await session.scalar(
        select(ProgressoMarco).where(ProgressoMarco.id == progresso_id).with_for_update()
    )
    if progresso is None:
        raise ValueError("Progresso inexistente")
    validar_transicao(EstadoMarco(progresso.status), novo)
    instante = agora or datetime.now(UTC)
    if novo == EstadoMarco.EM_ANDAMENTO:
        progresso.iniciado_em = progresso.iniciado_em or instante
        progresso.concluido_em = None
    else:
        if progresso.iniciado_em is None or instante < progresso.iniciado_em:
            raise ValueError("Conclusão deve ocorrer após o início")
        progresso.concluido_em = instante
    progresso.status = novo
    await session.flush()
    return progresso


async def criar_publicacao(
    session: AsyncSession, dados: PublicacaoCriar, *, autor_id: int, publicar: bool = False
) -> Publicacao:
    progresso = await _exigir(session, ProgressoMarco, dados.progresso_marco_id)
    if not await pode_gerir_empreendimento_do_progresso(session, autor_id, progresso):
        raise ValueError("Publicação requer gestor autorizado")
    ids = dados.evidencia_ids
    evidencias = (await session.scalars(select(Evidencia).where(Evidencia.id.in_(ids)))).all()
    if (
        len(set(ids)) != len(ids)
        or len(evidencias) != len(ids)
        or any(evidencia.progresso_marco_id != progresso.id for evidencia in evidencias)
    ):
        raise ValueError("Selecione evidências existentes do mesmo marco da publicação")
    publicacao = Publicacao(
        progresso_marco_id=progresso.id,
        titulo=dados.titulo,
        texto_cliente=dados.texto_cliente,
        proximo_passo=dados.proximo_passo,
        publicado_em=datetime.now(UTC) if publicar else None,
        publicado_por=autor_id if publicar else None,
    )
    session.add(publicacao)
    await session.flush()
    session.add_all(PublicacaoEvidencia(publicacao_id=publicacao.id, evidencia_id=i) for i in ids)
    await session.flush()
    return publicacao


async def publicar_rascunho(
    session: AsyncSession, publicacao_id: int, *, autor_id: int
) -> Publicacao:
    publicacao = await session.scalar(
        select(Publicacao).where(Publicacao.id == publicacao_id).with_for_update()
    )
    if publicacao is None or publicacao.publicado_em is not None:
        raise ValueError("Rascunho inexistente ou já publicado")
    progresso = await _exigir(session, ProgressoMarco, publicacao.progresso_marco_id)
    if not await pode_gerir_empreendimento_do_progresso(session, autor_id, progresso):
        raise ValueError("Publicação requer gestor autorizado")
    fotos = (
        await session.scalars(
            select(PublicacaoEvidencia).where(PublicacaoEvidencia.publicacao_id == publicacao_id)
        )
    ).all()
    if not fotos:
        raise ValueError("A publicação precisa de evidências selecionadas")
    publicacao.publicado_por = autor_id
    publicacao.publicado_em = datetime.now(UTC)
    await session.flush()
    return publicacao


async def registrar_evidencia(session: AsyncSession, dados: EvidenciaCriar) -> Evidencia:
    progresso = await _exigir(session, ProgressoMarco, dados.progresso_marco_id)
    if not await pode_gerir_empreendimento_do_progresso(session, dados.usuario_id, progresso):
        raise ValueError("Evidência requer gestor autorizado")
    evidencia = Evidencia(**dados.model_dump())
    session.add(evidencia)
    await session.flush()
    return evidencia


async def publicacoes_da_unidade(
    session: AsyncSession, *, usuario_id: int, local_id: int
) -> list[Publicacao]:
    if not await pode_ler_unidade(session, usuario_id, local_id):
        raise ValueError("Comprador sem acesso à unidade")
    return list(
        (
            await session.scalars(
                select(Publicacao)
                .join(ProgressoMarco)
                .where(
                    ProgressoMarco.local_obra_id == local_id,
                    Publicacao.publicado_em.is_not(None),
                )
                .order_by(Publicacao.publicado_em.desc())
            )
        ).all()
    )


async def pode_gerir_empreendimento_do_progresso(
    session: AsyncSession, usuario_id: int, progresso: ProgressoMarco
) -> bool:
    local = await _exigir(session, LocalObra, progresso.local_obra_id)
    return await pode_gerir(session, usuario_id, local.empreendimento_id)


async def calcular_progresso_unidade(
    session: AsyncSession, local_id: int, etapa_id: int | None = None
) -> int:
    unidade = await _exigir(session, LocalObra, local_id)
    if unidade.tipo != TipoLocal.UNIDADE:
        raise ValueError("O local não é uma unidade")
    consulta = (
        select(Marco.id, ProgressoMarco.status)
        .join(Etapa, Etapa.id == Marco.etapa_id)
        .join(Taxonomia, Taxonomia.id == Etapa.taxonomia_id)
        .outerjoin(
            ProgressoMarco,
            (ProgressoMarco.marco_id == Marco.id) & (ProgressoMarco.local_obra_id == local_id),
        )
        .where(Taxonomia.empreendimento_id == unidade.empreendimento_id)
    )
    if etapa_id is not None:
        etapa = await _exigir(session, Etapa, etapa_id)
        taxonomia = await _exigir(session, Taxonomia, etapa.taxonomia_id)
        if taxonomia.empreendimento_id != unidade.empreendimento_id:
            raise ValueError("Etapa de outro empreendimento")
        consulta = consulta.where((Etapa.id == etapa_id) | (Etapa.parent_id == etapa_id))
    estados = [
        EstadoMarco(status or EstadoMarco.NAO_INICIADO)
        for _, status in (await session.execute(consulta)).all()
    ]
    return calcular_progresso(estados)


async def calcular_progresso_empreendimento(session: AsyncSession, empreendimento_id: int) -> int:
    await _exigir(session, Empreendimento, empreendimento_id)
    unidades = (
        await session.scalars(
            select(LocalObra.id).where(
                LocalObra.empreendimento_id == empreendimento_id,
                LocalObra.tipo == TipoLocal.UNIDADE,
            )
        )
    ).all()
    marcos = (
        await session.scalars(
            select(Marco.id)
            .join(Etapa)
            .join(Taxonomia)
            .where(Taxonomia.empreendimento_id == empreendimento_id)
        )
    ).all()
    if not unidades or not marcos:
        return 0
    concluidos = (
        await session.scalars(
            select(ProgressoMarco.id).where(
                ProgressoMarco.local_obra_id.in_(unidades),
                ProgressoMarco.marco_id.in_(marcos),
                ProgressoMarco.status == EstadoMarco.CONCLUIDO,
            )
        )
    ).all()
    return round(100 * len(concluidos) / (len(unidades) * len(marcos)))
