"""Completa os campos e relacionamentos da taxonomia."""

import sqlalchemy as sa

from alembic import op

revision = "20260927_0004"
down_revision = "20260925_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("taxonomias", "empreendimento_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("taxonomias", sa.Column("origem_taxonomia_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_taxonomias_origem_taxonomia",
        "taxonomias",
        "taxonomias",
        ["origem_taxonomia_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index(
        "ix_taxonomias_origem_taxonomia_id", "taxonomias", ["origem_taxonomia_id"]
    )
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
    op.drop_index("ix_taxonomias_origem_taxonomia_id", table_name="taxonomias")
    op.drop_constraint("fk_taxonomias_origem_taxonomia", "taxonomias", type_="foreignkey")
    op.drop_column("taxonomias", "origem_taxonomia_id")
    op.alter_column("taxonomias", "empreendimento_id", existing_type=sa.Integer(), nullable=False)
