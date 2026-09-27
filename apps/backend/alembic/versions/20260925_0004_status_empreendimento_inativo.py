"""Substitui o status legado CANCELADO por INATIVO.

Revision ID: 20260925_0004
Revises: 20260925_0003
"""

from alembic import op

revision = "20260925_0004"
down_revision = "20260925_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_empreendimentos_status", "empreendimentos", type_="check")
    op.execute("UPDATE empreendimentos SET status = 'INATIVO' WHERE status = 'CANCELADO'")
    op.create_check_constraint(
        "ck_empreendimentos_status",
        "empreendimentos",
        "status IN ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'INATIVO')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_empreendimentos_status", "empreendimentos", type_="check")
    op.execute("UPDATE empreendimentos SET status = 'CANCELADO' WHERE status = 'INATIVO'")
    op.create_check_constraint(
        "ck_empreendimentos_status",
        "empreendimentos",
        "status IN ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')",
    )
