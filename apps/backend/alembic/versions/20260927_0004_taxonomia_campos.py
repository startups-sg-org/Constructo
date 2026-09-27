"""Completa os campos e relacionamentos da taxonomia."""

import sqlalchemy as sa

from alembic import op

revision = "20260927_0004"
down_revision = "20260925_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "taxonomias",
        sa.Column("is_padrao", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "taxonomias",
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.add_column(
        "taxonomias",
        sa.Column(
            "atualizado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )


def downgrade() -> None:
    op.drop_column("taxonomias", "atualizado_em")
    op.drop_column("taxonomias", "criado_em")
    op.drop_column("taxonomias", "is_padrao")
