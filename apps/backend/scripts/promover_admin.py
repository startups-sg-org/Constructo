"""Promove explicitamente um usuário existente para administrador."""

import argparse
import asyncio

from backend.banco_de_dados.connections.database_postgres import postgres
from backend.modulos.dominio.regras import Papel
from backend.modulos.usuarios.repositorio import RepositorioDeUsuarios


async def promover_admin(email: str) -> None:
    async with postgres.get_session() as session:
        repositorio = RepositorioDeUsuarios(session)
        usuario = await repositorio.buscar_usuario_por_email(email)

        if usuario is None:
            raise SystemExit(f"Usuário não encontrado: {email}")

        if usuario.papel == Papel.ADMIN:
            print(f"{email} já é administrador.")
            return

        await repositorio.alterar_papel(
            usuario,
            Papel.ADMIN,
            alterado_por_id=usuario.id,
        )
        await session.commit()

    print(f"{email} promovido para administrador.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Promove um usuário existente para o papel ADMIN.",
    )
    parser.add_argument("--email", required=True, help="E-mail exato do usuário cadastrado.")
    argumentos = parser.parse_args()
    asyncio.run(promover_admin(argumentos.email.strip().lower()))


if __name__ == "__main__":
    main()
