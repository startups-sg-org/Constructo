from fastapi import FastAPI, HTTPException, Depends
from backend.banco_de_dados.conexao import GerenciadorDeUsuarios, get_gerenciador
from backend.esquemas.usuario import CreateUser
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from backend.seguranca.senhas import gerar_senha_hash

origins = [
    "http://localhost:5173"
]

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(token_url="token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/usuarios/")
def criar_usuario(usuario: CreateUser, db: GerenciadorDeUsuarios =Depends(get_gerenciador)):
    try:

        senha_segura = gerar_senha_hash(usuario.senha)

        db.inserir_usuario(
            cpf=usuario.cpf,
            nome=usuario.nome,
            sobrenome=usuario.sobrenome,
            email=usuario.email,
            senha=senha_segura
        )
        return {"Mensagem": "Usuário cadastrado com sucesso!"}
    except Exception as erro:
        raise HTTPException(status_code=400, detail=(str(erro)))

@app.get("/usuarios/")
def listar_usuarios(db: GerenciadorDeUsuarios = Depends(get_gerenciador)):
    usuarios=db.listar_usuarios()
    return {"usuarios": usuarios}