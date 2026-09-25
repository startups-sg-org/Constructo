"""Garante a coerência dos estados e publicações no banco.

Revision ID: 20260925_0003
Revises: 20260925_0002
"""

from alembic import op

revision = "20260925_0003"
down_revision = "20260925_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_progressos_estado_datas",
        "progressos_marco",
        "(status = 'NAO_INICIADO' AND iniciado_em IS NULL AND concluido_em IS NULL) OR "
        "(status = 'EM_ANDAMENTO' AND iniciado_em IS NOT NULL AND concluido_em IS NULL) OR "
        "(status = 'CONCLUIDO' AND iniciado_em IS NOT NULL AND concluido_em IS NOT NULL)",
    )
    op.create_check_constraint(
        "ck_publicacoes_autor_e_data",
        "publicacoes",
        "(publicado_em IS NULL) = (publicado_por IS NULL)",
    )


def downgrade() -> None:
    op.drop_constraint("ck_publicacoes_autor_e_data", "publicacoes", type_="check")
    op.drop_constraint("ck_progressos_estado_datas", "progressos_marco", type_="check")
