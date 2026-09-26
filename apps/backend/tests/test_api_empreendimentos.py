from datetime import UTC, datetime
from types import SimpleNamespace

from fastapi.testclient import TestClient

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.main import app
from backend.modulos.usuarios.rotas import get_usuario_autenticado


class SessaoEmMemoria:
    def __init__(self) -> None:
        self.empreendimentos = []

    def add(self, empreendimento) -> None:
        self.empreendimentos.append(empreendimento)

    async def flush(self) -> None:
        empreendimento = self.empreendimentos[-1]
        if empreendimento.id is None:
            agora = datetime.now(UTC)
            empreendimento.id = len(self.empreendimentos)
            empreendimento.criado_em = agora
            empreendimento.atualizado_em = agora

    async def refresh(self, _empreendimento) -> None:
        pass

    async def get(self, _classe, empreendimento_id: int):
        return next((item for item in self.empreendimentos if item.id == empreendimento_id), None)

    async def scalars(self, _consulta):
        return ResultadoEscala(self.empreendimentos)


class ResultadoEscala:
    def __init__(self, empreendimentos) -> None:
        self.empreendimentos = empreendimentos

    def all(self):
        return list(reversed(self.empreendimentos))


def configurar_sessao(session: SessaoEmMemoria) -> None:
    async def fornecer_sessao():
        yield session

    app.dependency_overrides[get_db] = fornecer_sessao


def test_usuario_autenticado_cadastra_e_recebe_empreendimento():
    session = SessaoEmMemoria()
    configurar_sessao(session)
    app.dependency_overrides[get_usuario_autenticado] = lambda: SimpleNamespace(id=1, ativo=True)

    try:
        with TestClient(app) as cliente:
            resposta = cliente.post(
                "/empreendimentos/",
                json={
                    "nome": "Residencial Aurora",
                    "descricao": "Duas torres",
                    "endereco": "Avenida Central, 100",
                    "status": "EM_ANDAMENTO",
                },
            )
    finally:
        app.dependency_overrides.clear()

    assert resposta.status_code == 201
    assert resposta.json() == {
        "id": 1,
        "nome": "Residencial Aurora",
        "descricao": "Duas torres",
        "endereco": "Avenida Central, 100",
        "status": "EM_ANDAMENTO",
        "criado_em": session.empreendimentos[0].criado_em.isoformat().replace("+00:00", "Z"),
        "atualizado_em": session.empreendimentos[0]
        .atualizado_em.isoformat()
        .replace("+00:00", "Z"),
    }
    assert session.empreendimentos[0].nome == "Residencial Aurora"


def test_rejeita_nome_ausente_e_status_invalido():
    session = SessaoEmMemoria()
    configurar_sessao(session)
    app.dependency_overrides[get_usuario_autenticado] = lambda: SimpleNamespace(id=1, ativo=True)

    try:
        with TestClient(app) as cliente:
            sem_nome = cliente.post(
                "/empreendimentos/", json={"nome": "   ", "status": "PLANEJADO"}
            )
            status_invalido = cliente.post(
                "/empreendimentos/", json={"nome": "Aurora", "status": "CANCELADO"}
            )
    finally:
        app.dependency_overrides.clear()

    assert sem_nome.status_code == 422
    assert status_invalido.status_code == 422
    assert session.empreendimentos == []


def test_lista_empreendimentos_disponiveis_do_mais_recente_para_o_mais_antigo():
    session = SessaoEmMemoria()
    configurar_sessao(session)
    app.dependency_overrides[get_usuario_autenticado] = lambda: SimpleNamespace(id=1, ativo=True)

    try:
        with TestClient(app) as cliente:
            cliente.post(
                "/empreendimentos/",
                json={"nome": "Residencial Aurora", "status": "EM_ANDAMENTO"},
            )
            cliente.post(
                "/empreendimentos/",
                json={"nome": "Edifício Horizonte", "status": "PLANEJADO"},
            )
            resposta = cliente.get("/empreendimentos/")
    finally:
        app.dependency_overrides.clear()

    assert resposta.status_code == 200
    assert [item["nome"] for item in resposta.json()] == [
        "Edifício Horizonte",
        "Residencial Aurora",
    ]


def test_lista_empreendimentos_vazia():
    session = SessaoEmMemoria()
    configurar_sessao(session)
    app.dependency_overrides[get_usuario_autenticado] = lambda: SimpleNamespace(id=1, ativo=True)

    try:
        with TestClient(app) as cliente:
            resposta = cliente.get("/empreendimentos/")
    finally:
        app.dependency_overrides.clear()

    assert resposta.status_code == 200
    assert resposta.json() == []


def test_carrega_e_atualiza_parcialmente_empreendimento():
    session = SessaoEmMemoria()
    configurar_sessao(session)
    app.dependency_overrides[get_usuario_autenticado] = lambda: SimpleNamespace(id=1, ativo=True)

    try:
        with TestClient(app) as cliente:
            criado = cliente.post(
                "/empreendimentos/",
                json={
                    "nome": "Residencial Aurora",
                    "descricao": "Duas torres",
                    "endereco": "Avenida Central, 100",
                    "status": "PLANEJADO",
                },
            )
            data_anterior = criado.json()["atualizado_em"]
            consulta = cliente.get("/empreendimentos/1")
            resposta = cliente.patch(
                "/empreendimentos/1",
                json={"nome": "Residencial Aurora Norte", "status": "EM_ANDAMENTO"},
            )
    finally:
        app.dependency_overrides.clear()

    assert consulta.status_code == 200
    assert consulta.json()["nome"] == "Residencial Aurora"
    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "Residencial Aurora Norte"
    assert resposta.json()["status"] == "EM_ANDAMENTO"
    assert resposta.json()["descricao"] == "Duas torres"
    assert resposta.json()["endereco"] == "Avenida Central, 100"
    assert resposta.json()["atualizado_em"] != data_anterior


def test_retorna_404_para_empreendimento_inexistente():
    session = SessaoEmMemoria()
    configurar_sessao(session)
    app.dependency_overrides[get_usuario_autenticado] = lambda: SimpleNamespace(id=1, ativo=True)

    try:
        with TestClient(app) as cliente:
            consulta = cliente.get("/empreendimentos/999")
            atualizacao = cliente.patch("/empreendimentos/999", json={"nome": "Inexistente"})
    finally:
        app.dependency_overrides.clear()

    assert consulta.status_code == 404
    assert consulta.json() == {"detail": "Empreendimento não encontrado"}
    assert atualizacao.status_code == 404
    assert atualizacao.json() == {"detail": "Empreendimento não encontrado"}


def test_rejeita_cadastro_sem_autenticacao():
    session = SessaoEmMemoria()
    configurar_sessao(session)

    try:
        with TestClient(app) as cliente:
            resposta = cliente.post(
                "/empreendimentos/", json={"nome": "Aurora", "status": "PLANEJADO"}
            )
    finally:
        app.dependency_overrides.clear()

    assert resposta.status_code == 401
    assert session.empreendimentos == []
