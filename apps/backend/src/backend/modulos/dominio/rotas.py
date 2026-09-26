from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_usuario_autenticado

from .esquemas import (
    EmpreendimentoAtualizar,
    EmpreendimentoCriar,
    EmpreendimentoLer,
    LocalAtualizar,
    LocalCriar,
    LocalHierarquiaLer,
    LocalLer,
    LocalRaizCriar,
    PavimentoCriar,
    UnidadeCriar,
)
from .servicos import (
    atualizar_empreendimento,
    atualizar_local,
    buscar_empreendimento,
    criar_empreendimento,
    criar_local,
    listar_empreendimentos,
    listar_estrutura_fisica,
    listar_locais,
    pode_gerir,
)

router = APIRouter(prefix="/empreendimentos", tags=["empreendimentos"])


@router.post("/", response_model=EmpreendimentoLer, status_code=201)
async def cadastrar_empreendimento(
    dados: EmpreendimentoCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
):
    return await criar_empreendimento(session, dados)


@router.get("/", response_model=list[EmpreendimentoLer])
async def consultar_empreendimentos(
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
):
    return await listar_empreendimentos(session)


@router.get("/{empreendimento_id}", response_model=EmpreendimentoLer)
async def consultar_empreendimento(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
):
    try:
        return await buscar_empreendimento(session, empreendimento_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.patch("/{empreendimento_id}", response_model=EmpreendimentoLer)
async def editar_empreendimento(
    empreendimento_id: int,
    dados: EmpreendimentoAtualizar,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
):
    try:
        return await atualizar_empreendimento(session, empreendimento_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


async def _exigir_acesso_ao_empreendimento(
    session: AsyncSession, usuario: Usuario, empreendimento_id: int
) -> None:
    if not await pode_gerir(session, usuario.id, empreendimento_id):
        raise HTTPException(status_code=403, detail="Acesso negado ao empreendimento")


@router.get(
    "/{empreendimento_id}/estrutura-fisica",
    response_model=list[LocalHierarquiaLer],
)
async def consultar_estrutura_fisica(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
):
    await _exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        return await listar_estrutura_fisica(session, empreendimento_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail="Empreendimento não encontrado") from erro


@router.get("/{empreendimento_id}/locais", response_model=list[LocalLer])
async def consultar_locais_raiz(
    empreendimento_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
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
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
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
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
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
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
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
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
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
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
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
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
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
