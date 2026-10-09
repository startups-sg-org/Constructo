from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.banco_de_dados.connections.database_postgres import Base

from ..dominio.modelos import Marco


class ProtocoloEvidencia(Base):
    __tablename__ = "protocolos_evidencia"
    __table_args__ = (
        CheckConstraint(
            "quantidade_minima >= 1", name="ck_protocolos_evidencia_quantidade_minima"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    marco_id: Mapped[int] = mapped_column(
        ForeignKey("marcos.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    quantidade_minima: Mapped[int] = mapped_column(Integer, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    marco: Mapped[Marco] = relationship()
