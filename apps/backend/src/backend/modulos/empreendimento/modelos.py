import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.banco_de_dados.connections.database_postgres import Base
from backend.modulos.contracts.models import Empresa


class StatusEmpreendimento(str, enum.Enum):
    PLANEJADO = "PLANEJADO"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDO = "CONCLUIDO"
    INATIVO = "INATIVO"


class TipoLocalObra(str, enum.Enum):
    TORRE = "TORRE"
    BLOCO = "BLOCO"


class Empreendimento(Base):
    __tablename__ = "empreendimentos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empresa_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("empresa.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    endereco: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[StatusEmpreendimento] = mapped_column(
        SAEnum(StatusEmpreendimento, name="status_empreendimento_enum"),
        nullable=False,
        default=StatusEmpreendimento.PLANEJADO,
        server_default=StatusEmpreendimento.PLANEJADO.value,
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    empresa: Mapped[Empresa] = relationship(Empresa)


class LocalObra(Base):
    __tablename__ = "locais_obra"
    __table_args__ = (
        CheckConstraint("ordem >= 0", name="ck_locais_obra_ordem"),
        CheckConstraint("parent_id IS NULL", name="ck_locais_obra_primeiro_nivel"),
        UniqueConstraint("empreendimento_id", "nome", name="uq_locais_obra_empreendimento_nome"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    empreendimento_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("empreendimentos.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    tipo: Mapped[TipoLocalObra] = mapped_column(
        SAEnum(TipoLocalObra, name="tipo_local_obra_enum"), nullable=False
    )
    ordem: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    empreendimento: Mapped[Empreendimento] = relationship()
