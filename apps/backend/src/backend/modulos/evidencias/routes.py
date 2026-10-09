from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.dominio.rotas import exigir_acesso_ao_empreendimento
from backend.modulos.dominio.servicos import exigir_marco_do_empreendimento
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_admin_ou_gestor

from .schemas import (
    ItemProtocolo_Atualizar_Schema,
    ItemProtocolo_FromDB_Schema,
    ItemProtocolo_FromRequest_Schema,
    ProtocoloEvidencia_Atualizar_Schema,
    ProtocoloEvidencia_ComItens_FromDB_Schema,
    ProtocoloEvidencia_FromDB_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
    ProtocoloEvidencia_Status_Schema,
)
from .servicos import (
    associar_protocolo_ao_marco,
    atualizar_item_protocolo,
    atualizar_quantidade_minima,
    consultar_status_protocolo,
    criar_item_protocolo,
    criar_protocolo_evidencia,
    listar_itens_protocolo,
    listar_protocolos_evidencia,
    remover_associacao_do_protocolo,
    remover_item_protocolo,
)

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
    response_model=list[ProtocoloEvidencia_ComItens_FromDB_Schema],
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


@router.put(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/{protocolo_id}",
    response_model=ProtocoloEvidencia_FromDB_Schema,
)
async def associar_protocolo(
    empreendimento_id: int, marco_id: int, protocolo_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await associar_protocolo_ao_marco(session, marco_id, protocolo_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.delete(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/{protocolo_id}",
    status_code=204,
)
async def remover_associacao_protocolo(
    empreendimento_id: int, marco_id: int, protocolo_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
) -> Response:
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        await remover_associacao_do_protocolo(session, marco_id, protocolo_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro
    return Response(status_code=204)


@router.patch(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/{protocolo_id}",
    response_model=ProtocoloEvidencia_FromDB_Schema,
)
async def editar_quantidade_minima_protocolo(
    empreendimento_id: int, marco_id: int, protocolo_id: int,
    dados: ProtocoloEvidencia_Atualizar_Schema,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await atualizar_quantidade_minima(session, marco_id, protocolo_id, dados.quantidade_minima)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.get(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/{protocolo_id}/status",
    response_model=ProtocoloEvidencia_Status_Schema,
)
async def consultar_status_do_protocolo(
    empreendimento_id: int, marco_id: int, protocolo_id: int, progresso_marco_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await consultar_status_protocolo(session, marco_id, protocolo_id, progresso_marco_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.post(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/"
    "{protocolo_id}/itens",
    response_model=ItemProtocolo_FromDB_Schema,
    status_code=201,
)
async def cadastrar_item_protocolo(
    empreendimento_id: int,
    marco_id: int,
    protocolo_id: int,
    dados: ItemProtocolo_FromRequest_Schema,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await criar_item_protocolo(session, marco_id, protocolo_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.get(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/"
    "{protocolo_id}/itens",
    response_model=list[ItemProtocolo_FromDB_Schema],
)
async def consultar_itens_protocolo(
    empreendimento_id: int,
    marco_id: int,
    protocolo_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await listar_itens_protocolo(session, marco_id, protocolo_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.patch(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/"
    "{protocolo_id}/itens/{item_id}",
    response_model=ItemProtocolo_FromDB_Schema,
)
async def editar_item_protocolo(
    empreendimento_id: int,
    marco_id: int,
    protocolo_id: int,
    item_id: int,
    dados: ItemProtocolo_Atualizar_Schema,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await atualizar_item_protocolo(session, marco_id, protocolo_id, item_id, dados)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.delete(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/"
    "{protocolo_id}/itens/{item_id}",
    status_code=204,
)
async def excluir_item_protocolo(
    empreendimento_id: int,
    marco_id: int,
    protocolo_id: int,
    item_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
) -> Response:
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        await remover_item_protocolo(session, marco_id, protocolo_id, item_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro
    return Response(status_code=204)
