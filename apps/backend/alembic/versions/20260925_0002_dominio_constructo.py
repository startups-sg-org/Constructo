"""Estrutura do domínio; mantém os campos legados de usuários até migração de dados.

Revision ID: 20260925_0002
Revises: 20260923_0001
"""

import sqlalchemy as sa

from alembic import op

revision = "20260925_0002"
down_revision = "20260923_0001"
branch_labels = None
depends_on = None


def pk():
    return sa.Column("id", sa.Integer(), primary_key=True)


def fk(nome, alvo, *, nullable=False, ondelete="RESTRICT"):
    return sa.Column(nome, sa.Integer(), sa.ForeignKey(alvo, ondelete=ondelete), nullable=nullable)


def nome():
    return sa.Column("nome", sa.String(200), nullable=False)


def descricoes():
    return sa.Column("descricao_tecnica", sa.Text()), sa.Column("descricao_cliente", sa.Text())


def upgrade():
    op.add_column(
        "usuarios", sa.Column("papel", sa.String(20), nullable=False, server_default="COMPRADOR")
    )
    op.create_check_constraint(
        "ck_usuarios_papel", "usuarios", "papel IN ('ADMIN', 'GESTOR', 'COMPRADOR')"
    )
    op.create_table(
        "empreendimentos",
        pk(),
        nome(),
        sa.Column("descricao", sa.Text()),
        sa.Column("endereco", sa.String(500)),
        sa.Column("status", sa.String(20), nullable=False, server_default="PLANEJADO"),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')",
            name="ck_empreendimentos_status",
        ),
    )
    op.create_table(
        "locais_obra",
        pk(),
        fk("empreendimento_id", "empreendimentos.id"),
        sa.Column("parent_id", sa.Integer()),
        nome(),
        sa.Column("tipo", sa.String(20), nullable=False),
        sa.UniqueConstraint("id", "empreendimento_id", name="uq_locais_id_empreendimento"),
        sa.ForeignKeyConstraint(
            ["parent_id", "empreendimento_id"],
            ["locais_obra.id", "locais_obra.empreendimento_id"],
            name="fk_locais_pai_mesmo_empreendimento",
            ondelete="RESTRICT",
        ),
        sa.CheckConstraint("tipo IN ('TORRE', 'PAVIMENTO', 'UNIDADE')", name="ck_locais_tipo"),
        sa.CheckConstraint("parent_id IS NULL OR parent_id <> id", name="ck_locais_sem_auto_pai"),
        sa.UniqueConstraint("empreendimento_id", "parent_id", "nome", name="uq_locais_irmaos_nome"),
    )
    op.create_index("ix_locais_obra_empreendimento_id", "locais_obra", ["empreendimento_id"])
    op.create_index("ix_locais_obra_parent_id", "locais_obra", ["parent_id"])
    op.create_table(
        "taxonomias",
        pk(),
        fk("empreendimento_id", "empreendimentos.id"),
        nome(),
        sa.Column("descricao", sa.Text()),
        sa.UniqueConstraint("empreendimento_id"),
    )
    op.create_table(
        "etapas",
        pk(),
        fk("taxonomia_id", "taxonomias.id"),
        sa.Column("parent_id", sa.Integer()),
        nome(),
        *descricoes(),
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
        sa.UniqueConstraint("id", "taxonomia_id", name="uq_etapas_id_taxonomia"),
        sa.ForeignKeyConstraint(
            ["parent_id", "taxonomia_id"],
            ["etapas.id", "etapas.taxonomia_id"],
            name="fk_etapas_pai_mesma_taxonomia",
            ondelete="RESTRICT",
        ),
        sa.CheckConstraint("parent_id IS NULL OR parent_id <> id", name="ck_etapas_sem_auto_pai"),
        sa.CheckConstraint("ordem >= 0", name="ck_etapas_ordem"),
    )
    op.create_index("ix_etapas_taxonomia_id", "etapas", ["taxonomia_id"])
    op.create_table(
        "marcos",
        pk(),
        fk("etapa_id", "etapas.id"),
        nome(),
        *descricoes(),
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
        sa.CheckConstraint("ordem >= 0", name="ck_marcos_ordem"),
    )
    op.create_index("ix_marcos_etapa_id", "marcos", ["etapa_id"])
    op.create_table(
        "progressos_marco",
        pk(),
        fk("local_obra_id", "locais_obra.id"),
        fk("marco_id", "marcos.id"),
        sa.Column("status", sa.String(20), nullable=False, server_default="NAO_INICIADO"),
        sa.Column("iniciado_em", sa.DateTime(timezone=True)),
        sa.Column("concluido_em", sa.DateTime(timezone=True)),
        sa.UniqueConstraint("local_obra_id", "marco_id", name="uq_progressos_local_marco"),
        sa.CheckConstraint(
            "status IN ('NAO_INICIADO', 'EM_ANDAMENTO', 'CONCLUIDO')", name="ck_progressos_status"
        ),
        sa.CheckConstraint(
            "concluido_em IS NULL OR iniciado_em IS NOT NULL",
            name="ck_progressos_inicio_antes_conclusao",
        ),
        sa.CheckConstraint(
            "concluido_em IS NULL OR concluido_em >= iniciado_em", name="ck_progressos_datas"
        ),
    )
    op.create_index("ix_progressos_marco_local_obra_id", "progressos_marco", ["local_obra_id"])
    op.create_index("ix_progressos_marco_marco_id", "progressos_marco", ["marco_id"])
    op.create_table(
        "evidencias",
        pk(),
        fk("progresso_marco_id", "progressos_marco.id"),
        sa.Column("arquivo_url", sa.String(1000), nullable=False),
        sa.Column("descricao", sa.Text()),
        sa.Column("capturado_em", sa.DateTime(timezone=True), nullable=False),
        fk("usuario_id", "usuarios.id"),
    )
    op.create_index("ix_evidencias_progresso_marco_id", "evidencias", ["progresso_marco_id"])
    op.create_table(
        "publicacoes",
        pk(),
        fk("progresso_marco_id", "progressos_marco.id"),
        sa.Column("titulo", sa.String(200), nullable=False),
        sa.Column("texto_cliente", sa.Text(), nullable=False),
        sa.Column("proximo_passo", sa.Text()),
        sa.Column("publicado_em", sa.DateTime(timezone=True)),
        fk("publicado_por", "usuarios.id", nullable=True),
    )
    op.create_index("ix_publicacoes_progresso_marco_id", "publicacoes", ["progresso_marco_id"])
    op.create_table(
        "publicacoes_evidencias",
        fk("publicacao_id", "publicacoes.id", ondelete="CASCADE"),
        fk("evidencia_id", "evidencias.id"),
        sa.PrimaryKeyConstraint("publicacao_id", "evidencia_id"),
    )
    op.create_table(
        "usuarios_empreendimentos",
        fk("usuario_id", "usuarios.id", ondelete="CASCADE"),
        fk("empreendimento_id", "empreendimentos.id", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("usuario_id", "empreendimento_id"),
    )
    op.create_table(
        "usuarios_unidades",
        fk("usuario_id", "usuarios.id", ondelete="CASCADE"),
        fk("local_obra_id", "locais_obra.id", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("usuario_id", "local_obra_id"),
    )


def downgrade():
    for tabela in (
        "usuarios_unidades",
        "usuarios_empreendimentos",
        "publicacoes_evidencias",
        "publicacoes",
        "evidencias",
        "progressos_marco",
        "marcos",
        "etapas",
        "taxonomias",
        "locais_obra",
        "empreendimentos",
    ):
        op.drop_table(tabela)
    op.drop_constraint("ck_usuarios_papel", "usuarios", type_="check")
    op.drop_column("usuarios", "papel")
