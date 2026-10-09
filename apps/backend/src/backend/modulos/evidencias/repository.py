from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.modulos.dominio.modelos import Marco

from .modulos import ItemProtocolo, ProtocoloEvidencia
from .schemas import (
    ItemProtocolo_Atualizar_Schema,
    ItemProtocolo_FromRequest_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
)


class ProtocolosEvidenciaRepo:
    """Acesso persistente a protocolos de evidência e seus marcos."""

    async def buscar_marco_por_id(self, db: AsyncSession, marco_id: int) -> Marco | None:
        return await db.get(Marco, marco_id)

    async def criar_protocolo_evidencia(
        self,
        db: AsyncSession,
        marco_id: int,
        dados: ProtocoloEvidencia_FromRequest_Schema,
    ) -> ProtocoloEvidencia:
        protocolo = ProtocoloEvidencia(marco_id=marco_id, **dados.model_dump())
        db.add(protocolo)
        await db.flush()
        await db.refresh(protocolo)
        return protocolo

    async def listar_protocolos_evidencia(
        self, db: AsyncSession, marco_id: int
    ) -> list[ProtocoloEvidencia]:
        protocolos = await db.scalars(
            select(ProtocoloEvidencia)
            .where(ProtocoloEvidencia.marco_id == marco_id)
            .options(selectinload(ProtocoloEvidencia.itens))
            .order_by(ProtocoloEvidencia.id)
        )
        return list(protocolos.all())

    async def buscar_protocolo_por_id(
        self, db: AsyncSession, protocolo_id: int
    ) -> ProtocoloEvidencia | None:
        return await db.get(ProtocoloEvidencia, protocolo_id)


class ItensProtocoloRepo:
    """Acesso persistente aos itens que compõem um protocolo de evidência."""

    async def criar_item_protocolo(
        self,
        db: AsyncSession,
        protocolo_id: int,
        dados: ItemProtocolo_FromRequest_Schema,
    ) -> ItemProtocolo:
        item = ItemProtocolo(protocolo_id=protocolo_id, **dados.model_dump())
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    async def listar_itens_protocolo(
        self, db: AsyncSession, protocolo_id: int
    ) -> list[ItemProtocolo]:
        itens = await db.scalars(
            select(ItemProtocolo)
            .where(ItemProtocolo.protocolo_id == protocolo_id)
            .order_by(ItemProtocolo.ordem, ItemProtocolo.id)
        )
        return list(itens.all())

    async def buscar_item_protocolo(
        self, db: AsyncSession, protocolo_id: int, item_id: int
    ) -> ItemProtocolo | None:
        return await db.scalar(
            select(ItemProtocolo).where(
                ItemProtocolo.id == item_id,
                ItemProtocolo.protocolo_id == protocolo_id,
            )
        )

    async def atualizar_item_protocolo(
        self, db: AsyncSession, item: ItemProtocolo, dados: ItemProtocolo_Atualizar_Schema
    ) -> ItemProtocolo:
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(item, campo, valor)
        await db.flush()
        await db.refresh(item)
        return item

    async def remover_item_protocolo(self, db: AsyncSession, item: ItemProtocolo) -> None:
        await db.delete(item)
        await db.flush()
