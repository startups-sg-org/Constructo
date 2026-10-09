from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from backend.banco_de_dados.connections.database_postgres import get_db
from backend.main import app
from backend.modulos.evidencias import routes
from backend.modulos.usuarios.rotas import get_admin_ou_gestor


@pytest.fixture
def cliente(monkeypatch):
    session = object()

    async def fornecer_sessao():
        yield session

    async def permitir_acesso(_session, _usuario, _empreendimento_id):
        return None

    async def permitir_marco(_session, _empreendimento_id, _marco_id):
        return None

    app.dependency_overrides[get_db] = fornecer_sessao
    app.dependency_overrides[get_admin_ou_gestor] = lambda: SimpleNamespace(id=1, papel="ADMIN")
    monkeypatch.setattr(routes, "exigir_acesso_ao_empreendimento", permitir_acesso)
    monkeypatch.setattr(routes, "exigir_marco_do_empreendimento", permitir_marco)

    try:
        with TestClient(app) as test_client:
            yield test_client, session
    finally:
        app.dependency_overrides.clear()


def _protocolo(marco_id: int, nome: str = "Impermeabilização"):
    agora = datetime.now(UTC)
    return SimpleNamespace(
        id=1,
        marco_id=marco_id,
        nome=nome,
        descricao="Registrar piso, ralo e encontros.",
        quantidade_minima=5,
        criado_em=agora,
        atualizado_em=agora,
    )


def test_cria_e_consulta_protocolos_de_evidencia(cliente, monkeypatch):
    test_client, session = cliente
    criados = []

    async def criar(session_recebida, marco_id, dados):
        assert session_recebida is session
        criados.append((marco_id, dados))
        return _protocolo(marco_id, dados.nome)

    async def listar(session_recebida, marco_id):
        assert session_recebida is session
        return [_protocolo(marco_id)]

    monkeypatch.setattr(routes, "criar_protocolo_evidencia", criar)
    monkeypatch.setattr(routes, "listar_protocolos_evidencia", listar)

    caminho = "/empreendimentos/42/taxonomia/marcos/7/protocolos-evidencia"
    criada = test_client.post(
        caminho,
        json={
            "nome": "Impermeabilização",
            "descricao": "Registrar piso, ralo e encontros.",
            "quantidade_minima": 5,
        },
    )
    consulta = test_client.get(caminho)

    assert criada.status_code == 201
    assert criada.json()["marco_id"] == 7
    assert criada.json()["nome"] == "Impermeabilização"
    assert criada.json()["quantidade_minima"] == 5
    assert criados[0][0] == 7
    assert criados[0][1].nome == "Impermeabilização"

    assert consulta.status_code == 200
    assert consulta.json()[0]["marco_id"] == 7
    assert consulta.json()[0]["nome"] == "Impermeabilização"
