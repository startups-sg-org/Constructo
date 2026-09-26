from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_usuario_autenticado

from .esquemas import EmpreendimentoAtualizar, EmpreendimentoCriar, EmpreendimentoLer
from .servicos import atualizar_empreendimento, buscar_empreendimento, criar_empreendimento

router = APIRouter(prefix="/empreendimentos", tags=["empreendimentos"])


@router.post("/", response_model=EmpreendimentoLer, status_code=201)
async def cadastrar_empreendimento(
    dados: EmpreendimentoCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
):
    return await criar_empreendimento(session, dados)


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
