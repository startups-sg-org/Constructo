from fastapi import APIRouter, HTTPException, Depends
from backend.modulos.usuarios.conexao import GerenciadorDeUsuarios, get_gerenciador
from backend.modulos.usuarios.esquemas import CreateUser, UpdateUser, UserReturn
from backend.modulos.usuarios.senhas import gerar_senha_hash

router = APIRouter()

@router.post("/usuarios/", response_model=UserReturn, status_code=201)
def criar_usuario(usuario: CreateUser, db: GerenciadorDeUsuarios = Depends(get_gerenciador)):
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
            unidade=usuario.unidade
        )

        return usuario_criado

    except Exception as erro:
        raise HTTPException(status_code=400, detail=str(erro))


@router.get("/usuarios/", response_model=list[UserReturn])
def listar_usuarios(db: GerenciadorDeUsuarios = Depends(get_gerenciador)):
    return db.listar_usuarios()


@router.get("/usuarios/{id_usuario}", response_model=UserReturn)
def buscar_usuario(id_usuario: int, db: GerenciadorDeUsuarios = Depends(get_gerenciador)):
    usuario = db.buscar_usuario(id_usuario)

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return usuario


@router.patch("/usuarios/{id_usuario}", response_model=UserReturn)
def atualizar_usuario(
    id_usuario: int,
    usuario: UpdateUser,
    db: GerenciadorDeUsuarios = Depends(get_gerenciador)
):
    if not db.buscar_usuario(id_usuario):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    dados = usuario.model_dump(exclude_unset=True, exclude_none=True)

    if not dados:
        raise HTTPException(status_code=400, detail="Informe ao menos um campo para atualizar")

    if "senha" in dados:
        dados["senha"] = gerar_senha_hash(dados["senha"])

    return db.atualizar_usuario(id_usuario, dados)


@router.delete("/usuarios/{id_usuario}")
def excluir_usuario(id_usuario: int, db: GerenciadorDeUsuarios = Depends(get_gerenciador)):
    if not db.excluir_usuario(id_usuario):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return {"mensagem": "Usuário excluído com sucesso"}
