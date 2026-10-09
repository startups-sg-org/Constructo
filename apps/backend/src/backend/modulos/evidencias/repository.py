from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modulos.dominio.modelos import Marco

from .modulos import ProtocoloEvidencia
from .schemas import ProtocoloEvidencia_FromRequest_Schema


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
            .order_by(ProtocoloEvidencia.id)
        )
        return list(protocolos.all())
