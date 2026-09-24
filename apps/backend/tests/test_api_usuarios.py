from types import SimpleNamespace

from fastapi.testclient import TestClient

from backend.main import app
from backend.modulos.usuarios.repositorio import get_repositorio_de_usuarios


class RepositorioEmMemoria:
    def __init__(self) -> None:
        self.usuarios: dict[str, SimpleNamespace] = {}
        self.sessoes: dict[str, SimpleNamespace] = {}
        self.proximo_id = 1

    async def inserir_usuario(self, **dados) -> SimpleNamespace:
        usuario = SimpleNamespace(id=self.proximo_id, **dados)
        self.proximo_id += 1
        self.usuarios[usuario.email.lower()] = usuario
        return usuario

    async def buscar_usuario_por_email(self, email: str):
        return self.usuarios.get(email.lower())

    async def contar_usuarios(self) -> int:
        return len(self.usuarios)

    async def criar_sessao(self, id_usuario: int) -> str:
        usuario = next(usuario for usuario in self.usuarios.values() if usuario.id == id_usuario)
        token = f"token-{id_usuario}"
        self.sessoes[token] = usuario
        return token

    async def buscar_usuario_por_sessao(self, token: str):
        return self.sessoes.get(token)

    async def excluir_sessao(self, token: str) -> None:
        self.sessoes.pop(token, None)


USUARIO = {
    "cpf": "12345678901",
    "nome": "Maria",
    "sobrenome": "Silva",
    "email": "maria@example.com",
    "senha": "senha-segura",
    "telefone": "63999999999",
    "canal_preferido": "email",
    "receber_atualizacoes": True,
    "empreendimento": "Residencial Teste",
    "unidade": "101",
    "ativo": True,
}


def criar_cliente():
    repositorio = RepositorioEmMemoria()
    app.dependency_overrides[get_repositorio_de_usuarios] = lambda: repositorio
    return TestClient(app), repositorio


def test_health_check():
    with TestClient(app) as cliente:
        resposta = cliente.get("/health")
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}


def test_fluxo_completo_de_autenticacao():
    cliente, _ = criar_cliente()
    with cliente:
        cadastro = cliente.post("/usuarios/", json=USUARIO)
        assert cadastro.status_code == 201
        assert cadastro.json()["email"] == USUARIO["email"]
        assert "senha" not in cadastro.json()

        login = cliente.post(
            "/login",
            json={"email": USUARIO["email"], "senha": USUARIO["senha"]},
        )
        assert login.status_code == 200
        assert login.json()["mensagem"] == "Login realizado com sucesso"
        assert login.cookies.get("session_token") == "token-1"

        sessao = cliente.get("/sessao")
        assert sessao.status_code == 200
        assert sessao.json()["id"] == 1

        logout = cliente.post("/logout")
        assert logout.status_code == 200

        sem_sessao = cliente.get("/sessao")
        assert sem_sessao.status_code == 401

    app.dependency_overrides.clear()


def test_rejeita_email_duplicado():
    cliente, _ = criar_cliente()
    with cliente:
        assert cliente.post("/usuarios/", json=USUARIO).status_code == 201
        duplicado = cliente.post("/usuarios/", json=USUARIO)

    app.dependency_overrides.clear()
    assert duplicado.status_code == 400
    assert duplicado.json() == {"detail": "E-mail já cadastrado"}


def test_consulta_quantidade_de_usuarios_autenticado():
    cliente, _ = criar_cliente()
    with cliente:
        cliente.post("/usuarios/", json=USUARIO)
        cliente.post(
            "/login",
            json={"email": USUARIO["email"], "senha": USUARIO["senha"]},
        )
        resposta = cliente.get("/usuarios/quantidade")

    app.dependency_overrides.clear()
    assert resposta.status_code == 200
    assert resposta.json() == {"total": 1}


def test_rejeita_consulta_de_quantidade_sem_autenticacao():
    cliente, _ = criar_cliente()
    with cliente:
        resposta = cliente.get("/usuarios/quantidade")

    app.dependency_overrides.clear()
    assert resposta.status_code == 401


def test_rejeita_senha_incorreta():
    cliente, _ = criar_cliente()
    with cliente:
        cliente.post("/usuarios/", json=USUARIO)
        resposta = cliente.post(
            "/login",
            json={"email": USUARIO["email"], "senha": "senha-errada"},
        )

    app.dependency_overrides.clear()
    assert resposta.status_code == 401
