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
        empreendimento.id = len(self.empreendimentos)
        empreendimento.criado_em = datetime.now(UTC)

    async def refresh(self, _empreendimento) -> None:
        pass


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
