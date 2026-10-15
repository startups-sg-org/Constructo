"""Relaciona evidências a itens de protocolo.

Revision ID: 20261010_0015
Revises: 20261009_0015
"""

import sqlalchemy as sa

from alembic import op

revision = "20261010_0015"
down_revision = "20261009_0015"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("evidencias", sa.Column("item_protocolo_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_evidencias_item_protocolo_id",
        "evidencias",
        "itens_protocolo",
        ["item_protocolo_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_evidencias_item_protocolo_id", "evidencias", ["item_protocolo_id"])


def downgrade():
    op.drop_index("ix_evidencias_item_protocolo_id", table_name="evidencias")
    op.drop_constraint("fk_evidencias_item_protocolo_id", "evidencias", type_="foreignkey")
    op.drop_column("evidencias", "item_protocolo_id")
