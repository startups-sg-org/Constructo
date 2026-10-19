"""Cria contratos vinculados a empreendimentos.

Revision ID: 20261019_0017
Revises: 20261010_0016
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "20261019_0017"
down_revision = "20261010_0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "empresa",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("razao_social", sa.String(200), nullable=False),
        sa.Column("nome_fantasia", sa.String(200), nullable=False),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("telefone", sa.String(20), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("cnpj", sa.String(20), nullable=False, unique=True),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "atualizado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.CheckConstraint("type IN ('contratante', 'contratada')", name="ck_empresa_tipo"),
    )
    op.create_table(
        "contrato",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "empreendimento_id",
            sa.Integer(),
            sa.ForeignKey("empreendimentos.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "contratante_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("empresa.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "contratado_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("empresa.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("objeto", sa.Text(), nullable=False),
        sa.Column("valor_total", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="ativo"),
        sa.Column(
            "iniciado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("finalizado_em", sa.DateTime(timezone=True)),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "atualizado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.CheckConstraint(
            "status IN ('ativo', 'inativo', 'finalizado')", name="ck_contrato_status"
        ),
    )
    op.create_index("ix_contrato_empreendimento_id", "contrato", ["empreendimento_id"])
    op.create_table(
        "itens_contratuais",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "contrato_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("contrato.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("quantidade", sa.Integer(), nullable=False),
        sa.Column("valor_unitario", sa.Numeric(10, 2), nullable=False),
        sa.Column("valor_total", sa.Numeric(10, 2), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "atualizado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_itens_contratuais_contrato_id", "itens_contratuais", ["contrato_id"])


def downgrade() -> None:
    op.drop_index("ix_itens_contratuais_contrato_id", table_name="itens_contratuais")
    op.drop_table("itens_contratuais")
    op.drop_index("ix_contrato_empreendimento_id", table_name="contrato")
    op.drop_table("contrato")
    op.drop_table("empresa")
