from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.banco_de_dados.connections.database_postgres import Base

from ..dominio.modelos import Marco


class ProtocoloEvidencia(Base):
    __tablename__ = "protocolos_evidencia"
    __table_args__ = (
        CheckConstraint(
            "quantidade_minima >= 0", name="ck_protocolos_evidencia_quantidade_minima"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    marco_id: Mapped[int | None] = mapped_column(
        ForeignKey("marcos.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    quantidade_minima: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    marco: Mapped[Marco | None] = relationship(back_populates="protocolos_evidencia")
    itens: Mapped[list["ItemProtocolo"]] = relationship(
        back_populates="protocolo", order_by="ItemProtocolo.ordem"
    )


class ItemProtocolo(Base):
    __tablename__ = "itens_protocolo"
    __table_args__ = (CheckConstraint("ordem >= 0", name="ck_itens_protocolo_ordem"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    protocolo_id: Mapped[int] = mapped_column(
        ForeignKey("protocolos_evidencia.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    obrigatorio: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    ordem: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    protocolo: Mapped[ProtocoloEvidencia] = relationship(back_populates="itens")


class ArquivoEvidencia(Base):
    """Metadados do arquivo recebido pelo fluxo de upload de evidências."""

    __tablename__ = "arquivos_evidencia"
    __table_args__ = (
        CheckConstraint(
            "tamanho BETWEEN 1 AND 5242880", name="ck_arquivos_evidencia_tamanho"
        ),
        CheckConstraint(
            "tipo_mime IN ('image/jpeg', 'image/png', 'image/webp')",
            name="ck_arquivos_evidencia_tipo_mime",
        ),
        UniqueConstraint(
            "nome_armazenado", name="uq_arquivos_evidencia_nome_armazenado"
        ),
        UniqueConstraint("caminho", name="uq_arquivos_evidencia_caminho"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    empreendimento_id: Mapped[int] = mapped_column(
        ForeignKey("empreendimentos.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True, index=True
    )
    nome_original: Mapped[str] = mapped_column(String(255), nullable=False)
    nome_armazenado: Mapped[str] = mapped_column(String(255), nullable=False)
    caminho: Mapped[str] = mapped_column(String(1000), nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    tipo_mime: Mapped[str] = mapped_column(String(50), nullable=False)
    tamanho: Mapped[int] = mapped_column(Integer, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
