"""Cria as tabelas de usuários e sessões.

Revision ID: 20260923_0001
Revises:
Create Date: 2026-09-23
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260923_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cpf", sa.String(length=14), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("sobrenome", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("senha", sa.String(length=200), nullable=False),
        sa.Column("telefone", sa.String(length=20), nullable=False),
        sa.Column("canal_preferido", sa.String(length=20), server_default="email", nullable=False),
        sa.Column(
            "receber_atualizacoes",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column("empreendimento", sa.String(length=200), nullable=False),
        sa.Column("unidade", sa.String(length=50), nullable=False),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_usuarios_email"),
    )
    op.create_table(
        "sessoes",
        sa.Column("token", sa.String(length=64), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["usuario_id"],
            ["usuarios.id"],
            name="fk_sessoes_usuario_id_usuarios",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("token"),
    )
    op.create_index("ix_sessoes_usuario_id", "sessoes", ["usuario_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_sessoes_usuario_id", table_name="sessoes")
    op.drop_table("sessoes")
    op.drop_table("usuarios")
