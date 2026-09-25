from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.banco_de_dados.connections.database_postgres import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = (
        CheckConstraint("papel IN ('ADMIN', 'GESTOR', 'COMPRADOR')", name="ck_usuarios_papel"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cpf: Mapped[str] = mapped_column(String(14), nullable=False)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    sobrenome: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    senha: Mapped[str] = mapped_column(String(200), nullable=False)
    telefone: Mapped[str] = mapped_column(String(20), nullable=False)
    canal_preferido: Mapped[str] = mapped_column(String(20), nullable=False, server_default="email")
    receber_atualizacoes: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )
    empreendimento: Mapped[str] = mapped_column(String(200), nullable=False)
    unidade: Mapped[str] = mapped_column(String(50), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    papel: Mapped[str] = mapped_column(String(20), nullable=False, server_default="COMPRADOR")

    sessoes: Mapped[list["Sessao"]] = relationship(
        back_populates="usuario",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Sessao(Base):
    __tablename__ = "sessoes"

    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    expira_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    usuario: Mapped[Usuario] = relationship(back_populates="sessoes")
