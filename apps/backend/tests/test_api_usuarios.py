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

    async def buscar_usuario_por_id(self, usuario_id: int):
        return next(
            (usuario for usuario in self.usuarios.values() if usuario.id == usuario_id),
            None,
        )

    async def atualizar_usuario(self, usuario: SimpleNamespace, **dados) -> SimpleNamespace:
        self.usuarios.pop(usuario.email.lower())
        for campo, valor in dados.items():
            setattr(usuario, campo, valor)
        usuario.email = usuario.email.lower()
        self.usuarios[usuario.email] = usuario
        return usuario

    async def contar_usuarios(self) -> int:
        return len(self.usuarios)

    async def listar_usuarios(self) -> list[SimpleNamespace]:
        return sorted(
            self.usuarios.values(),
            key=lambda usuario: (usuario.nome, usuario.sobrenome, usuario.id),
        )

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


def test_lista_usuarios_cadastrados_com_status():
    cliente, _ = criar_cliente()
    usuario_inativo = {
        **USUARIO,
        "nome": "Ana",
        "email": "ana@example.com",
        "ativo": False,
    }

    with cliente:
        cliente.post("/usuarios/", json=USUARIO)
        cliente.post("/usuarios/", json=usuario_inativo)
        cliente.post(
            "/login",
            json={"email": USUARIO["email"], "senha": USUARIO["senha"]},
        )
        resposta = cliente.get("/usuarios/")

    app.dependency_overrides.clear()
    assert resposta.status_code == 200
    assert [usuario["email"] for usuario in resposta.json()] == [
        "ana@example.com",
        "maria@example.com",
    ]
    assert [usuario["ativo"] for usuario in resposta.json()] == [False, True]
    assert all("senha" not in usuario for usuario in resposta.json())


def test_rejeita_listagem_de_usuarios_sem_autenticacao():
    cliente, _ = criar_cliente()
    with cliente:
        resposta = cliente.get("/usuarios/")

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


def test_carrega_e_atualiza_usuario_e_reflete_na_listagem():
    cliente, _ = criar_cliente()
    usuario_editado = {
        **USUARIO,
        "nome": "Ana",
        "email": "ana@example.com",
        "ativo": True,
    }

    with cliente:
        cliente.post("/usuarios/", json=USUARIO)
        cliente.post("/usuarios/", json=usuario_editado)
        cliente.post(
            "/login",
            json={"email": USUARIO["email"], "senha": USUARIO["senha"]},
        )

        consulta = cliente.get("/usuarios/2")
        assert consulta.status_code == 200
        assert consulta.json()["nome"] == "Ana"

        novos_dados = {
            key: value
            for key, value in consulta.json().items()
            if key != "id"
        }
        novos_dados.update(
            {
                "nome": "Beatriz",
                "email": "beatriz@example.com",
                "ativo": False,
            }
        )
        atualizacao = cliente.put("/usuarios/2", json=novos_dados)
        listagem = cliente.get("/usuarios/")

    app.dependency_overrides.clear()
    assert atualizacao.status_code == 200
    assert atualizacao.json()["nome"] == "Beatriz"
    assert atualizacao.json()["ativo"] is False
    assert listagem.status_code == 200
    usuario_na_lista = next(
        usuario for usuario in listagem.json() if usuario["id"] == 2
    )
    assert usuario_na_lista["email"] == "beatriz@example.com"
    assert usuario_na_lista["ativo"] is False


def test_rejeita_email_duplicado_na_edicao():
    cliente, _ = criar_cliente()
    outro_usuario = {
        **USUARIO,
        "nome": "Ana",
        "email": "ana@example.com",
    }

    with cliente:
        cliente.post("/usuarios/", json=USUARIO)
        cliente.post("/usuarios/", json=outro_usuario)
        cliente.post(
            "/login",
            json={"email": USUARIO["email"], "senha": USUARIO["senha"]},
        )
        dados = {
            key: value
            for key, value in cliente.get("/usuarios/2").json().items()
            if key != "id"
        }
        dados["email"] = USUARIO["email"]
        resposta = cliente.put("/usuarios/2", json=dados)

    app.dependency_overrides.clear()
    assert resposta.status_code == 400
    assert resposta.json() == {"detail": "E-mail já cadastrado"}


def test_rejeita_edicao_com_dados_invalidos():
    cliente, _ = criar_cliente()

    with cliente:
        cliente.post("/usuarios/", json=USUARIO)
        cliente.post(
            "/login",
            json={"email": USUARIO["email"], "senha": USUARIO["senha"]},
        )
        dados = {
            key: value
            for key, value in cliente.get("/usuarios/1").json().items()
            if key != "id"
        }
        dados["canal_preferido"] = "sms"
        resposta = cliente.put("/usuarios/1", json=dados)

    app.dependency_overrides.clear()
    assert resposta.status_code == 422


def test_rejeita_consulta_e_edicao_sem_autenticacao():
    cliente, _ = criar_cliente()

    with cliente:
        consulta = cliente.get("/usuarios/1")
        edicao = cliente.put("/usuarios/1", json={})

    app.dependency_overrides.clear()
    assert consulta.status_code == 401
    assert edicao.status_code == 401
