from typing import list
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

from .schema.empresas_schema import (
    Empresa_FromRequest_Schema,
    Empresa_UpdateRequest_Schema,
    Empresa_StatusRequest_Schema,
    Empresa_FromDB_Schema,
    EmpresaResumo_FromDB_Schema,
    EmpresaLite_FromDB_Schema,
)

from .schema.contratos_schema import (
    Contrato_FromRequest_Schema,
    Contrato_UpdateRequest_Schema,
    Contrato_StatusRequest_Schema,
    Contrato_FromDB_Schema,
    ContratoResumo_FromDB_Schema
)

from .schema.itensContratuais_schemas import (
    ItemContratual_FromRequest_Schema,
    ItemContratual_UpdateRequest_Schema,
    ItemContratual_StatusRequest_Schema,
    ItemContratual_FromDB_Schema
)

from .models import Empresa, Contrato, itens_contratuais

class EmpresaRepo:  

    async def create_empresa(self, db: AsyncSession, payload: Empresa_FromRequest_Schema) -> Empresa_FromDB_Schema: 
        obj = Empresa(**payload.dict())
        db.add(obj)
        await db.flush()
        await db.refresh(obj)
        return await Empresa_FromDB_Schema.from_orm(obj)

    async def get_empresa_by_id(self, db: AsyncSession, empresa_id: uuid.UUID) -> Empresa_FromDB_Schema | None:
        result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
        empresa = result.scalar_one_or_none()
        if empresa:
            return await Empresa_FromDB_Schema.from_orm(empresa)    
        return None

    async def get_all_empresas(self, db: AsyncSession) -> list[EmpresaResumo_FromDB_Schema]:
        result = await db.execute(select(Empresa))
        empresas = result.scalars().all()
        return [await EmpresaResumo_FromDB_Schema.from_orm(empresa) for empresa in empresas]

    async def update_empresa(self, db: AsyncSession, empresa_id: uuid.UUID, payload: Empresa_UpdateRequest_Schema) -> Empresa_FromDB_Schema | None:
        result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
        empresa = result.scalar_one_or_none()
        if empresa:
            for key, value in payload.dict(exclude_unset=True).items():
                setattr(empresa, key, value)
            await db.flush()
            await db.refresh(empresa)
            return await Empresa_FromDB_Schema.from_orm(empresa)
        return None
    
    async def desativar_empresa(self, db: AsyncSession, empresa_id: uuid.UUID, payload: Empresa_StatusRequest_Schema) -> Empresa_FromDB_Schema | None:
        result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
        empresa = result.scalar_one_or_none()
        if empresa:
            empresa.ativo = payload.ativo
            await db.flush()
            await db.refresh(empresa)
            return await Empresa_FromDB_Schema.from_orm(empresa)
        return None


class ContratosRepo:


    