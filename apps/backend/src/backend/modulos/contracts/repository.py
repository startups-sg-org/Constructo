import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .schema.empresas_schema import (
    TipoEmpresaEnum,
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
    ContratoResumo_FromDB_Schema,
)

from .schema.itensContratuais_schemas import (
    ItemContratual_FromRequest_Schema,
    ItemContratual_UpdateRequest_Schema,
    ItemContratual_StatusRequest_Schema,
    ItemContratual_FromDB_Schema,
)

from .models import Empresa, Contrato, itens_contratuais


class EmpresaRepo:

    async def create_empresa(
        self, db: AsyncSession, payload: Empresa_FromRequest_Schema, tipo: TipoEmpresaEnum
    ) -> Empresa_FromDB_Schema:
        # tipo vem como parâmetro à parte — não faz parte do payload,
        # é a rota (/contratantes ou /contratadas) quem decide isso
        obj = Empresa(id=uuid.uuid4(), type=tipo, **payload.model_dump())
        db.add(obj)
        await db.flush()
        await db.refresh(obj)
        return Empresa_FromDB_Schema.model_validate(obj)

    async def get_empresa_by_id(self, db: AsyncSession, empresa_id: uuid.UUID) -> Empresa_FromDB_Schema | None:
        result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
        empresa = result.scalar_one_or_none()
        if empresa is None:
            return None
        return Empresa_FromDB_Schema.model_validate(empresa)

    async def get_all_empresas(self, db: AsyncSession) -> list[EmpresaResumo_FromDB_Schema]:
        result = await db.execute(select(Empresa))
        empresas = result.scalars().all()
        return [EmpresaResumo_FromDB_Schema.model_validate(empresa) for empresa in empresas]

    async def update_empresa(
        self, db: AsyncSession, empresa_id: uuid.UUID, payload: Empresa_UpdateRequest_Schema
    ) -> Empresa_FromDB_Schema | None:
        result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
        empresa = result.scalar_one_or_none()
        if empresa is None:
            return None

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(empresa, key, value)

        await db.flush()
        await db.refresh(empresa)
        return Empresa_FromDB_Schema.model_validate(empresa)

    async def desativar_empresa(
        self, db: AsyncSession, empresa_id: uuid.UUID, payload: Empresa_StatusRequest_Schema
    ) -> Empresa_FromDB_Schema | None:
        result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
        empresa = result.scalar_one_or_none()
        if empresa is None:
            return None

        empresa.ativo = payload.ativo
        await db.flush()
        await db.refresh(empresa)
        return Empresa_FromDB_Schema.model_validate(empresa)


class ContratosRepo:

    async def create_contrato(self, db: AsyncSession, payload: Contrato_FromRequest_Schema) -> Contrato_FromDB_Schema:
        obj = Contrato(id=uuid.uuid4(), **payload.model_dump())
        db.add(obj)
        await db.flush()
        # refresh normal só recarrega colunas — contratante/contratado são
        # relationships, precisam ser pedidos explicitamente aqui
        await db.refresh(obj, attribute_names=["contratante", "contratado"])
        return Contrato_FromDB_Schema.model_validate(obj)

    async def get_contrato(self, db: AsyncSession, contrato_id: uuid.UUID) -> Contrato_FromDB_Schema | None:
        result = await db.execute(
            select(Contrato)
            .options(selectinload(Contrato.contratante), selectinload(Contrato.contratado))
            .where(Contrato.id == contrato_id)
        )
        contrato = result.scalar_one_or_none()
        if contrato is None:
            return None
        return Contrato_FromDB_Schema.model_validate(contrato)

    async def update_contrato(
        self, db: AsyncSession, contrato_id: uuid.UUID, payload: Contrato_UpdateRequest_Schema
    ) -> Contrato_FromDB_Schema | None:
        result = await db.execute(
            select(Contrato)
            .options(selectinload(Contrato.contratante), selectinload(Contrato.contratado))
            .where(Contrato.id == contrato_id)
        )
        contrato = result.scalar_one_or_none()
        if contrato is None:
            return None

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(contrato, key, value)

        await db.flush()
        await db.refresh(contrato)
        return Contrato_FromDB_Schema.model_validate(contrato)

    async def atualizar_status_contrato(
        self, db: AsyncSession, contrato_id: uuid.UUID, payload: Contrato_StatusRequest_Schema
    ) -> Contrato_FromDB_Schema | None:
        # substitui a antiga exclusão física — contrato nunca é apagado
        # de verdade, só transita de status (ativo/inativo/finalizado)
        result = await db.execute(
            select(Contrato)
            .options(selectinload(Contrato.contratante), selectinload(Contrato.contratado))
            .where(Contrato.id == contrato_id)
        )
        contrato = result.scalar_one_or_none()
        if contrato is None:
            return None

        contrato.status = payload.status
        await db.flush()
        await db.refresh(contrato)
        return Contrato_FromDB_Schema.model_validate(contrato)


class ItensContratuaisRepo:
    # TODO: implementar create/get/update/status de itens contratuais.
    async def create_item_contratual(
        self, db: AsyncSession, contrato_id: uuid.UUID, payload: ItemContratual_FromRequest_Schema
    ) -> ItemContratual_FromDB_Schema:
        obj = itens_contratuais(id=uuid.uuid4(), contrato_id=contrato_id, **payload.model_dump())
        db.add(obj)
        await db.flush()
        await db.refresh(obj)
        return ItemContratual_FromDB_Schema.model_validate(obj)
    
    async def get_item_contratual(self, db: AsyncSession, contrato_id: uuid.UUID, item_id: uuid.UUID) -> ItemContratual_FromDB_Schema | None:
        result = await db.execute(
            select(itens_contratuais).where(itens_contratuais.id == item_id, itens_contratuais.contrato_id == contrato_id)
        )
        item = result.scalar_one_or_none()
        if item is None:
            return None
        return ItemContratual_FromDB_Schema.model_validate(item)
    
    async def update_item_contratual(self, db: AsyncSession, contrato_id: uuid.UUID, item_id: uuid.UUID, payload: ItemContratual_UpdateRequest_Schema) -> ItemContratual_FromDB_Schema | None:
        result = await db.execute(
            select(itens_contratuais).where(itens_contratuais.id == item_id, itens_contratuais.contrato_id == contrato_id)
        )
        item = result.scalar_one_or_none()
        if item is None:
            return None

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, key, value)

        await db.flush()
        await db.refresh(item)
        return ItemContratual_FromDB_Schema.model_validate(item)