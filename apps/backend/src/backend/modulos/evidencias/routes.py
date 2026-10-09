from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.dominio.rotas import exigir_acesso_ao_empreendimento, exigir_marco_do_empreendimento
from backend.modulos.dominio.servicos import exigir_marco_do_empreendimento
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_admin_ou_gestor

from .schemas import ProtocoloEvidencia_FromDB_Schema, ProtocoloEvidencia_FromRequest_Schema
from .servicos import criar_protocolo_evidencia, listar_protocolos_evidencia

router = APIRouter(prefix="/empreendimentos", tags=["evidências"])

@router.post(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia",
    response_model=ProtocoloEvidencia_FromDB_Schema,
    status_code=201,
)


async def cadastrar_protocolo_evidencia(
    empreendimento_id: int,
    marco_id: int,
    dados: ProtocoloEvidencia_FromRequest_Schema,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await criar_protocolo_evidencia(session, marco_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.get(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia",
    response_model=list[ProtocoloEvidencia_FromDB_Schema],
)
async def consultar_protocolos_evidencia(
    empreendimento_id: int,
    marco_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await listar_protocolos_evidencia(session, marco_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro
