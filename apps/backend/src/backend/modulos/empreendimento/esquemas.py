import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .modelos import StatusEmpreendimento, TipoLocalObra


class Empreendimento_FromRequest_Schema(BaseModel):
    """Criação de empreendimento: POST /empreendimentos."""

    model_config = ConfigDict(extra="forbid")

    empresa_id: uuid.UUID
    nome: str = Field(min_length=1, max_length=200)
    descricao: str = Field(min_length=1, max_length=5_000)
    endereco: str = Field(min_length=1, max_length=500)

    @field_validator("nome", "descricao", "endereco")
    @classmethod
    def remover_espacos_e_rejeitar_vazio(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("campo obrigatório")
        return valor


class Empreendimento_UpdateRequest_Schema(BaseModel):
    """Edição parcial: PUT /empreendimentos/{id}."""

    model_config = ConfigDict(extra="forbid")

    nome: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, min_length=1, max_length=5_000)
    endereco: str | None = Field(default=None, min_length=1, max_length=500)

    @field_validator("nome", "descricao", "endereco")
    @classmethod
    def remover_espacos_e_rejeitar_nulo(cls, valor: str | None) -> str:
        if valor is None:
            raise ValueError("campo não pode ser nulo")
        valor = valor.strip()
        if not valor:
            raise ValueError("campo não pode ser vazio")
        return valor


class Empreendimento_StatusRequest_Schema(BaseModel):
    """Alteração de status: PATCH /empreendimentos/{id}/status."""

    model_config = ConfigDict(extra="forbid")

    status: StatusEmpreendimento


class Empreendimento_FromDB_Schema(BaseModel):
    """Saída completa usada na criação, consulta e alteração."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    empresa_id: uuid.UUID
    nome: str
    descricao: str
    endereco: str
    status: StatusEmpreendimento
    criado_em: datetime
    atualizado_em: datetime


class EmpreendimentoResumo_FromDB_Schema(BaseModel):
    """Saída resumida usada em GET /empreendimentos."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    empresa_id: uuid.UUID
    nome: str
    status: StatusEmpreendimento


class LocalObra_FromRequest_Schema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(min_length=1, max_length=200)
    tipo: TipoLocalObra
    ordem: int = Field(default=0, ge=0)

    @field_validator("nome")
    @classmethod
    def remover_espacos_e_rejeitar_vazio(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("campo obrigatório")
        return valor


class LocalObra_FromDB_Schema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    empreendimento_id: uuid.UUID
    parent_id: uuid.UUID | None
    nome: str
    tipo: TipoLocalObra
    ordem: int


class LocalObra_UpdateRequest_Schema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str | None = Field(default=None, min_length=1, max_length=200)
    ordem: int | None = Field(default=None, ge=0)

    @field_validator("nome")
    @classmethod
    def remover_espacos_e_rejeitar_vazio(cls, valor: str | None) -> str | None:
        if valor is None:
            raise ValueError("campo não pode ser nulo")
        valor = valor.strip()
        if not valor:
            raise ValueError("campo não pode ser vazio")
        return valor


class Pavimento_FromRequest_Schema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)

    @field_validator("nome")
    @classmethod
    def remover_espacos_e_rejeitar_vazio(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("campo obrigatório")
        return valor


class Unidade_FromRequest_Schema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)

    @field_validator("nome")
    @classmethod
    def remover_espacos_e_rejeitar_vazio(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("campo obrigatório")
        return valor
