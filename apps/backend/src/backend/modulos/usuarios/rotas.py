from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.exc import IntegrityError

from backend.modulos.usuarios.esquemas import (
    CreateUser,
    LoginReturn,
    LoginUser,
    UserReturn,
)
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.repositorio import (
    RepositorioDeUsuarios,
    get_repositorio_de_usuarios,
)
from backend.modulos.usuarios.senhas import gerar_senha_hash, verificar_senha

router = APIRouter()


async def get_usuario_autenticado(
    repositorio: Annotated[RepositorioDeUsuarios, Depends(get_repositorio_de_usuarios)],
    session_token: Annotated[str | None, Cookie()] = None,
) -> Usuario:
    if not session_token:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    usuario = await repositorio.buscar_usuario_por_sessao(session_token)

    if not usuario or not usuario.ativo:
        raise HTTPException(status_code=401, detail="Sessão inválida")

    return usuario


@router.post("/login", response_model=LoginReturn)
async def login(
    usuario_login: LoginUser,
    response: Response,
    repositorio: Annotated[RepositorioDeUsuarios, Depends(get_repositorio_de_usuarios)],
) -> LoginReturn:
    usuario = await repositorio.buscar_usuario_por_email(str(usuario_login.email))

    if not usuario or not verificar_senha(usuario_login.senha, usuario.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo")

    token = await repositorio.criar_sessao(usuario.id)

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    return LoginReturn(mensagem="Login realizado com sucesso", usuario=usuario)


@router.get("/sessao", response_model=UserReturn)
async def consultar_sessao(
    usuario: Annotated[Usuario, Depends(get_usuario_autenticado)],
) -> Usuario:
    return usuario


@router.post("/logout")
async def logout(
    response: Response,
    repositorio: Annotated[RepositorioDeUsuarios, Depends(get_repositorio_de_usuarios)],
    session_token: Annotated[str | None, Cookie()] = None,
) -> dict[str, str]:
    if session_token:
        await repositorio.excluir_sessao(session_token)

    response.delete_cookie("session_token")
    return {"mensagem": "Logout realizado com sucesso"}


@router.post("/usuarios/", response_model=UserReturn, status_code=201)
async def criar_usuario(
    usuario: CreateUser,
    repositorio: Annotated[RepositorioDeUsuarios, Depends(get_repositorio_de_usuarios)],
) -> Usuario:
    if await repositorio.buscar_usuario_por_email(str(usuario.email)):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    try:
        return await repositorio.inserir_usuario(
            cpf=usuario.cpf,
            nome=usuario.nome,
            sobrenome=usuario.sobrenome,
            email=str(usuario.email),
            senha=gerar_senha_hash(usuario.senha),
            telefone=usuario.telefone,
            canal_preferido=usuario.canal_preferido,
            receber_atualizacoes=usuario.receber_atualizacoes,
            empreendimento=usuario.empreendimento,
            unidade=usuario.unidade,
            ativo=usuario.ativo,
        )
    except IntegrityError as erro:
        await repositorio.session.rollback()
        raise HTTPException(status_code=400, detail="E-mail já cadastrado") from erro
