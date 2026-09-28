from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from backend.banco_de_dados.connections.database_postgres import Base

from .regras import TipoLocal


class TipoLocalBanco(TypeDecorator[TipoLocal]):
    impl = String(20)
    cache_ok = True

    def process_bind_param(self, value: TipoLocal | str | None, dialect) -> str | None:
        if value is None:
            return None
        return value.value if isinstance(value, TipoLocal) else value

    def process_result_value(self, value: str | None, dialect) -> TipoLocal | None:
        if value is None:
            return None
        return TipoLocal(value)


class Empreendimento(Base):
    __tablename__ = "empreendimentos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    endereco: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="PLANEJADO")
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    locais_obra: Mapped[list["LocalObra"]] = relationship(back_populates="empreendimento")
    __table_args__ = (
        CheckConstraint(
            "status IN ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO')",
            name="ck_empreendimentos_status",
        ),
    )


class LocalObra(Base):
    __tablename__ = "locais_obra"
    __table_args__ = (
        UniqueConstraint("id", "empreendimento_id", name="uq_locais_id_empreendimento"),
        ForeignKeyConstraint(
            ["parent_id", "empreendimento_id"],
            ["locais_obra.id", "locais_obra.empreendimento_id"],
            name="fk_locais_pai_mesmo_empreendimento",
            ondelete="RESTRICT",
        ),
        CheckConstraint(
            "tipo IN ('TORRE', 'BLOCO', 'PAVIMENTO', 'UNIDADE')", name="ck_locais_tipo"
        ),
        CheckConstraint("parent_id IS NULL OR parent_id <> id", name="ck_locais_sem_auto_pai"),
        CheckConstraint("ordem >= 0", name="ck_locais_ordem"),
        UniqueConstraint("empreendimento_id", "parent_id", "nome", name="uq_locais_irmaos_nome"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    empreendimento_id: Mapped[int] = mapped_column(
        ForeignKey("empreendimentos.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    parent_id: Mapped[int | None] = mapped_column(Integer, index=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    tipo: Mapped[TipoLocal] = mapped_column(
        TipoLocalBanco(),
        nullable=False,
    )
    ordem: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    empreendimento: Mapped["Empreendimento"] = relationship(back_populates="locais_obra")
    filhos: Mapped[list["LocalObra"]] = relationship(back_populates="pai", foreign_keys=[parent_id])
    pai: Mapped["LocalObra | None"] = relationship(
        back_populates="filhos", remote_side=[id], foreign_keys=[parent_id]
    )


class Taxonomia(Base):
    __tablename__ = "taxonomias"

    id: Mapped[int] = mapped_column(primary_key=True)
    empreendimento_id: Mapped[int | None] = mapped_column(
        ForeignKey("empreendimentos.id", ondelete="RESTRICT"), nullable=True, unique=True
    )
    origem_taxonomia_id: Mapped[int | None] = mapped_column(
        ForeignKey("taxonomias.id", ondelete="RESTRICT"), index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    is_padrao: Mapped[bool] = mapped_column(nullable=False, server_default="false")
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    etapas: Mapped[list["Etapa"]] = relationship(back_populates="taxonomia")
    origem_taxonomia: Mapped["Taxonomia | None"] = relationship(remote_side=[id])


class Etapa(Base):
    __tablename__ = "etapas"
    __table_args__ = (
        UniqueConstraint("id", "taxonomia_id", name="uq_etapas_id_taxonomia"),
        ForeignKeyConstraint(
            ["parent_id", "taxonomia_id"],
            ["etapas.id", "etapas.taxonomia_id"],
            name="fk_etapas_pai_mesma_taxonomia",
            ondelete="RESTRICT",
        ),
        CheckConstraint("parent_id IS NULL OR parent_id <> id", name="ck_etapas_sem_auto_pai"),
        CheckConstraint("ordem >= 0", name="ck_etapas_ordem"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    taxonomia_id: Mapped[int] = mapped_column(
        ForeignKey("taxonomias.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    parent_id: Mapped[int | None] = mapped_column(Integer)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao_tecnica: Mapped[str | None] = mapped_column(Text)
    descricao_cliente: Mapped[str | None] = mapped_column(Text)
    ordem: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    taxonomia: Mapped[Taxonomia] = relationship(back_populates="etapas")


class Marco(Base):
    __tablename__ = "marcos"
    __table_args__ = (CheckConstraint("ordem >= 0", name="ck_marcos_ordem"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    etapa_id: Mapped[int] = mapped_column(
        ForeignKey("etapas.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao_tecnica: Mapped[str | None] = mapped_column(Text)
    descricao_cliente: Mapped[str | None] = mapped_column(Text)
    ordem: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")


class ProgressoMarco(Base):
    __tablename__ = "progressos_marco"
    __table_args__ = (
        UniqueConstraint("local_obra_id", "marco_id", name="uq_progressos_local_marco"),
        CheckConstraint(
            "status IN ('NAO_INICIADO', 'EM_ANDAMENTO', 'CONCLUIDO')", name="ck_progressos_status"
        ),
        CheckConstraint(
            "concluido_em IS NULL OR iniciado_em IS NOT NULL",
            name="ck_progressos_inicio_antes_conclusao",
        ),
        CheckConstraint(
            "concluido_em IS NULL OR concluido_em >= iniciado_em", name="ck_progressos_datas"
        ),
        CheckConstraint(
            "(status = 'NAO_INICIADO' AND iniciado_em IS NULL AND concluido_em IS NULL) OR "
            "(status = 'EM_ANDAMENTO' AND iniciado_em IS NOT NULL AND concluido_em IS NULL) OR "
            "(status = 'CONCLUIDO' AND iniciado_em IS NOT NULL AND concluido_em IS NOT NULL)",
            name="ck_progressos_estado_datas",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    local_obra_id: Mapped[int] = mapped_column(
        ForeignKey("locais_obra.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    marco_id: Mapped[int] = mapped_column(
        ForeignKey("marcos.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="NAO_INICIADO")
    iniciado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    concluido_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Evidencia(Base):
    __tablename__ = "evidencias"
    id: Mapped[int] = mapped_column(primary_key=True)
    progresso_marco_id: Mapped[int] = mapped_column(
        ForeignKey("progressos_marco.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    arquivo_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    capturado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False
    )


class Publicacao(Base):
    __tablename__ = "publicacoes"
    __table_args__ = (
        CheckConstraint(
            "(publicado_em IS NULL) = (publicado_por IS NULL)",
            name="ck_publicacoes_autor_e_data",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    progresso_marco_id: Mapped[int] = mapped_column(
        ForeignKey("progressos_marco.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    texto_cliente: Mapped[str] = mapped_column(Text, nullable=False)
    proximo_passo: Mapped[str | None] = mapped_column(Text)
    publicado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    publicado_por: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id", ondelete="RESTRICT")
    )


class PublicacaoEvidencia(Base):
    __tablename__ = "publicacoes_evidencias"
    publicacao_id: Mapped[int] = mapped_column(
        ForeignKey("publicacoes.id", ondelete="CASCADE"), primary_key=True
    )
    evidencia_id: Mapped[int] = mapped_column(
        ForeignKey("evidencias.id", ondelete="RESTRICT"), primary_key=True
    )


class UsuarioEmpreendimento(Base):
    __tablename__ = "usuarios_empreendimentos"
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True
    )
    empreendimento_id: Mapped[int] = mapped_column(
        ForeignKey("empreendimentos.id", ondelete="CASCADE"), primary_key=True
    )


class UsuarioUnidade(Base):
    __tablename__ = "usuarios_unidades"
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True
    )
    local_obra_id: Mapped[int] = mapped_column(
        ForeignKey("locais_obra.id", ondelete="CASCADE"), primary_key=True
    )
