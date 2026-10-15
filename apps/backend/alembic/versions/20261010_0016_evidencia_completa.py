"""Completa a entidade de evidencia e vincula o upload armazenado.

Revision ID: 20261010_0016
Revises: 20261010_0015
"""

import sqlalchemy as sa

from alembic import op

revision = "20261010_0016"
down_revision = "20261010_0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("evidencias", sa.Column("local_obra_id", sa.Integer(), nullable=True))
    op.add_column("evidencias", sa.Column("marco_id", sa.Integer(), nullable=True))
    op.add_column(
        "evidencias", sa.Column("arquivo_evidencia_id", sa.Integer(), nullable=True)
    )
    op.add_column(
        "evidencias",
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.add_column(
        "evidencias",
        sa.Column(
            "atualizado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # As evidencias legadas ja apontam para um progresso, que contem ambos os IDs.
    op.execute(
        sa.text(
            """
            UPDATE evidencias
               SET local_obra_id = progressos_marco.local_obra_id,
                   marco_id = progressos_marco.marco_id
              FROM progressos_marco
             WHERE progressos_marco.id = evidencias.progresso_marco_id
            """
        )
    )
    # Quando o upload ja estava catalogado, estabelece tambem a FK do arquivo.
    op.execute(
        sa.text(
            """
            UPDATE evidencias
               SET arquivo_evidencia_id = arquivos_evidencia.id
              FROM arquivos_evidencia
             WHERE arquivos_evidencia.url = evidencias.arquivo_url
            """
        )
    )

    op.alter_column("evidencias", "local_obra_id", nullable=False)
    op.alter_column("evidencias", "marco_id", nullable=False)
    op.alter_column("evidencias", "descricao", new_column_name="descricao_tecnica")
    op.alter_column("evidencias", "usuario_id", new_column_name="capturado_por")

    op.create_foreign_key(
        "fk_evidencias_local_obra_id",
        "evidencias",
        "locais_obra",
        ["local_obra_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_foreign_key(
        "fk_evidencias_marco_id",
        "evidencias",
        "marcos",
        ["marco_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_foreign_key(
        "fk_evidencias_arquivo_evidencia_id",
        "evidencias",
        "arquivos_evidencia",
        ["arquivo_evidencia_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_evidencias_local_obra_id", "evidencias", ["local_obra_id"])
    op.create_index("ix_evidencias_marco_id", "evidencias", ["marco_id"])
    op.create_index(
        "ix_evidencias_arquivo_evidencia_id", "evidencias", ["arquivo_evidencia_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_evidencias_arquivo_evidencia_id", table_name="evidencias")
    op.drop_index("ix_evidencias_marco_id", table_name="evidencias")
    op.drop_index("ix_evidencias_local_obra_id", table_name="evidencias")
    op.drop_constraint(
        "fk_evidencias_arquivo_evidencia_id", "evidencias", type_="foreignkey"
    )
    op.drop_constraint("fk_evidencias_marco_id", "evidencias", type_="foreignkey")
    op.drop_constraint("fk_evidencias_local_obra_id", "evidencias", type_="foreignkey")
    op.alter_column("evidencias", "capturado_por", new_column_name="usuario_id")
    op.alter_column("evidencias", "descricao_tecnica", new_column_name="descricao")
    op.drop_column("evidencias", "atualizado_em")
    op.drop_column("evidencias", "criado_em")
    op.drop_column("evidencias", "arquivo_evidencia_id")
    op.drop_column("evidencias", "marco_id")
    op.drop_column("evidencias", "local_obra_id")
