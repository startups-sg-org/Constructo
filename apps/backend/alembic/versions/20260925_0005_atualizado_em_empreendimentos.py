"""Adiciona data de atualização aos empreendimentos.

Revision ID: 20260925_0005
Revises: 20260925_0004
"""

import sqlalchemy as sa

from alembic import op

revision = "20260925_0005"
down_revision = "20260925_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "empreendimentos",
        sa.Column(
            "atualizado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_column("empreendimentos", "atualizado_em")
