from sqlalchemy.ext.asyncio import AsyncSession

from .modulos import ItemProtocolo, ProtocoloEvidencia
from .repository import ItensProtocoloRepo, ProtocolosEvidenciaRepo
from .schemas import (
    ItemProtocolo_Atualizar_Schema,
    ItemProtocolo_FromRequest_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
)

_repositorio = ProtocolosEvidenciaRepo()
_repositorio_itens = ItensProtocoloRepo()


async def _exigir_marco(session: AsyncSession, marco_id: int) -> None:
    marco = await _repositorio.buscar_marco_por_id(session, marco_id)
    if marco is None:
        raise ValueError(f"Marco inexistente: {marco_id}")


async def criar_protocolo_evidencia(
    session: AsyncSession,
    marco_id: int,
    dados: ProtocoloEvidencia_FromRequest_Schema,
) -> ProtocoloEvidencia:
    await _exigir_marco(session, marco_id)
    return await _repositorio.criar_protocolo_evidencia(session, marco_id, dados)


async def listar_protocolos_evidencia(
    session: AsyncSession, marco_id: int
) -> list[ProtocoloEvidencia]:
    await _exigir_marco(session, marco_id)
    return await _repositorio.listar_protocolos_evidencia(session, marco_id)


async def associar_protocolo_ao_marco(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> ProtocoloEvidencia:
    await _exigir_marco(session, marco_id)
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    if protocolo is None:
        raise ValueError(f"Protocolo inexistente: {protocolo_id}")
    return await _repositorio.associar_protocolo_ao_marco(session, protocolo, marco_id)


async def remover_associacao_do_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> None:
    await _exigir_marco(session, marco_id)
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    if protocolo is None or protocolo.marco_id != marco_id:
        raise ValueError(f"Protocolo inexistente no marco: {protocolo_id}")
    await _repositorio.remover_associacao_do_protocolo(session, protocolo)


async def _exigir_protocolo_do_marco(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> None:
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    if protocolo is None or protocolo.marco_id != marco_id:
        raise ValueError(f"Protocolo inexistente no marco: {protocolo_id}")


async def criar_item_protocolo(
    session: AsyncSession,
    marco_id: int,
    protocolo_id: int,
    dados: ItemProtocolo_FromRequest_Schema,
) -> ItemProtocolo:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    return await _repositorio_itens.criar_item_protocolo(session, protocolo_id, dados)


async def listar_itens_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> list[ItemProtocolo]:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    return await _repositorio_itens.listar_itens_protocolo(session, protocolo_id)


async def atualizar_item_protocolo(
    session: AsyncSession,
    marco_id: int,
    protocolo_id: int,
    item_id: int,
    dados: ItemProtocolo_Atualizar_Schema,
) -> ItemProtocolo:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    item = await _repositorio_itens.buscar_item_protocolo(session, protocolo_id, item_id)
    if item is None:
        raise ValueError(f"Item de protocolo inexistente: {item_id}")
    return await _repositorio_itens.atualizar_item_protocolo(session, item, dados)


async def remover_item_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int, item_id: int
) -> None:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    item = await _repositorio_itens.buscar_item_protocolo(session, protocolo_id, item_id)
    if item is None:
        raise ValueError(f"Item de protocolo inexistente: {item_id}")
    await _repositorio_itens.remover_item_protocolo(session, item)
