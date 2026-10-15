"""Permite desassociar protocolos de seus marcos.

Revision ID: 20261009_0013
Revises: 20261009_0012
"""

import sqlalchemy as sa

from alembic import op

revision = "20261009_0013"
down_revision = "20261009_0012"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("protocolos_evidencia", "marco_id", existing_type=sa.Integer(), nullable=True)


def downgrade():
    op.alter_column("protocolos_evidencia", "marco_id", existing_type=sa.Integer(), nullable=False)
