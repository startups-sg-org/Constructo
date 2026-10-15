"""Permite quantidade mínima zero em protocolos de evidência.

Revision ID: 20261009_0014
Revises: 20261009_0013
"""

from alembic import op

revision = "20261009_0014"
down_revision = "20261009_0013"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint("ck_protocolos_evidencia_quantidade_minima", "protocolos_evidencia")
    op.create_check_constraint(
        "ck_protocolos_evidencia_quantidade_minima", "protocolos_evidencia", "quantidade_minima >= 0"
    )
    op.alter_column("protocolos_evidencia", "quantidade_minima", server_default="0")


def downgrade():
    op.drop_constraint("ck_protocolos_evidencia_quantidade_minima", "protocolos_evidencia")
    op.execute("UPDATE protocolos_evidencia SET quantidade_minima = 1 WHERE quantidade_minima = 0")
    op.create_check_constraint(
        "ck_protocolos_evidencia_quantidade_minima", "protocolos_evidencia", "quantidade_minima >= 1"
    )
    op.alter_column("protocolos_evidencia", "quantidade_minima", server_default=None)
