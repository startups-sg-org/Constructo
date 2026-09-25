from backend.banco_de_dados.connections.database_postgres import Base

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import (
    Boolean,
    String,
    Integer,
    Numeric,
    ForeignKey,
    DateTime,
    Enum as SAEnum,
    Text,
    func
)

from sqlalchemy.orm import Mapped, mapped_column, relationship

class Empresa(Base):
    __tablename__ = "empresa"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    razao_social: Mapped[str] = mapped_column(String(200), nullable=False)
    nome_fantasia: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    telefone: Mapped[str] = mapped_column(String(20), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    type: Mapped[str] = mapped_column(SAEnum("contratante", "contratado", name="contratante_contratado_enum"), nullable=False)
    cnpj: Mapped[str] = mapped_column(String(20), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class Contrato(Base):
    __tablename__ = "contrato"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    contratante_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("empresa.id"), nullable=False
    )
    contratado_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("empresa.id"), nullable=False
    )
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    valor: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    objeto: Mapped[str] = mapped_column(Text, nullable=False)
    valor_total: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("ativo", "inativo", "finalizado", name="status_enum"),
        nullable=False,
        server_default="ativo",
    )

    iniciado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    finalizado_em: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    
    contratante: Mapped["Empresa"] = relationship(
        "Empresa",
        foreign_keys=[contratante_id]
    )

    contratado: Mapped["Empresa"] = relationship(
        "Empresa",
        foreign_keys=[contratado_id]
    )
class itens_contratuais(Base):
    __tablename__ = "itens_contratuais"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    contrato_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contrato.id"), nullable=False
    )
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_unitario: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    valor_total: Mapped[float] = mapped_column(Numeric(precision=10, scale=2), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    contrato: Mapped["Contrato"] = relationship("Contrato", back_populates="itens_contratuais")
    itens_contratuais: Mapped[list["ItemContratual"]] = relationship(
    "ItemContratual",
    back_populates="contrato"
    )