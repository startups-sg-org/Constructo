from fastapi import FastAPI, HTTPException, Depends
from backend.banco_de_dados.conexao import GerenciadorDeUsuarios, get_gerenciador
from backend.esquemas.usuario import CreateUser, UserReturn
from fastapi.middleware.cors import CORSMiddleware
from backend.seguranca.senhas import gerar_senha_hash

origins = [
    "http://localhost:5173"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/usuarios/", response_model=UserReturn)
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

        return usuario_criado # Uniformizar o retorno
    
    except Exception as erro:
        raise HTTPException(status_code=400, detail=(str(erro)))

