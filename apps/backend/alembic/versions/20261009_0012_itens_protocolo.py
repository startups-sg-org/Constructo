"""Cria os itens que compõem protocolos de evidência.

Revision ID: 20261009_0012
Revises: 20261009_0011
"""

import sqlalchemy as sa

from alembic import op

revision = "20261009_0012"
down_revision = "20261009_0011"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "itens_protocolo",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("protocolo_id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("obrigatorio", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("ordem >= 0", name="ck_itens_protocolo_ordem"),
        sa.ForeignKeyConstraint(
            ["protocolo_id"], ["protocolos_evidencia.id"], ondelete="RESTRICT"
        ),
    )
    op.create_index("ix_itens_protocolo_protocolo_id", "itens_protocolo", ["protocolo_id"])


def downgrade():
    op.drop_index("ix_itens_protocolo_protocolo_id", table_name="itens_protocolo")
    op.drop_table("itens_protocolo")
