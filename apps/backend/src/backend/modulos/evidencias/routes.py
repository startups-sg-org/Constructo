from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.dominio.esquemas import EvidenciaLer
from backend.modulos.dominio.rotas import exigir_acesso_ao_empreendimento
from backend.modulos.dominio.servicos import exigir_marco_do_empreendimento
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_admin_ou_gestor

from .schemas import (
    EvidenciaItem_FromRequest_Schema,
    EvidenciaUpload_FromDB_Schema,
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
    registrar_arquivo_evidencia,
    registrar_evidencia_no_item,
    remover_associacao_do_protocolo,
    remover_item_protocolo,
)
from .storage import Storage, obter_storage
from .upload_service import ErroValidacaoUpload, salvar_evidencia

router = APIRouter(prefix="/empreendimentos", tags=["evidências"])
upload_router = APIRouter(prefix="/api/evidences", tags=["evidências"])


@upload_router.post(
    "/upload",
    response_model=EvidenciaUpload_FromDB_Schema,
    status_code=201,
)
async def upload_evidencia(
    empreendimento_id: Annotated[int, Form(gt=0)],
    arquivo: Annotated[UploadFile, File(alias="file")],
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
    storage: Annotated[Storage, Depends(obter_storage)],
) -> EvidenciaUpload_FromDB_Schema:
    """Recebe uma imagem e persiste seus metadados no empreendimento.

    Requer administrador ou gestor com acesso. Recebe `file` e
    `empreendimento_id` como multipart/form-data; retorna os dados do arquivo.
    """
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    evidencia = None
    try:
        evidencia = await salvar_evidencia(storage, arquivo, empreendimento_id)
        registro = await registrar_arquivo_evidencia(
            session,
            empreendimento_id=empreendimento_id,
            usuario_id=usuario.id,
            nome_original=(arquivo.filename or evidencia.nome)[:255],
            nome_armazenado=evidencia.nome,
            caminho=evidencia.caminho,
            url=evidencia.url,
            tipo_mime=evidencia.tipo_mime,
            tamanho=evidencia.tamanho,
        )
    except ErroValidacaoUpload as erro:
        raise HTTPException(status_code=erro.status_code, detail=str(erro)) from erro
    except Exception:
        if evidencia is not None:
            await storage.remover(evidencia.caminho)
        raise
    finally:
        await arquivo.close()

    return EvidenciaUpload_FromDB_Schema(
        id=registro.id,
        empreendimento_id=empreendimento_id,
        nome=evidencia.nome,
        caminho=evidencia.caminho,
        url=evidencia.url,
        tamanho=evidencia.tamanho,
        tipo_mime=evidencia.tipo_mime,
        criado_em=registro.criado_em,
    )


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
    """Cria um protocolo de evidência associado ao marco informado.

    Requer administrador ou gestor com acesso ao empreendimento. O corpo
    segue `ProtocoloEvidencia_FromRequest_Schema`; retorna o protocolo criado.
    """
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
    """Lista os protocolos associados ao marco, incluindo seus itens ordenados."""
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
    """Associa ou transfere o protocolo indicado para o marco da URL."""
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
    """Remove do marco o vínculo com o protocolo, preservando o protocolo."""
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
    """Atualiza a quantidade mínima de evidências exigida pelo protocolo.

    O corpo contém `quantidade_minima`, que deve ser maior ou igual a zero.
    """
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
    """Consulta o atendimento do protocolo para um progresso de marco.

    O query parameter `progresso_marco_id` limita a contagem àquele local e a
    resposta informa a quantidade registrada, o mínimo e os itens pendentes.
    """
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await consultar_status_protocolo(session, marco_id, protocolo_id, progresso_marco_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.post(
    "/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/"
    "{protocolo_id}/itens/{item_id}/evidencias",
    response_model=EvidenciaLer,
    status_code=201,
)
async def registrar_evidencia_item(
    empreendimento_id: int,
    marco_id: int,
    protocolo_id: int,
    item_id: int,
    dados: EvidenciaItem_FromRequest_Schema,
    session: Annotated[AsyncSession, Depends(get_db)],
    usuario: Annotated[Usuario, Depends(get_admin_ou_gestor)],
):
    """Registra uma evidência vinculada ao item do protocolo indicado.

    O corpo informa o progresso, URL do arquivo, descrição e data de captura.
    A URL deve corresponder a um upload registrado no mesmo empreendimento. O
    usuário capturador é obtido da sessão autenticada.
    """
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        return await registrar_evidencia_no_item(
            session,
            empreendimento_id=empreendimento_id,
            marco_id=marco_id,
            protocolo_id=protocolo_id,
            item_id=item_id,
            usuario_id=usuario.id,
            dados=dados,
        )
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
    """Cria um item no protocolo; aceita nome, ordem e se é obrigatório."""
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
    """Lista os itens do protocolo ordenados pela posição configurada."""
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
    """Atualiza parcialmente nome, descrição, obrigatoriedade ou ordem do item."""
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
    """Exclui o item informado do protocolo e retorna HTTP 204."""
    await exigir_acesso_ao_empreendimento(session, usuario, empreendimento_id)
    try:
        await exigir_marco_do_empreendimento(session, empreendimento_id, marco_id)
        await remover_item_protocolo(session, marco_id, protocolo_id, item_id)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro
    return Response(status_code=204)
