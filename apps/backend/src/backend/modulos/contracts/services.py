import uuid
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .repository import EmpresaRepo, ContratosRepo, ItensContratuaisRepo
from .models import Empresa

from .schema.empresas_schema import (
    TipoEmpresaEnum,
    Empresa_FromRequest_Schema,
    Empresa_UpdateRequest_Schema,
    Empresa_StatusRequest_Schema,
    Empresa_FromDB_Schema,
    EmpresaResumo_FromDB_Schema,
)

from .schema.contratos_schema import (
    StatusContratoEnum,
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


class EmpresaService:
    def __init__(self) -> None:
        self.repo = EmpresaRepo()

    async def create_empresa(
        self, db: AsyncSession, payload: Empresa_FromRequest_Schema, tipo: TipoEmpresaEnum
    ) -> Empresa_FromDB_Schema:
        # Regra: CNPJ Único
        cnpj_exists = await db.execute(select(Empresa).where(Empresa.cnpj == payload.cnpj))
        if cnpj_exists.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="CNPJ já cadastrado no sistema.")

        # Regra: Email Único
        email_exists = await db.execute(select(Empresa).where(Empresa.email == payload.email))
        if email_exists.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="E-mail já cadastrado no sistema.")

        return await self.repo.create_empresa(db, payload, tipo)

    async def get_empresa_by_id(
        self, db: AsyncSession, empresa_id: uuid.UUID
    ) -> Empresa_FromDB_Schema:
        empresa = await self.repo.get_empresa_by_id(db, empresa_id)
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa não encontrada.")
        return empresa

    async def get_all_empresas(
        self, db: AsyncSession
    ) -> list[EmpresaResumo_FromDB_Schema]:
        return await self.repo.get_all_empresas(db)

    async def update_empresa(
        self, db: AsyncSession, empresa_id: uuid.UUID, payload: Empresa_UpdateRequest_Schema
    ) -> Empresa_FromDB_Schema:
        empresa_db = await self.repo.get_empresa_by_id(db, empresa_id)
        if not empresa_db:
            raise HTTPException(status_code=404, detail="Empresa não encontrada.")

        if not empresa_db.ativo:
            raise HTTPException(status_code=403, detail="Não é possível alterar uma empresa inativa.")

        # Valida conflito em caso de mudança de CNPJ e/ou Email
        if payload.cnpj and payload.cnpj != empresa_db.cnpj:
            cnpj_exists = await db.execute(select(Empresa).where(Empresa.cnpj == payload.cnpj))
            if cnpj_exists.scalar_one_or_none():
                raise HTTPException(status_code=409, detail="CNPJ já cadastrado em outra empresa.")
                
        if payload.email and payload.email != empresa_db.email:
            email_exists = await db.execute(select(Empresa).where(Empresa.email == payload.email))
            if email_exists.scalar_one_or_none():
                raise HTTPException(status_code=409, detail="E-mail já cadastrado em outra empresa.")

        return await self.repo.update_empresa(db, empresa_id, payload)

    async def desativar_empresa(
        self, db: AsyncSession, empresa_id: uuid.UUID, payload: Empresa_StatusRequest_Schema
    ) -> Empresa_FromDB_Schema:
        empresa_db = await self.repo.get_empresa_by_id(db, empresa_id)
        if not empresa_db:
            raise HTTPException(status_code=404, detail="Empresa não encontrada.")

        if empresa_db.ativo == payload.ativo:
            status_str = "ativo" if payload.ativo else "inativo"
            raise HTTPException(status_code=400, detail=f"A empresa já se encontra com status {status_str}.")

        return await self.repo.desativar_empresa(db, empresa_id, payload)


class ContratoService:
    def __init__(self) -> None:
        self.contrato_repo = ContratosRepo()
        self.empresa_repo = EmpresaRepo()

    async def create_contrato(
        self, db: AsyncSession, payload: Contrato_FromRequest_Schema
    ) -> Contrato_FromDB_Schema:
        if payload.contratante_id == payload.contratado_id:
            raise HTTPException(
                status_code=400, detail="Contratante e contratada não podem ser a mesma empresa."
            )

        contratante = await self.empresa_repo.get_empresa_by_id(db, payload.contratante_id)
        if not contratante:
            raise HTTPException(status_code=404, detail="Empresa contratante não encontrada.")
        
        contratado = await self.empresa_repo.get_empresa_by_id(db, payload.contratado_id)
        if not contratado:
            raise HTTPException(status_code=404, detail="Empresa contratada não encontrada.")

        if contratante.type != TipoEmpresaEnum.CONTRATANTE:
            raise HTTPException(
                status_code=400, detail="A empresa fornecida como contratante possui tipo inválido."
            )

        if contratado.type != TipoEmpresaEnum.CONTRATADA:
            raise HTTPException(
                status_code=400, detail="A empresa fornecida como contratada possui tipo inválido."
            )

        # Regra: Empresas devem estar ativas
        if not contratante.ativo:
            raise HTTPException(status_code=403, detail="A empresa contratante está inativa.")
            
        if not contratado.ativo:
            raise HTTPException(status_code=403, detail="A empresa contratada está inativa.")

        return await self.contrato_repo.create_contrato(db, payload)

    async def get_contrato(
        self, db: AsyncSession, contrato_id: uuid.UUID
    ) -> Contrato_FromDB_Schema:
        contrato = await self.contrato_repo.get_contrato(db, contrato_id)
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato não encontrado.")
        return contrato

    async def update_contrato(
        self, db: AsyncSession, contrato_id: uuid.UUID, payload: Contrato_UpdateRequest_Schema
    ) -> Contrato_FromDB_Schema:
        contrato = await self.contrato_repo.get_contrato(db, contrato_id)
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato não encontrado.")

        if contrato.status == StatusContratoEnum.FINALIZADO:
            raise HTTPException(status_code=403, detail="Não é possível alterar um contrato já finalizado.")

        return await self.contrato_repo.update_contrato(db, contrato_id, payload)

    async def atualizar_status_contrato(
        self, db: AsyncSession, contrato_id: uuid.UUID, payload: Contrato_StatusRequest_Schema
    ) -> Contrato_FromDB_Schema:
        contrato = await self.contrato_repo.get_contrato(db, contrato_id)
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato não encontrado.")

        if contrato.status == payload.status:
            raise HTTPException(status_code=400, detail=f"O contrato já possui o status '{payload.status}'.")

        if contrato.status == StatusContratoEnum.FINALIZADO:
            raise HTTPException(status_code=403, detail="Não é possível reabrir ou alterar o status de um contrato já finalizado.")

        return await self.contrato_repo.atualizar_status_contrato(db, contrato_id, payload)


class ItemContratualService:
    def __init__(self) -> None:
        self.item_repo = ItensContratuaisRepo()
        self.contrato_repo = ContratosRepo()

    async def create_item_contratual(
        self, db: AsyncSession, contrato_id: uuid.UUID, payload: ItemContratual_FromRequest_Schema
    ) -> ItemContratual_FromDB_Schema:
        contrato = await self.contrato_repo.get_contrato(db, contrato_id)
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato não encontrado.")
            
        if contrato.status != StatusContratoEnum.ATIVO:
            raise HTTPException(status_code=403, detail="Só é permitido adicionar itens a contratos ATIVOS.")

        return await self.item_repo.create_item_contratual(db, contrato_id, payload)

    async def get_item_contratual(
        self, db: AsyncSession, contrato_id: uuid.UUID, item_id: uuid.UUID
    ) -> ItemContratual_FromDB_Schema:
        item = await self.item_repo.get_item_contratual(db, contrato_id, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item contratual não encontrado.")
        return item
    
    async def update_item_contratual(
        self, db: AsyncSession, contrato_id: uuid.UUID, item_id: uuid.UUID, payload: ItemContratual_UpdateRequest_Schema
    ) -> ItemContratual_FromDB_Schema:
        contrato = await self.contrato_repo.get_contrato(db, contrato_id)
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato não encontrado.")
            
        if contrato.status != StatusContratoEnum.ATIVO:
            raise HTTPException(status_code=403, detail="Só é permitido alterar itens de contratos ATIVOS.")
            
        item = await self.item_repo.get_item_contratual(db, contrato_id, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item contratual não encontrado.")

        return await self.item_repo.update_item_contratual(db, contrato_id, item_id, payload)
