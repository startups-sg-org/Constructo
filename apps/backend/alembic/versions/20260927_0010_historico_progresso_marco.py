"""Cria o histórico das transições de progresso dos marcos."""

import sqlalchemy as sa

from alembic import op

revision = "20260927_0010"
down_revision = "20260927_0009"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "historico_progressos_marco",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("progresso_marco_id", sa.Integer(), nullable=False),
        sa.Column("status_anterior", sa.String(length=20), nullable=False),
        sa.Column("status_novo", sa.String(length=20), nullable=False),
        sa.Column("alterado_por", sa.Integer(), nullable=False),
        sa.Column("alterado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["progresso_marco_id"], ["progressos_marco.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["alterado_por"], ["usuarios.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_historico_progressos_marco_progresso_marco_id", "historico_progressos_marco", ["progresso_marco_id"])
    op.create_index("ix_historico_progressos_marco_alterado_por", "historico_progressos_marco", ["alterado_por"])
    op.create_index("ix_historico_progressos_marco_alterado_em", "historico_progressos_marco", ["alterado_em"])


def downgrade():
    op.drop_index("ix_historico_progressos_marco_alterado_em", table_name="historico_progressos_marco")
    op.drop_index("ix_historico_progressos_marco_alterado_por", table_name="historico_progressos_marco")
    op.drop_index("ix_historico_progressos_marco_progresso_marco_id", table_name="historico_progressos_marco")
    op.drop_table("historico_progressos_marco")
