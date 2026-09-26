import uuid

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .esquemas import (
    Empreendimento_FromDB_Schema,
    Empreendimento_FromRequest_Schema,
    Empreendimento_StatusRequest_Schema,
    Empreendimento_UpdateRequest_Schema,
    EmpreendimentoResumo_FromDB_Schema,
    LocalObra_FromDB_Schema,
    LocalObra_FromRequest_Schema,
)
from .modelos import StatusEmpreendimento
from .repositorio import EmpreendimentoRepo


class EmpreendimentoService:
    def __init__(self) -> None:
        self.repo = EmpreendimentoRepo()

    async def create_local_obra(
        self,
        db: AsyncSession,
        empreendimento_id: uuid.UUID,
        payload: LocalObra_FromRequest_Schema,
        usuario,
    ) -> LocalObra_FromDB_Schema:
        empreendimento = await self.repo.get_local_empreendimento(db, empreendimento_id)
        if empreendimento is None:
            raise HTTPException(status_code=404, detail="Empreendimento não encontrado.")
        if getattr(usuario, "papel", None) not in {"ADMIN", "GESTOR"} and (
            getattr(usuario, "empreendimento", None) != empreendimento.nome
        ):
            raise HTTPException(status_code=403, detail="Usuário sem acesso ao empreendimento.")
        if empreendimento.status is StatusEmpreendimento.INATIVO:
            raise HTTPException(
                status_code=403,
                detail="Não é possível alterar um empreendimento inativo.",
            )
        return await self.repo.create_local_obra(db, empreendimento_id, payload)

    async def get_locais_obra(
        self, db: AsyncSession, empreendimento_id: uuid.UUID, usuario
    ) -> list[LocalObra_FromDB_Schema]:
        empreendimento = await self.repo.get_local_empreendimento(db, empreendimento_id)
        if empreendimento is None:
            raise HTTPException(status_code=404, detail="Empreendimento não encontrado.")
        if getattr(usuario, "papel", None) not in {"ADMIN", "GESTOR"} and (
            getattr(usuario, "empreendimento", None) != empreendimento.nome
        ):
            raise HTTPException(status_code=403, detail="Usuário sem acesso ao empreendimento.")
        return await self.repo.get_locais_obra(db, empreendimento_id)

    async def create_empreendimento(
        self,
        db: AsyncSession,
        payload: Empreendimento_FromRequest_Schema,
    ) -> Empreendimento_FromDB_Schema:
        empresa = await self.repo.get_empresa_by_id(db, payload.empresa_id)
        if empresa is None:
            raise HTTPException(status_code=404, detail="Empresa não encontrada.")
        if not empresa.ativo:
            raise HTTPException(
                status_code=409,
                detail="Não é possível cadastrar um empreendimento em uma empresa inativa.",
            )
        return await self.repo.create_empreendimento(db, payload, StatusEmpreendimento.PLANEJADO)

    async def get_empreendimento_by_id(
        self, db: AsyncSession, empreendimento_id: uuid.UUID
    ) -> Empreendimento_FromDB_Schema:
        empreendimento = await self.repo.get_empreendimento_by_id(db, empreendimento_id)
        if empreendimento is None:
            raise HTTPException(status_code=404, detail="Empreendimento não encontrado.")
        return empreendimento

    async def get_all_empreendimentos(
        self, db: AsyncSession
    ) -> list[EmpreendimentoResumo_FromDB_Schema]:
        return await self.repo.get_all_empreendimentos(db)

    async def update_empreendimento(
        self,
        db: AsyncSession,
        empreendimento_id: uuid.UUID,
        payload: Empreendimento_UpdateRequest_Schema,
    ) -> Empreendimento_FromDB_Schema:
        atual = await self.get_empreendimento_by_id(db, empreendimento_id)
        if atual.status is StatusEmpreendimento.INATIVO:
            raise HTTPException(
                status_code=403,
                detail="Não é possível alterar um empreendimento inativo.",
            )
        atualizado = await self.repo.update_empreendimento(db, empreendimento_id, payload)
        if atualizado is None:
            raise HTTPException(status_code=404, detail="Empreendimento não encontrado.")
        return atualizado

    async def update_status(
        self,
        db: AsyncSession,
        empreendimento_id: uuid.UUID,
        payload: Empreendimento_StatusRequest_Schema,
    ) -> Empreendimento_FromDB_Schema:
        atual = await self.get_empreendimento_by_id(db, empreendimento_id)
        if atual.status is payload.status:
            raise HTTPException(
                status_code=400,
                detail=f"O empreendimento já possui o status {payload.status.value}.",
            )
        atualizado = await self.repo.update_status(db, empreendimento_id, payload)
        if atualizado is None:
            raise HTTPException(status_code=404, detail="Empreendimento não encontrado.")
        return atualizado
