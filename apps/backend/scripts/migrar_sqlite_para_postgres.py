"""Migra usuários e sessões do SQLite legado para o PostgreSQL.

Execute depois de ``alembic upgrade head``:
    uv run python scripts/migrar_sqlite_para_postgres.py
"""

import argparse
import asyncio
import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path

from sqlalchemy import select

from backend.banco_de_dados.connections.database_postgres import postgres
from backend.modulos.usuarios.modelos import Sessao, Usuario


def ler_sqlite(caminho: Path) -> tuple[list[sqlite3.Row], list[sqlite3.Row]]:
    if not caminho.is_file():
        raise FileNotFoundError(f"Banco SQLite não encontrado: {caminho}")

    with sqlite3.connect(caminho) as conexao:
        conexao.row_factory = sqlite3.Row
        tabelas = {
            linha[0]
            for linha in conexao.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            ).fetchall()
        }
        if "usuarios" not in tabelas:
            raise RuntimeError("A tabela 'usuarios' não existe no SQLite informado")

        usuarios = conexao.execute("SELECT * FROM usuarios").fetchall()
        sessoes = (
            conexao.execute("SELECT * FROM sessoes").fetchall() if "sessoes" in tabelas else []
        )
        return usuarios, sessoes


async def migrar(caminho: Path) -> tuple[int, int]:
    usuarios_legados, sessoes_legadas = ler_sqlite(caminho)
    ids: dict[int, int] = {}
    usuarios_inseridos = 0
    sessoes_inseridas = 0

    async with postgres.get_session() as session:
        for legado in usuarios_legados:
            email = legado["email"].lower()
            usuario = await session.scalar(select(Usuario).where(Usuario.email == email))
            if usuario is None:
                usuario = Usuario(
                    cpf=legado["cpf"],
                    nome=legado["nome"],
                    sobrenome=legado["sobrenome"],
                    email=email,
                    senha=legado["senha"],
                    telefone=legado["telefone"],
                    canal_preferido=legado["canal_preferido"],
                    receber_atualizacoes=bool(legado["receber_atualizacoes"]),
                    empreendimento=legado["empreendimento"],
                    unidade=legado["unidade"],
                    ativo=bool(legado["ativo"]),
                )
                session.add(usuario)
                await session.flush()
                usuarios_inseridos += 1
            ids[legado["id"]] = usuario.id

        expiracao = datetime.now(UTC) + timedelta(days=7)
        for legada in sessoes_legadas:
            usuario_id = ids.get(legada["usuario_id"])
            if usuario_id is None:
                continue
            existente = await session.get(Sessao, legada["token"])
            if existente is None:
                session.add(
                    Sessao(
                        token=legada["token"],
                        usuario_id=usuario_id,
                        expira_em=expiracao,
                    )
                )
                sessoes_inseridas += 1

        await session.commit()

    return usuarios_inseridos, sessoes_inseridas


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--sqlite",
        type=Path,
        default=Path("constructo.db"),
        help="Caminho do banco SQLite legado",
    )
    argumentos = parser.parse_args()
    usuarios, sessoes = asyncio.run(migrar(argumentos.sqlite))
    print(f"Migração concluída: {usuarios} usuário(s), {sessoes} sessão(ões).")


if __name__ == "__main__":
    main()
