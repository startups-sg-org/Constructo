"""Adiciona timestamps ao progresso do marco.

Revision ID: 20260927_0009
Revises: 550b9df0a10c
"""

import sqlalchemy as sa

from alembic import op

revision = "20260927_0009"
down_revision = "550b9df0a10c"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "progressos_marco",
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.add_column(
        "progressos_marco",
        sa.Column("atualizado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade():
    op.drop_column("progressos_marco", "atualizado_em")
    op.drop_column("progressos_marco", "criado_em")
