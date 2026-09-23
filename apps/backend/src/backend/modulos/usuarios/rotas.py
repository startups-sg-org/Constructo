from fastapi import APIRouter, HTTPException, Depends
from backend.modulos.usuarios.conexao import GerenciadorDeUsuarios, get_gerenciador
from backend.modulos.usuarios.esquemas import CreateUser, UserReturn
from backend.modulos.usuarios.senhas import gerar_senha_hash

router = APIRouter()

@router.post("/usuarios/", response_model=UserReturn)
def criar_usuario(usuario: CreateUser, db: GerenciadorDeUsuarios = Depends(get_gerenciador)):
    try:

        senha_segura = gerar_senha_hash(usuario.senha)

        usuario_criado = db.inserir_usuario(
            cpf=usuario.cpf,
            nome=usuario.nome,
            sobrenome=usuario.sobrenome,
            email=usuario.email,
            senha=senha_segura
        )

        return usuario_criado

    except Exception as erro:
        raise HTTPException(status_code=400, detail=(str(erro)))
