"""Completa a entidade LocalObra com tipo, ordenação e auditoria.

Revision ID: 20260926_0006
Revises: 20260925_0005
"""

import sqlalchemy as sa

from alembic import op

revision = "20260926_0006"
down_revision = "20260925_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_locais_tipo", "locais_obra", type_="check")
    op.create_check_constraint(
        "ck_locais_tipo",
        "locais_obra",
        "tipo IN ('TORRE', 'BLOCO', 'PAVIMENTO', 'UNIDADE')",
    )
    op.add_column(
        "locais_obra",
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "locais_obra",
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.add_column(
        "locais_obra",
        sa.Column(
            "atualizado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_check_constraint("ck_locais_ordem", "locais_obra", "ordem >= 0")


def downgrade() -> None:
    op.drop_constraint("ck_locais_ordem", "locais_obra", type_="check")
    op.drop_column("locais_obra", "atualizado_em")
    op.drop_column("locais_obra", "criado_em")
    op.drop_column("locais_obra", "ordem")
    op.drop_constraint("ck_locais_tipo", "locais_obra", type_="check")
    op.execute("UPDATE locais_obra SET tipo = 'TORRE' WHERE tipo = 'BLOCO'")
    op.create_check_constraint(
        "ck_locais_tipo",
        "locais_obra",
        "tipo IN ('TORRE', 'PAVIMENTO', 'UNIDADE')",
    )
