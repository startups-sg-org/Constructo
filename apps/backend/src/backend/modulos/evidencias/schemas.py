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
