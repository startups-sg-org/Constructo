import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.modulos.contracts.models import Empresa

from .esquemas import (
    Empreendimento_FromDB_Schema,
    Empreendimento_FromRequest_Schema,
    Empreendimento_StatusRequest_Schema,
    Empreendimento_UpdateRequest_Schema,
    EmpreendimentoResumo_FromDB_Schema,
)
from .modelos import Empreendimento, StatusEmpreendimento


class EmpreendimentoRepo:
    async def get_empresa_by_id(self, db: AsyncSession, empresa_id: uuid.UUID) -> Empresa | None:
        return await db.get(Empresa, empresa_id)

    async def create_empreendimento(
        self,
        db: AsyncSession,
        payload: Empreendimento_FromRequest_Schema,
        status: StatusEmpreendimento,
    ) -> Empreendimento_FromDB_Schema:
        empreendimento = Empreendimento(status=status, **payload.model_dump())
        db.add(empreendimento)
        await db.flush()
        await db.refresh(empreendimento)
        return Empreendimento_FromDB_Schema.model_validate(empreendimento)

    async def get_empreendimento_by_id(
        self, db: AsyncSession, empreendimento_id: uuid.UUID
    ) -> Empreendimento_FromDB_Schema | None:
        empreendimento = await db.get(Empreendimento, empreendimento_id)
        if empreendimento is None:
            return None
        return Empreendimento_FromDB_Schema.model_validate(empreendimento)

    async def get_all_empreendimentos(
        self, db: AsyncSession
    ) -> list[EmpreendimentoResumo_FromDB_Schema]:
        resultado = await db.execute(select(Empreendimento).order_by(Empreendimento.nome))
        return [
            EmpreendimentoResumo_FromDB_Schema.model_validate(empreendimento)
            for empreendimento in resultado.scalars().all()
        ]

    async def update_empreendimento(
        self,
        db: AsyncSession,
        empreendimento_id: uuid.UUID,
        payload: Empreendimento_UpdateRequest_Schema,
    ) -> Empreendimento_FromDB_Schema | None:
        empreendimento = await db.get(Empreendimento, empreendimento_id)
        if empreendimento is None:
            return None
        for campo, valor in payload.model_dump(exclude_unset=True).items():
            setattr(empreendimento, campo, valor)
        await db.flush()
        await db.refresh(empreendimento)
        return Empreendimento_FromDB_Schema.model_validate(empreendimento)

    async def update_status(
        self,
        db: AsyncSession,
        empreendimento_id: uuid.UUID,
        payload: Empreendimento_StatusRequest_Schema,
    ) -> Empreendimento_FromDB_Schema | None:
        empreendimento = await db.get(Empreendimento, empreendimento_id)
        if empreendimento is None:
            return None
        empreendimento.status = payload.status
        await db.flush()
        await db.refresh(empreendimento)
        return Empreendimento_FromDB_Schema.model_validate(empreendimento)
