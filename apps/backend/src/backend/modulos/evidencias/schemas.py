from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.modulos.dominio.regras import TipoLocal


class ProtocoloEvidencia_FromRequest_Schema(BaseModel):
    """Dados recebidos da API para criar um protocolo associado a um marco.

    Fluxo: payload do cliente -> rota -> service -> ProtocoloEvidencia.
    O marco não vem no corpo: a rota o obtém do parâmetro `marco_id`, evitando
    que o cliente associe o protocolo a um marco diferente do recurso da URL.
    """

    # ─── CRIAÇÃO — define o padrão de evidências esperado para um marco ──────
    # Usado em: POST .../marcos/{marco_id}/protocolos-evidencia
    # Quem usa: administrador ou gestor autorizado no empreendimento
    nome: str = Field(
        min_length=1,
        max_length=200,
        description="Nome identificador do protocolo, como 'Impermeabilização'.",
    )
    descricao: str | None = Field(
        default=None,
        description="Orientações técnicas que esclarecem quais evidências devem ser registradas.",
    )
    quantidade_minima: int = Field(
        default=0,
        ge=0,
        description="Quantidade mínima de evidências exigida para cumprir o protocolo.",
    )

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao")
    @classmethod
    def normalizar_descricao(cls, descricao: str | None) -> str | None:
        if descricao is None:
            return None
        return descricao.strip() or None


class ProtocoloEvidencia_FromDB_Schema(ProtocoloEvidencia_FromRequest_Schema):
    """Dados enviados do banco para a API após criar ou consultar um protocolo.

    Fluxo: ProtocoloEvidencia persistido -> service -> rota -> resposta da API.
    Inclui identificador, marco de origem e auditoria, campos que não são
    fornecidos pelo cliente durante a criação.
    """

    # ─── SAÍDA COMPLETA ─────────────────────────────────────────────────────
    # Usado em: POST e GET .../marcos/{marco_id}/protocolos-evidencia
    model_config = ConfigDict(from_attributes=True)

    id: int
    marco_id: int
    criado_em: datetime
    atualizado_em: datetime


class ProtocoloEvidencia_Atualizar_Schema(BaseModel):
    quantidade_minima: int = Field(ge=0)


class ProtocoloEvidencia_Status_Schema(BaseModel):
    protocolo_id: int
    quantidade_minima: int
    evidencias_registradas: int
    quantidade_atendida: bool
    itens_pendentes: list["ItemProtocolo_Pendente_Schema"] = Field(default_factory=list)
    itens_obrigatorios_atendidos: bool


class ItemProtocolo_Pendente_Schema(BaseModel):
    id: int
    nome: str
    ordem: int


ProtocoloEvidencia_Status_Schema.model_rebuild()


class EvidenciaItem_FromRequest_Schema(BaseModel):
    """Dados da evidência registrada em um item obrigatório ou opcional."""

    progresso_marco_id: int = Field(gt=0)
    arquivo_url: str = Field(min_length=1, max_length=1000)
    descricao: str | None = None
    capturado_em: datetime


class ItemProtocolo_FromRequest_Schema(BaseModel):
    """Dados para criar um item de um protocolo de evidência.

    Usado no endpoint planejado:
    ``POST /empreendimentos/{empreendimento_id}/taxonomia/marcos/{marco_id}/
    protocolos-evidencia/{protocolo_id}/itens``.
    O identificador do protocolo vem da URL para garantir que o item seja
    associado ao protocolo solicitado, e não a um valor enviado pelo cliente.
    """

    nome: str = Field(min_length=1, max_length=200, description="Nome do registro esperado.")
    descricao: str | None = Field(
        default=None, description="Orientação técnica sobre a evidência esperada."
    )
    obrigatorio: bool = Field(
        default=True, description="Indica se o registro é obrigatório para o protocolo."
    )
    ordem: int = Field(ge=0, description="Posição do item na sequência do protocolo.")

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome é obrigatório")
        return nome

    @field_validator("descricao")
    @classmethod
    def normalizar_descricao(cls, descricao: str | None) -> str | None:
        if descricao is None:
            return None
        return descricao.strip() or None


class ItemProtocolo_Atualizar_Schema(BaseModel):
    """Campos editáveis de um item de protocolo.

    Usado no endpoint planejado:
    ``PATCH /empreendimentos/{empreendimento_id}/taxonomia/marcos/{marco_id}/
    protocolos-evidencia/{protocolo_id}/itens/{item_id}``.
    """

    nome: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = None
    obrigatorio: bool | None = None
    ordem: int | None = Field(default=None, ge=0)

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
    def normalizar_descricao(cls, descricao: str | None) -> str | None:
        if descricao is None:
            return None
        return descricao.strip() or None


class ItemProtocolo_FromDB_Schema(ItemProtocolo_FromRequest_Schema):
    """Representação de um item de protocolo persistido.

    Retornado pelos endpoints planejados de criação e consulta:
    ``POST`` e ``GET /empreendimentos/{empreendimento_id}/taxonomia/marcos/
    {marco_id}/protocolos-evidencia/{protocolo_id}/itens``.
    A remoção será feita por ``DELETE`` no caminho acrescido de ``/{item_id}``.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    protocolo_id: int
    criado_em: datetime
    atualizado_em: datetime


class ProtocoloEvidencia_ComItens_FromDB_Schema(ProtocoloEvidencia_FromDB_Schema):
    """Protocolo persistido com os itens que o compõem, em ordem."""

    itens: list[ItemProtocolo_FromDB_Schema] = Field(default_factory=list)


class EvidenciaUpload_FromDB_Schema(BaseModel):
    """Metadados devolvidos após armazenar uma imagem de evidência."""

    id: int
    empreendimento_id: int
    nome: str
    caminho: str
    url: str
    tamanho: int
    tipo_mime: str
    criado_em: datetime


class EvidenciaCriar_Schema(BaseModel):
    """Metadados recebidos junto ao arquivo da evidencia."""

    model_config = ConfigDict(extra="forbid")

    local_obra_id: int = Field(gt=0)
    marco_id: int = Field(gt=0)
    item_protocolo_id: int | None = Field(default=None, gt=0)
    descricao_tecnica: str | None = Field(default=None, max_length=4000)
    capturado_em: datetime | None = None

    @field_validator("descricao_tecnica")
    @classmethod
    def normalizar_descricao_tecnica(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class EvidenciaAtualizar_Schema(BaseModel):
    """Campos editáveis da evidência; valores omitidos permanecem inalterados."""

    model_config = ConfigDict(extra="forbid")

    descricao_tecnica: str | None = Field(default=None, max_length=4000)

    @field_validator("descricao_tecnica")
    @classmethod
    def normalizar_descricao_tecnica(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        return valor.strip() or None


class LocalObraResumo(BaseModel):
    """Identifica onde a evidência foi registrada na estrutura da obra."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    tipo: TipoLocal
    parent_id: int | None


class MarcoResumo(BaseModel):
    """Identifica qual avanço construtivo a evidência representa."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    descricao_tecnica: str | None


class UsuarioResumo(BaseModel):
    """Dados minimos do usuario autenticado responsavel pela captura."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: str
    papel: str


class Evidencia_FromDB_Schema(EvidenciaCriar_Schema):
    """Representacao completa da evidencia persistida e de seu arquivo."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    arquivo_url: str
    capturado_por: int
    capturado_em: datetime
    criado_em: datetime
    atualizado_em: datetime
    local_obra: LocalObraResumo
    marco: MarcoResumo
    responsavel: UsuarioResumo


class EvidenciaResponse(Evidencia_FromDB_Schema):
    """Nome público do contrato retornado pelos endpoints de evidências."""
