from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_usuario_autenticado

from .esquemas import EmpreendimentoCriar, EmpreendimentoLer
from .servicos import criar_empreendimento

router = APIRouter(prefix="/empreendimentos", tags=["empreendimentos"])


@router.post("/", response_model=EmpreendimentoLer, status_code=201)
async def cadastrar_empreendimento(
    dados: EmpreendimentoCriar,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
):
    return await criar_empreendimento(session, dados)
