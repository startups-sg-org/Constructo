import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_usuario_autenticado

from .esquemas import (
    Empreendimento_FromDB_Schema,
    Empreendimento_FromRequest_Schema,
    Empreendimento_StatusRequest_Schema,
    Empreendimento_UpdateRequest_Schema,
    EmpreendimentoResumo_FromDB_Schema,
)
from .servicos import EmpreendimentoService

router = APIRouter(prefix="/empreendimentos", tags=["Empreendimentos"])
empreendimento_service = EmpreendimentoService()


@router.post(
    "/",
    response_model=Empreendimento_FromDB_Schema,
    status_code=status.HTTP_201_CREATED,
)
async def create_empreendimento(
    payload: Empreendimento_FromRequest_Schema,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
) -> Empreendimento_FromDB_Schema:
    return await empreendimento_service.create_empreendimento(db, payload)


@router.get("/", response_model=list[EmpreendimentoResumo_FromDB_Schema])
async def list_empreendimentos(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
) -> list[EmpreendimentoResumo_FromDB_Schema]:
    return await empreendimento_service.get_all_empreendimentos(db)


@router.get("/{id}", response_model=Empreendimento_FromDB_Schema)
async def get_empreendimento(
    id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
) -> Empreendimento_FromDB_Schema:
    return await empreendimento_service.get_empreendimento_by_id(db, id)


@router.put("/{id}", response_model=Empreendimento_FromDB_Schema)
async def update_empreendimento(
    id: uuid.UUID,
    payload: Empreendimento_UpdateRequest_Schema,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
) -> Empreendimento_FromDB_Schema:
    return await empreendimento_service.update_empreendimento(db, id, payload)


@router.patch("/{id}/status", response_model=Empreendimento_FromDB_Schema)
async def update_status(
    id: uuid.UUID,
    payload: Empreendimento_StatusRequest_Schema,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[Usuario, Depends(get_usuario_autenticado)],
) -> Empreendimento_FromDB_Schema:
    return await empreendimento_service.update_status(db, id, payload)
