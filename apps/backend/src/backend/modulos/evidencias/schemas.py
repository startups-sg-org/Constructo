from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


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
        ge=1,
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

    empreendimento_id: int
    nome: str
    caminho: str
    url: str
    tamanho: int
    tipo_mime: str
