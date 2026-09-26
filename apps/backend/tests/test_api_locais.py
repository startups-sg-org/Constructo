from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.main import app
from backend.modulos.dominio import rotas
from backend.modulos.usuarios.rotas import get_usuario_autenticado


def local_resposta(dados, identificador=1):
    agora = datetime.now(UTC)
    return SimpleNamespace(
        id=identificador,
        empreendimento_id=dados.empreendimento_id,
        parent_id=dados.parent_id,
        nome=dados.nome,
        tipo=dados.tipo,
        ordem=dados.ordem,
        criado_em=agora,
        atualizado_em=agora,
    )


@pytest.fixture
def cliente(monkeypatch):
    session = object()

    async def fornecer_sessao():
        yield session

    async def permitir_acesso(_session, _usuario_id, _empreendimento_id):
        return True

    app.dependency_overrides[get_db] = fornecer_sessao
    app.dependency_overrides[get_usuario_autenticado] = lambda: SimpleNamespace(id=7, ativo=True)
    monkeypatch.setattr(rotas, "pode_gerir", permitir_acesso)

    try:
        with TestClient(app) as test_client:
            yield test_client, session
    finally:
        app.dependency_overrides.clear()


@pytest.mark.parametrize("tipo", ["TORRE", "BLOCO"])
def test_cadastra_torre_ou_bloco_no_empreendimento_sem_pai(cliente, monkeypatch, tipo):
    test_client, session = cliente
    recebidos = []

    async def criar(_session, dados):
        recebidos.append((_session, dados))
        return local_resposta(dados)

    monkeypatch.setattr(rotas, "criar_local", criar)
    resposta = test_client.post(
        "/empreendimentos/42/locais",
        json={"nome": f"{tipo.title()} A", "tipo": tipo, "ordem": 3},
    )

    assert resposta.status_code == 201
    assert resposta.json()["empreendimento_id"] == 42
    assert resposta.json()["parent_id"] is None
    assert resposta.json()["tipo"] == tipo
    assert recebidos[0][0] is session
    assert recebidos[0][1].empreendimento_id == 42
    assert recebidos[0][1].parent_id is None


def test_rejeita_tipo_que_nao_pode_ser_raiz(cliente, monkeypatch):
    chamado = False

    async def criar(_session, _dados):
        nonlocal chamado
        chamado = True

    monkeypatch.setattr(rotas, "criar_local", criar)
    resposta = cliente[0].post(
        "/empreendimentos/42/locais",
        json={"nome": "Primeiro", "tipo": "PAVIMENTO", "ordem": 0},
    )

    assert resposta.status_code == 422
    assert not chamado


def test_cadastra_pavimento_na_torre_ou_bloco_informado(cliente, monkeypatch):
    test_client, session = cliente
    recebidos = []

    async def criar(_session, dados):
        recebidos.append((_session, dados))
        return local_resposta(dados, identificador=9)

    monkeypatch.setattr(rotas, "criar_local", criar)
    resposta = test_client.post(
        "/empreendimentos/42/locais/7/pavimentos",
        json={"nome": "1º pavimento", "ordem": 2},
    )

    assert resposta.status_code == 201
    assert resposta.json()["tipo"] == "PAVIMENTO"
    assert resposta.json()["parent_id"] == 7
    assert recebidos[0][0] is session
    assert recebidos[0][1].empreendimento_id == 42


@pytest.mark.parametrize(
    "mensagem",
    [
        "LocalObra inexistente",
        "Pavimento deve possuir torre ou bloco como pai",
        "Pai e filho devem pertencer ao mesmo empreendimento",
    ],
)
def test_rejeita_pavimento_com_pai_invalido(cliente, monkeypatch, mensagem):
    async def criar(_session, _dados):
        raise ValueError(mensagem)

    monkeypatch.setattr(rotas, "criar_local", criar)
    resposta = cliente[0].post(
        "/empreendimentos/42/locais/7/pavimentos",
        json={"nome": "1º pavimento", "ordem": 2},
    )

    assert resposta.status_code == 400
    assert resposta.json() == {"detail": mensagem}


def test_cadastra_unidade_no_pavimento_informado(cliente, monkeypatch):
    test_client, session = cliente
    recebidos = []

    async def criar(_session, dados):
        recebidos.append((_session, dados))
        return local_resposta(dados, identificador=10)

    monkeypatch.setattr(rotas, "criar_local", criar)
    resposta = test_client.post(
        "/empreendimentos/42/locais/9/unidades",
        json={"nome": "101", "ordem": 3},
    )

    assert resposta.status_code == 201
    assert resposta.json()["tipo"] == "UNIDADE"
    assert resposta.json()["parent_id"] == 9
    assert recebidos[0][0] is session
    assert recebidos[0][1].empreendimento_id == 42


@pytest.mark.parametrize(
    "mensagem",
    [
        "LocalObra inexistente",
        "Unidade deve possuir pavimento como pai",
        "Pai e filho devem pertencer ao mesmo empreendimento",
    ],
)
def test_rejeita_unidade_com_pai_invalido(cliente, monkeypatch, mensagem):
    async def criar(_session, _dados):
        raise ValueError(mensagem)

    monkeypatch.setattr(rotas, "criar_local", criar)
    resposta = cliente[0].post(
        "/empreendimentos/42/locais/9/unidades",
        json={"nome": "101", "ordem": 3},
    )

    assert resposta.status_code == 400
    assert resposta.json() == {"detail": mensagem}


def test_lista_unidades_do_pavimento(cliente, monkeypatch):
    async def listar(_session, empreendimento_id, *, parent_id=None):
        assert empreendimento_id == 42
        assert parent_id == 9
        dados = SimpleNamespace(
            empreendimento_id=42,
            parent_id=9,
            nome="101",
            tipo="UNIDADE",
            ordem=3,
        )
        return [local_resposta(dados, identificador=10)]

    monkeypatch.setattr(rotas, "listar_locais", listar)
    resposta = cliente[0].get("/empreendimentos/42/locais/9/unidades")

    assert resposta.status_code == 200
    assert [(item["nome"], item["parent_id"]) for item in resposta.json()] == [("101", 9)]


def test_rejeita_usuario_sem_acesso_ao_empreendimento(cliente, monkeypatch):
    async def negar_acesso(_session, _usuario_id, _empreendimento_id):
        return False

    monkeypatch.setattr(rotas, "pode_gerir", negar_acesso)
    resposta = cliente[0].post(
        "/empreendimentos/42/locais",
        json={"nome": "Torre A", "tipo": "TORRE", "ordem": 0},
    )

    assert resposta.status_code == 403
    assert resposta.json() == {"detail": "Acesso negado ao empreendimento"}


def test_lista_somente_locais_raiz_do_empreendimento(cliente, monkeypatch):
    async def listar(_session, empreendimento_id, *, parent_id=None):
        assert empreendimento_id == 42
        assert parent_id is None
        dados = SimpleNamespace(
            empreendimento_id=42,
            parent_id=None,
            nome="Bloco A",
            tipo="BLOCO",
            ordem=1,
        )
        return [local_resposta(dados)]

    monkeypatch.setattr(rotas, "listar_locais", listar)
    resposta = cliente[0].get("/empreendimentos/42/locais")

    assert resposta.status_code == 200
    assert [(item["nome"], item["parent_id"]) for item in resposta.json()] == [
        ("Bloco A", None)
    ]


def test_retorna_estrutura_fisica_hierarquica(cliente, monkeypatch):
    async def listar(_session, empreendimento_id):
        assert empreendimento_id == 42
        torre_dados = SimpleNamespace(
            empreendimento_id=42,
            parent_id=None,
            nome="Torre A",
            tipo="TORRE",
            ordem=1,
        )
        pavimento_dados = SimpleNamespace(
            empreendimento_id=42,
            parent_id=1,
            nome="1º Pavimento",
            tipo="PAVIMENTO",
            ordem=1,
        )
        unidade_dados = SimpleNamespace(
            empreendimento_id=42,
            parent_id=2,
            nome="Unidade 101",
            tipo="UNIDADE",
            ordem=1,
        )
        unidade = local_resposta(unidade_dados, identificador=3)
        unidade.filhos = []
        pavimento = local_resposta(pavimento_dados, identificador=2)
        pavimento.filhos = [unidade]
        torre = local_resposta(torre_dados, identificador=1)
        torre.filhos = [pavimento]
        return [torre]

    monkeypatch.setattr(rotas, "listar_estrutura_fisica", listar)
    resposta = cliente[0].get("/empreendimentos/42/estrutura-fisica")

    assert resposta.status_code == 200
    dados = resposta.json()
    assert dados[0]["nome"] == "Torre A"
    assert dados[0]["filhos"][0]["nome"] == "1º Pavimento"
    assert dados[0]["filhos"][0]["filhos"][0]["nome"] == "Unidade 101"
