import uuid
from decimal import Decimal
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

from .empresas_schema import EmpresaLite_FromDB_Schema


class StatusContratoEnum(str, Enum):
    ATIVO      = "ativo"
    INATIVO    = "inativo"
    FINALIZADO = "finalizado"


class Contrato_FromRequest_Schema(BaseModel):
    # ─── CRIAÇÃO — cadastra um novo contrato
    # status NÃO vem no payload — todo contrato nasce "ativo", setado no service
    # ────────────────────────────────
    # Usado em: POST /contratos
    # Quem usa: admin / gestor da construtora

    contratante_id: uuid.UUID
    contratado_id: uuid.UUID
    descricao: str = Field(min_length=2, max_length=2000)  # ⚠ talvez devesse se chamar "objeto"
    valor_total: Decimal = Field(gt=0)
    obeto: str = Field(min_length=2, max_length=2000)  
    data_inicio: datetime
    data_fim: datetime


class Contrato_UpdateRequest_Schema(BaseModel):
    # ─── ATUALIZAÇÃO — edição parcial
    # contratante_id e contratado_id de fora — trocar as partes de um
    # contrato já registrado não é uma edição comum, seria um novo contrato
    # ────────────────────────────────
    # Usado em: PUT /contratos/{id}

    descricao: str | None = Field(default=None, min_length=2, max_length=2000)
    valor_total: Decimal | None = Field(default=None, gt=0)


class Contrato_StatusRequest_Schema(BaseModel):
    # ─── TRANSIÇÃO DE STATUS — ativo → inativo / finalizado ──────────────────
    # Usado em: PATCH /contratos/{id}/status


    status: StatusContratoEnum


class Contrato_FromDB_Schema(BaseModel):
    # ─── SAÍDA COMPLETA ───────────────────────────────────────────────────────
    # Usado em: GET /contratos/{id}
    # ⚠ depende do relationship contratante/contratado estar corrigido no
    # model — hoje "contratado" aponta pra uma classe que não existe

    id: uuid.UUID
    contratante: EmpresaLite_FromDB_Schema
    contratado: EmpresaLite_FromDB_Schema
    descricao: str
    valor_total: Decimal
    status: StatusContratoEnum
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime
    finalizado_em: datetime | None  

    class Config:
        from_attributes = True


class ContratoResumo_FromDB_Schema(BaseModel):
    # ─── SAÍDA RESUMIDA — listagem no painel ─────────────────────────────────
    # Usado em: GET /contratos

    id: uuid.UUID
    contratante: EmpresaLite_FromDB_Schema
    contratado: EmpresaLite_FromDB_Schema
    valor_total: Decimal
    status: StatusContratoEnum

    class Config:
        from_attributes = True