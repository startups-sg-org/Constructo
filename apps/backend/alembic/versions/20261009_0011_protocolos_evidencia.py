"""Cria a estrutura de persistência dos protocolos de evidência.

Revision ID: 20261009_0011
Revises: 20260927_0010
"""

import sqlalchemy as sa

from alembic import op

revision = "20261009_0011"
down_revision = "20260927_0010"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "protocolos_evidencia",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("marco_id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("quantidade_minima", sa.Integer(), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "quantidade_minima >= 1", name="ck_protocolos_evidencia_quantidade_minima"
        ),
        sa.ForeignKeyConstraint(["marco_id"], ["marcos.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_protocolos_evidencia_marco_id", "protocolos_evidencia", ["marco_id"])


def downgrade():
    op.drop_index("ix_protocolos_evidencia_marco_id", table_name="protocolos_evidencia")
    op.drop_table("protocolos_evidencia")
