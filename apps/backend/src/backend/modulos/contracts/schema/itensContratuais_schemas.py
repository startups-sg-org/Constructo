import uuid
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field


class ItemContratual_FromRequest_Schema(BaseModel):
    # ─── CRIAÇÃO — adiciona um item ao contrato
    # valor_total NÃO vem no payload — calculado no service como
    # quantidade * valor_unitario, pra não permitir inconsistência
    # ────────────────────────────────
    # Usado em: POST /contratos/{contrato_id}/itens

    descricao: str = Field(min_length=2, max_length=500)
    quantidade: int = Field(gt=0)
    valor_unitario: Decimal = Field(gt=0)


class ItemContratual_UpdateRequest_Schema(BaseModel):
    # ─── ATUALIZAÇÃO — edição parcial
    # valor_total continua fora — recalculado no service se quantidade ou
    # valor_unitario mudarem
    # ────────────────────────────────
    # Usado em: PUT /contratos/{contrato_id}/itens/{id}

    descricao: str | None = Field(default=None, min_length=2, max_length=500)
    quantidade: int | None = Field(default=None, gt=0)
    valor_unitario: Decimal | None = Field(default=None, gt=0)


class ItemContratual_StatusRequest_Schema(BaseModel):
    # ─── TOGGLE — ativa ou desativa (soft delete) ────────────────────────────
    # Usado em: PATCH /contratos/{contrato_id}/itens/{id}/status

    ativo: bool


class ItemContratual_FromDB_Schema(BaseModel):
    # ─── SAÍDA COMPLETA ───────────────────────────────────────────────────────
    # Usado em: GET /contratos/{contrato_id}/itens/{id} e na listagem de itens

    id: uuid.UUID
    contrato_id: uuid.UUID
    descricao: str
    quantidade: int
    valor_unitario: Decimal
    valor_total: Decimal
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True