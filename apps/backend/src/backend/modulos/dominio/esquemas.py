"""Contratos iniciais da camada de domínio, ainda sem rotas públicas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .regras import ProgressStatus, StatusEmpreendimento, TipoLocal


class Leitura(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int


class EmpreendimentoCriar(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: str | None = Field(default=None, max_length=1000)
    endereco: str | None = Field(default=None, max_length=500)
    status: StatusEmpreendimento = StatusEmpreendimento.PLANEJADO

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao", "endereco")
    @classmethod
    def normalizar_opcional(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class EmpreendimentoAtualizar(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, max_length=1000)
    endereco: str | None = Field(default=None, max_length=500)
    status: StatusEmpreendimento | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str | None) -> str:
        if nome is None or not nome.strip():
            raise ValueError("Nome é obrigatório")
        return nome.strip()

    @field_validator("status")
    @classmethod
    def validar_status(cls, status: StatusEmpreendimento | None) -> StatusEmpreendimento:
        if status is None:
            raise ValueError("Status é obrigatório")
        return status

    @field_validator("descricao", "endereco")
    @classmethod
    def normalizar_opcional(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class EmpreendimentoLer(Leitura, EmpreendimentoCriar):
    criado_em: datetime
    atualizado_em: datetime


class LocalCriar(BaseModel):
    empreendimento_id: int
    parent_id: int | None = None
    nome: str = Field(min_length=1, max_length=200)
    tipo: TipoLocal
    ordem: int = Field(default=0, ge=0)

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome


class LocalRaizCriar(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    tipo: Literal[TipoLocal.TORRE, TipoLocal.BLOCO]
    ordem: int = Field(default=0, ge=0)

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome


class PavimentoCriar(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome


class UnidadeCriar(PavimentoCriar):
    pass


class LocalAtualizar(PavimentoCriar):
    pass


class LocalLer(Leitura, LocalCriar):
    criado_em: datetime
    atualizado_em: datetime


class LocalHierarquiaLer(LocalLer):
    filhos: list["LocalHierarquiaLer"] = Field(default_factory=list)


class TaxonomiaCriar(BaseModel):
    empreendimento_id: int | None = None
    nome: str = Field(min_length=1, max_length=200)
    descricao: str | None = None
    is_padrao: bool = False

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class TaxonomiaPadraoCriar(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class TaxonomiaPersonalizar(BaseModel):
    origem_taxonomia_id: int
    nome: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str | None) -> str | None:
        if nome is None:
            return None
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class TaxonomiaConfigurar(BaseModel):
    origem_taxonomia_id: int = Field(gt=0)
    nome: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = None


class TaxonomiaLer(Leitura, TaxonomiaCriar):
    origem_taxonomia_id: int | None = None
    criado_em: datetime
    atualizado_em: datetime


class TaxonomiaPersonalizadaLer(TaxonomiaLer):
    origem_taxonomia_id: int


class EtapaCriar(BaseModel):
    taxonomia_id: int
    parent_id: int | None = None
    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao_tecnica", "descricao_cliente")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class EtapaAtualizar(BaseModel):
    parent_id: int | None = None
    nome: str | None = Field(default=None, min_length=1, max_length=200)
    ordem: int | None = Field(default=None, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str | None) -> str | None:
        if nome is None:
            return None
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao_tecnica", "descricao_cliente")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class EtapaLer(Leitura, EtapaCriar):
    pass


class EtapaTaxonomiaCriar(BaseModel):
    parent_id: int | None = None
    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao_tecnica", "descricao_cliente")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class MarcoCriar(BaseModel):
    etapa_id: int
    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao_tecnica", "descricao_cliente")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class MarcoAtualizar(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=200)
    ordem: int | None = Field(default=None, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str | None) -> str | None:
        if nome is None:
            return None
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao_tecnica", "descricao_cliente")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class MarcoLer(Leitura, MarcoCriar):
    pass


class MarcoEtapaCriar(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao_tecnica", "descricao_cliente")
    @classmethod
    def normalizar_descricao(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class ProgressoMarcoCriar(BaseModel):
    local_obra_id: int
    marco_id: int


class ProgressoMarcoLer(Leitura, ProgressoMarcoCriar):
    status: ProgressStatus
    iniciado_em: datetime | None
    concluido_em: datetime | None
    criado_em: datetime
    atualizado_em: datetime


class HistoricoProgressoMarcoLer(Leitura):
    progresso_marco_id: int
    status_anterior: ProgressStatus
    status_novo: ProgressStatus
    alterado_por: int
    alterado_em: datetime
    observacao: str | None = None


class EvidenciaCriar(BaseModel):
    progresso_marco_id: int
    arquivo_url: str = Field(min_length=1, max_length=1000)
    descricao: str | None = None
    capturado_em: datetime
    usuario_id: int


class EvidenciaLer(Leitura, EvidenciaCriar):
    pass


class PublicacaoCriar(BaseModel):
    progresso_marco_id: int
    titulo: str = Field(min_length=1, max_length=200)
    texto_cliente: str = Field(min_length=1)
    proximo_passo: str | None = None
    evidencia_ids: list[int] = Field(min_length=1)


class PublicacaoLer(Leitura):
    progresso_marco_id: int
    titulo: str
    texto_cliente: str
    proximo_passo: str | None
    publicado_em: datetime | None
    publicado_por: int | None


class VinculoGestor(BaseModel):
    usuario_id: int
    empreendimento_id: int


class VinculoComprador(BaseModel):
    usuario_id: int
    local_obra_id: int
