"""Cria a persistência dos arquivos enviados como evidência.

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
    op.create_table(
        "arquivos_evidencia",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("empreendimento_id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("nome_original", sa.String(length=255), nullable=False),
        sa.Column("nome_armazenado", sa.String(length=255), nullable=False),
        sa.Column("caminho", sa.String(length=1000), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column("tipo_mime", sa.String(length=50), nullable=False),
        sa.Column("tamanho", sa.Integer(), nullable=False),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "tamanho BETWEEN 1 AND 5242880", name="ck_arquivos_evidencia_tamanho"
        ),
        sa.CheckConstraint(
            "tipo_mime IN ('image/jpeg', 'image/png', 'image/webp')",
            name="ck_arquivos_evidencia_tipo_mime",
        ),
        sa.ForeignKeyConstraint(
            ["empreendimento_id"], ["empreendimentos.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("nome_armazenado", name="uq_arquivos_evidencia_nome_armazenado"),
        sa.UniqueConstraint("caminho", name="uq_arquivos_evidencia_caminho"),
    )
    op.create_index(
        "ix_arquivos_evidencia_empreendimento_id",
        "arquivos_evidencia",
        ["empreendimento_id"],
    )
    op.create_index(
        "ix_arquivos_evidencia_usuario_id", "arquivos_evidencia", ["usuario_id"]
    )


def downgrade():
    op.drop_index("ix_arquivos_evidencia_usuario_id", table_name="arquivos_evidencia")
    op.drop_index("ix_arquivos_evidencia_empreendimento_id", table_name="arquivos_evidencia")
    op.drop_table("arquivos_evidencia")
