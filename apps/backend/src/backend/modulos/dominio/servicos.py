"""Operações transacionais do Epic 1; os futuros routers usam a mesma sessão.

Quem chama confirma ou desfaz a transação. No FastAPI, get_db já faz isso.
"""

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modulos.usuarios.modelos import Usuario

from .esquemas import EtapaCriar, EvidenciaCriar, LocalCriar, ProgressoMarcoCriar, PublicacaoCriar
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
    validar_local,
    validar_transicao,
)


async def _exigir(session: AsyncSession, classe, identificador: int):
    obj = await session.get(classe, identificador)
    if obj is None:
        raise ValueError(f"{classe.__name__} inexistente: {identificador}")
    return obj


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
        raise ValueError("Pai pertence a outro empreendimento")
    validar_local(tipo, TipoLocal(pai.tipo) if pai else None)
    if movido_id is not None:
        visitados = {movido_id}
        while pai is not None:
            if pai.id in visitados:
                raise ValueError("Ciclo na estrutura da obra")
            visitados.add(pai.id)
            pai = await _exigir(session, LocalObra, pai.parent_id) if pai.parent_id else None


async def criar_local(session: AsyncSession, dados: LocalCriar) -> LocalObra:
    await _exigir(session, Empreendimento, dados.empreendimento_id)
    await _validar_pai_local(session, dados.tipo, dados.parent_id, dados.empreendimento_id)
    local = LocalObra(**dados.model_dump())
    session.add(local)
    await session.flush()
    return local


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
    await _exigir(session, Taxonomia, dados.taxonomia_id)
    await _validar_pai_etapa(session, dados.taxonomia_id, dados.parent_id)
    etapa = Etapa(**dados.model_dump())
    session.add(etapa)
    await session.flush()
    return etapa


async def mover_etapa(session: AsyncSession, etapa_id: int, parent_id: int | None) -> Etapa:
    etapa = await session.scalar(select(Etapa).where(Etapa.id == etapa_id).with_for_update())
    if etapa is None:
        raise ValueError("Etapa inexistente")
    await _validar_pai_etapa(session, etapa.taxonomia_id, parent_id, movida_id=etapa.id)
    etapa.parent_id = parent_id
    await session.flush()
    return etapa


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
