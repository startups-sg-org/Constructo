from fastapi import APIRouter, HTTPException, Depends, Response, Cookie
from backend.modulos.usuarios.conexao import GerenciadorDeUsuarios, get_gerenciador
from backend.modulos.usuarios.esquemas import (
    CreateUser,
    UserReturn,
    LoginUser,
    LoginReturn
)
from backend.modulos.usuarios.senhas import gerar_senha_hash, verificar_senha

router = APIRouter()


def get_usuario_autenticado(
    session_token: str | None = Cookie(default=None),
    db: GerenciadorDeUsuarios = Depends(get_gerenciador)
):
    if not session_token:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    usuario = db.buscar_usuario_por_sessao(session_token)

    if not usuario or not usuario["ativo"]:
        raise HTTPException(status_code=401, detail="Sessão inválida")

    return usuario


@router.post("/login", response_model=LoginReturn)
def login(
    usuario_login: LoginUser,
    response: Response,
    db: GerenciadorDeUsuarios = Depends(get_gerenciador)
):
    usuario = db.buscar_usuario_por_email(usuario_login.email)

    if not usuario or not verificar_senha(usuario_login.senha, usuario["senha"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    if not usuario["ativo"]:
        raise HTTPException(status_code=403, detail="Usuário inativo")

    token = db.criar_sessao(usuario["id"])

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return {
        "mensagem": "Login realizado com sucesso",
        "usuario": usuario
    }


@router.get("/sessao", response_model=UserReturn)
def consultar_sessao(usuario=Depends(get_usuario_autenticado)):
    return usuario


@router.post("/logout")
def logout(
    response: Response,
    session_token: str | None = Cookie(default=None),
    db: GerenciadorDeUsuarios = Depends(get_gerenciador)
):
    if session_token:
        db.excluir_sessao(session_token)

    response.delete_cookie("session_token")

    return {"mensagem": "Logout realizado com sucesso"}

@router.post("/usuarios/", response_model=UserReturn, status_code=201)
def criar_usuario(usuario: CreateUser, db: GerenciadorDeUsuarios = Depends(get_gerenciador)):
    if db.buscar_usuario_por_email(usuario.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    try:
        senha_segura = gerar_senha_hash(usuario.senha)

        usuario_criado = db.inserir_usuario(
            cpf=usuario.cpf,
            nome=usuario.nome,
            sobrenome=usuario.sobrenome,
            email=usuario.email,
            senha=senha_segura,
            telefone=usuario.telefone,
            canal_preferido=usuario.canal_preferido,
            receber_atualizacoes=usuario.receber_atualizacoes,
            empreendimento=usuario.empreendimento,
            unidade=usuario.unidade,
            ativo=usuario.ativo
        )

        return usuario_criado

    except Exception as erro:
        raise HTTPException(status_code=400, detail=str(erro))
