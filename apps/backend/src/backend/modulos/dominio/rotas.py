from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import (
    get_admin_ou_gestor,
)

from .esquemas import (
    EmpreendimentoAtualizar,
    EmpreendimentoCriar,
    EmpreendimentoLer,
    EtapaAtualizar,
    EtapaCriar,
    EtapaLer,
    EtapaTaxonomiaCriar,
    LocalAtualizar,
    LocalCriar,
    LocalHierarquiaLer,
    LocalLer,
    LocalRaizCriar,
    MarcoAtualizar,
    MarcoCriar,
    MarcoEtapaCriar,
    MarcoLer,
    ProgressoMarcoLer,
    HistoricoProgressoMarcoLer,
    ProgressoEtapaLer,
    PavimentoCriar,
    TaxonomiaLer,
    TaxonomiaConfigurar,
    TaxonomiaPersonalizar,
    UnidadeCriar,
)
from .regras import Papel
from .modelos import LocalObra, ProgressoMarco
from .servicos import (
    atualizar_empreendimento,
    atualizar_etapa,
    atualizar_local,
    atualizar_marco,
    buscar_empreendimento,
    buscar_taxonomia_do_empreendimento,
    configurar_taxonomia,
    criar_empreendimento,
    criar_etapa,
    criar_local,
    criar_marco,
    exigir_etapa_do_empreendimento,
    exigir_marco_do_empreendimento,
    exigir_taxonomia_do_empreendimento,
    listar_etapas,
    listar_empreendimentos,
    listar_empreendimentos_do_gestor,
    listar_taxonomias_disponiveis,
    listar_estrutura_fisica,
    listar_locais,
    listar_marcos,
    pode_gerir,
    personalizar_taxonomia,
    concluir_progresso,
    iniciar_progresso,
    reabrir_progresso,
    listar_historico_progresso,
    calcular_progresso_etapa,
    vincular_gestor,
)

router = APIRouter(prefix="/empreendimentos", tags=["empreendimentos"])


@router.post("/", response_model=EmpreendimentoLer, status_code=201)
async def cadastrar_empreendimento(
    dados: EmpreendimentoCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    empreendimento = await criar_empreendimento(session, dados)
    if usuario.papel == Papel.GESTOR:
        await vincular_gestor(session, usuario.id, empreendimento.id)
    return empreendimento


@router.get("/", response_model=list[EmpreendimentoLer])
async def consultar_empreendimentos(
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    if usuario.papel == Papel.ADMIN:
        return await listar_empreendimentos(session)
    return await listar_empreendimentos_do_gestor(session, usuario.id)


@router.get("/{empreendimento_id}", response_model=EmpreendimentoLer)
async def consultar_empreendimento(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await buscar_empreendimento(session, empreendimento_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.patch("/{empreendimento_id}", response_model=EmpreendimentoLer)
async def editar_empreendimento(
    empreendimento_id: int,
    dados: EmpreendimentoAtualizar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await atualizar_empreendimento(session, empreendimento_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


async def _exigir_acesso_ao_empreendimento(
    session: AsyncSession, usuario: Usuario, empreendimento_id: int
) -> None:
    if usuario.papel == Papel.ADMIN:
        return
    if not await pode_gerir(session, usuario.id, empreendimento_id):
        raise HTTPException(status_code=403, detail="Acesso negado ao empreendimento")


@router.get("/{empreendimento_id}/taxonomia", response_model=TaxonomiaLer)
async def consultar_taxonomia(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await buscar_taxonomia_do_empreendimento(session, empreendimento_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.get("/taxonomias/disponiveis", response_model=list[TaxonomiaLer])
async def consultar_taxonomias_disponiveis(
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    return await listar_taxonomias_disponiveis(session)


@router.post("/{empreendimento_id}/taxonomia/configurar", response_model=TaxonomiaLer, status_code=201)
async def configurar_taxonomia_empreendimento(
    empreendimento_id: int,
    dados: TaxonomiaConfigurar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await configurar_taxonomia(session, empreendimento_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.post("/{empreendimento_id}/taxonomia/personalizar", response_model=TaxonomiaLer, status_code=201)
async def cadastrar_taxonomia_personalizada(
    empreendimento_id: int,
    dados: TaxonomiaPersonalizar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await personalizar_taxonomia(session, empreendimento_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get("/{empreendimento_id}/taxonomia/etapas", response_model=list[EtapaLer])
async def consultar_etapas_taxonomia(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
    parent_id: int | None = None,
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        taxonomia = await buscar_taxonomia_do_empreendimento(session, empreendimento_id)
        if parent_id is not None:
            await exigir_etapa_do_empreendimento(session, empreendimento_id, parent_id)
        return await listar_etapas(session, taxonomia.id, parent_id=parent_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.post("/{empreendimento_id}/taxonomia/etapas", response_model=EtapaLer, status_code=201)
async def cadastrar_etapa_taxonomia(
    empreendimento_id: int,
    dados: EtapaTaxonomiaCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        taxonomia = await buscar_taxonomia_do_empreendimento(session, empreendimento_id)
        if dados.parent_id is not None:
            await exigir_etapa_do_empreendimento(session, empreendimento_id, dados.parent_id)
        return await criar_etapa(
            session,
            EtapaCriar(taxonomia_id=taxonomia.id, **dados.model_dump()),
        )
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.patch("/{empreendimento_id}/taxonomia/etapas/{etapa_id}", response_model=EtapaLer)
async def editar_etapa_taxonomia(
    empreendimento_id: int,
    etapa_id: int,
    dados: EtapaAtualizar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_etapa_do_empreendimento(session, empreendimento_id, etapa_id)
        if dados.parent_id is not None:
            await exigir_etapa_do_empreendimento(session, empreendimento_id, dados.parent_id)
        return await atualizar_etapa(session, etapa_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get("/{empreendimento_id}/taxonomia/etapas/{etapa_id}/marcos", response_model=list[MarcoLer])
async def consultar_marcos_etapa(
    empreendimento_id: int,
    etapa_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_etapa_do_empreendimento(session, empreendimento_id, etapa_id)
        return await listar_marcos(session, etapa_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.post(
    "/{empreendimento_id}/taxonomia/etapas/{etapa_id}/marcos",
    response_model=MarcoLer,
    status_code=201,
)
async def cadastrar_marco_etapa(
    empreendimento_id: int,
    etapa_id: int,
    dados: MarcoEtapaCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_etapa_do_empreendimento(session, empreendimento_id, etapa_id)
        return await criar_marco(session, MarcoCriar(etapa_id=etapa_id, **dados.model_dump()))
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.patch("/{empreendimento_id}/taxonomia/marcos/{marco_id}", response_model=MarcoLer)
async def editar_marco_taxonomia(
    empreendimento_id: int,
    marco_id: int,
    dados: MarcoAtualizar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await atualizar_marco(session, marco_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get(
    "/{empreendimento_id}/estrutura-fisica",
    response_model=list[LocalHierarquiaLer],
)
async def consultar_estrutura_fisica(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await listar_estrutura_fisica(session, empreendimento_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.post(
    "/{empreendimento_id}/progressos/{progresso_id}/iniciar",
    response_model=ProgressoMarcoLer,
)
async def iniciar_progresso_marco(
    empreendimento_id: int,
    progresso_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        progresso = await iniciar_progresso(session, progresso_id, usuario_id=usuario.id)
        local = await session.get(LocalObra, progresso.local_obra_id)
        if local is None or local.empreendimento_id != empreendimento_id:
            raise ValueError("Progresso não pertence ao empreendimento")
        return progresso
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.post(
    "/{empreendimento_id}/progressos/{progresso_id}/concluir",
    response_model=ProgressoMarcoLer,
)
async def concluir_progresso_marco(
    empreendimento_id: int,
    progresso_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        progresso = await concluir_progresso(session, progresso_id, usuario_id=usuario.id)
        local = await session.get(LocalObra, progresso.local_obra_id)
        if local is None or local.empreendimento_id != empreendimento_id:
            raise ValueError("Progresso não pertence ao empreendimento")
        return progresso
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.post(
    "/{empreendimento_id}/progressos/{progresso_id}/reabrir",
    response_model=ProgressoMarcoLer,
)
async def reabrir_progresso_marco(
    empreendimento_id: int,
    progresso_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        progresso = await reabrir_progresso(session, progresso_id, usuario_id=usuario.id)
        local = await session.get(LocalObra, progresso.local_obra_id)
        if local is None or local.empreendimento_id != empreendimento_id:
            raise ValueError("Progresso não pertence ao empreendimento")
        return progresso
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get(
    "/{empreendimento_id}/progressos/{progresso_id}/historico",
    response_model=list[HistoricoProgressoMarcoLer],
)
async def consultar_historico_progresso(
    empreendimento_id: int,
    progresso_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        historico = await listar_historico_progresso(session, progresso_id, usuario_id=usuario.id)
        progresso = await session.get(ProgressoMarco, progresso_id)
        local = await session.get(LocalObra, progresso.local_obra_id) if progresso else None
        if local is None or local.empreendimento_id != empreendimento_id:
            raise ValueError("Progresso não pertence ao empreendimento")
        return historico
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get(
    "/{empreendimento_id}/locais/{local_id}/etapas/{etapa_id}/progresso",
    response_model=ProgressoEtapaLer,
)
async def consultar_progresso_etapa(
    empreendimento_id: int,
    local_id: int,
    etapa_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        local = await session.get(LocalObra, local_id)
        if local is None or local.empreendimento_id != empreendimento_id:
            raise ValueError("Local não pertence ao empreendimento")
        return await calcular_progresso_etapa(session, etapa_id, local_id, usuario_id=usuario.id)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get("/{empreendimento_id}/locais", response_model=list[LocalLer])
async def consultar_locais_raiz(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await listar_locais(session, empreendimento_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.post("/{empreendimento_id}/locais", response_model=LocalLer, status_code=201)
async def cadastrar_local_raiz(
    empreendimento_id: int,
    dados: LocalRaizCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await criar_local(
            session,
            LocalCriar(
                empreendimento_id=empreendimento_id,
                parent_id=None,
                **dados.model_dump(),
            ),
        )
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.patch("/{empreendimento_id}/locais/{local_id}", response_model=LocalLer)
async def editar_local(
    empreendimento_id: int,
    local_id: int,
    dados: LocalAtualizar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await atualizar_local(session, empreendimento_id, local_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Local não encontrado") from erro


@router.get("/{empreendimento_id}/locais/{parent_id}/pavimentos", response_model=list[LocalLer])
async def consultar_pavimentos(
    empreendimento_id: int,
    parent_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await listar_locais(session, empreendimento_id, parent_id=parent_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.post(
    "/{empreendimento_id}/locais/{parent_id}/pavimentos",
    response_model=LocalLer,
    status_code=201,
)
async def cadastrar_pavimento(
    empreendimento_id: int,
    parent_id: int,
    dados: PavimentoCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await criar_local(
            session,
            LocalCriar(
                empreendimento_id=empreendimento_id,
                parent_id=parent_id,
                tipo="PAVIMENTO",
                **dados.model_dump(),
            ),
        )
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro


@router.get(
    "/{empreendimento_id}/locais/{parent_id}/unidades",
    response_model=list[LocalLer],
)
async def consultar_unidades(
    empreendimento_id: int,
    parent_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await listar_locais(session, empreendimento_id, parent_id=parent_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.post(
    "/{empreendimento_id}/locais/{parent_id}/unidades",
    response_model=LocalLer,
    status_code=201,
)
async def cadastrar_unidade(
    empreendimento_id: int,
    parent_id: int,
    dados: UnidadeCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await criar_local(
            session,
            LocalCriar(
                empreendimento_id=empreendimento_id,
                parent_id=parent_id,
                tipo="UNIDADE",
                **dados.model_dump(),
            ),
        )
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
