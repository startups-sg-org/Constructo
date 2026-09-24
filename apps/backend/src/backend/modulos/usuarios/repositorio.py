import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.modulos.usuarios.modelos import Sessao, Usuario

SESSAO_DURACAO = timedelta(days=7)

class RepositorioDeUsuarios:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def inserir_usuario(
        self,
        *,
        cpf: str,
        nome: str,
        sobrenome: str,
        email: str,
        senha: str,
        telefone: str,
        canal_preferido: str,
        receber_atualizacoes: bool,
        empreendimento: str,
        unidade: str,
        ativo: bool,
    ) -> Usuario:
        usuario = Usuario(
            cpf=cpf,
            nome=nome,
            sobrenome=sobrenome,
            email=email.lower(),
            senha=senha,
            telefone=telefone,
            canal_preferido=canal_preferido,
            receber_atualizacoes=receber_atualizacoes,
            empreendimento=empreendimento,
            unidade=unidade,
            ativo=ativo,
        )
        self.session.add(usuario)
        await self.session.flush()
        await self.session.refresh(usuario)
        return usuario

    async def buscar_usuario_por_email(self, email: str) -> Usuario | None:
        consulta = select(Usuario).where(func.lower(Usuario.email) == email.lower())
        return await self.session.scalar(consulta)

    async def contar_usuarios(self) -> int:
        consulta = select(func.count()).select_from(Usuario)
        return await self.session.scalar(consulta) or 0

    async def listar_usuarios(self) -> list[Usuario]:
        consulta = select(Usuario).order_by(Usuario.nome, Usuario.sobrenome, Usuario.id)
        resultado = await self.session.scalars(consulta)
        return list(resultado.all())

    async def criar_sessao(self, id_usuario: int) -> str:
        token = secrets.token_urlsafe(32)
        self.session.add(
            Sessao(
                token=token,
                usuario_id=id_usuario,
                expira_em=datetime.now(UTC) + SESSAO_DURACAO,
            )
        )
        await self.session.flush()
        return token

    async def buscar_usuario_por_sessao(self, token: str) -> Usuario | None:
        consulta = (
            select(Usuario)
            .join(Sessao, Sessao.usuario_id == Usuario.id)
            .where(
                Sessao.token == token,
                Sessao.expira_em > datetime.now(UTC),
            )
        )
        return await self.session.scalar(consulta)

    async def excluir_sessao(self, token: str) -> None:
        await self.session.execute(delete(Sessao).where(Sessao.token == token))


def get_repositorio_de_usuarios(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> RepositorioDeUsuarios:
    return RepositorioDeUsuarios(session)
