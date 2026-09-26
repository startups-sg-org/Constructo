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
    LocalCriar,
    LocalLer,
    LocalRaizCriar,
)
from .servicos import (
    atualizar_empreendimento,
    buscar_empreendimento,
    criar_empreendimento,
    criar_local,
    listar_empreendimentos,
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
