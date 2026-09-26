"""Registra auditoria das alterações de papel dos usuários.

Revision ID: 20260926_0007
Revises: 20260926_0006
"""

import sqlalchemy as sa

from alembic import op

revision = "20260926_0007"
down_revision = "20260926_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "auditorias_papeis_usuario",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("alterado_por_id", sa.Integer(), nullable=True),
        sa.Column("papel_anterior", sa.String(length=20), nullable=False),
        sa.Column("papel_novo", sa.String(length=20), nullable=False),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["usuario_id"],
            ["usuarios.id"],
            name="fk_auditoria_papel_usuario",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["alterado_por_id"],
            ["usuarios.id"],
            name="fk_auditoria_papel_autor",
            ondelete="SET NULL",
        ),
        sa.CheckConstraint(
            "papel_anterior IN ('ADMIN', 'GESTOR', 'COMPRADOR')",
            name="ck_auditoria_papel_anterior",
        ),
        sa.CheckConstraint(
            "papel_novo IN ('ADMIN', 'GESTOR', 'COMPRADOR')",
            name="ck_auditoria_papel_novo",
        ),
    )
    op.create_index(
        "ix_auditorias_papeis_usuario_usuario_id",
        "auditorias_papeis_usuario",
        ["usuario_id"],
    )
    op.create_index(
        "ix_auditorias_papeis_usuario_alterado_por_id",
        "auditorias_papeis_usuario",
        ["alterado_por_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_auditorias_papeis_usuario_alterado_por_id",
        table_name="auditorias_papeis_usuario",
    )
    op.drop_index(
        "ix_auditorias_papeis_usuario_usuario_id",
        table_name="auditorias_papeis_usuario",
    )
    op.drop_table("auditorias_papeis_usuario")
