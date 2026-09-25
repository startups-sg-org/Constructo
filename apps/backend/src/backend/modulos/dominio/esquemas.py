"""Contratos iniciais da camada de domínio, ainda sem rotas públicas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .regras import EstadoMarco, Papel, TipoLocal


class Leitura(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int


class EmpreendimentoCriar(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: str | None = None
    endereco: str | None = Field(default=None, max_length=500)


class EmpreendimentoLer(Leitura, EmpreendimentoCriar):
    status: str
    criado_em: datetime


class LocalCriar(BaseModel):
    empreendimento_id: int
    parent_id: int | None = None
    nome: str = Field(min_length=1, max_length=200)
    tipo: TipoLocal


class LocalLer(Leitura, LocalCriar):
    pass


class TaxonomiaCriar(BaseModel):
    empreendimento_id: int
    nome: str = Field(min_length=1, max_length=200)
    descricao: str | None = None


class TaxonomiaLer(Leitura, TaxonomiaCriar):
    pass


class EtapaCriar(BaseModel):
    taxonomia_id: int
    parent_id: int | None = None
    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None


class EtapaLer(Leitura, EtapaCriar):
    pass


class MarcoCriar(BaseModel):
    etapa_id: int
    nome: str = Field(min_length=1, max_length=200)
    ordem: int = Field(default=0, ge=0)
    descricao_tecnica: str | None = None
    descricao_cliente: str | None = None


class MarcoLer(Leitura, MarcoCriar):
    pass


class ProgressoMarcoCriar(BaseModel):
    local_obra_id: int
    marco_id: int


class ProgressoMarcoLer(Leitura, ProgressoMarcoCriar):
    status: EstadoMarco
    iniciado_em: datetime | None
    concluido_em: datetime | None


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
    evidencia_ids: list[int] = Field(default_factory=list)


class PublicacaoLer(Leitura, PublicacaoCriar):
    publicado_em: datetime | None
    publicado_por: int | None


class VinculoGestor(BaseModel):
    usuario_id: int
    empreendimento_id: int
    papel: Papel = Papel.GESTOR

    @model_validator(mode="after")
    def apenas_gestor(self):
        if self.papel != Papel.GESTOR:
            raise ValueError("Vínculo de empreendimento requer papel GESTOR")
        return self


class VinculoComprador(BaseModel):
    usuario_id: int
    local_obra_id: int
