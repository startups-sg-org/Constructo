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


def _item(protocolo_id: int, *, item_id: int, nome: str, ordem: int, obrigatorio: bool = True):
    agora = datetime.now(UTC)
    return SimpleNamespace(
        id=item_id,
        protocolo_id=protocolo_id,
        nome=nome,
        descricao=f"Registro de {nome.lower()}.",
        obrigatorio=obrigatorio,
        ordem=ordem,
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
        protocolo = _protocolo(marco_id)
        protocolo.itens = [
            _item(protocolo.id, item_id=1, nome="Visão geral", ordem=0),
            _item(protocolo.id, item_id=2, nome="Piso", ordem=1),
        ]
        return [protocolo]

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
    assert [item["nome"] for item in consulta.json()[0]["itens"]] == ["Visão geral", "Piso"]


def test_gerencia_itens_de_protocolo(cliente, monkeypatch):
    test_client, session = cliente
    removidos = []

    async def criar(session_recebida, marco_id, protocolo_id, dados):
        assert session_recebida is session
        assert marco_id == 7
        return _item(protocolo_id, item_id=3, nome=dados.nome, ordem=dados.ordem)

    async def listar(session_recebida, marco_id, protocolo_id):
        assert session_recebida is session
        assert marco_id == 7
        return [
            _item(protocolo_id, item_id=1, nome="Visão geral", ordem=0),
            _item(protocolo_id, item_id=2, nome="Piso", ordem=1, obrigatorio=False),
        ]

    async def atualizar(session_recebida, marco_id, protocolo_id, item_id, dados):
        assert session_recebida is session
        assert marco_id == 7
        assert item_id == 2
        return _item(
            protocolo_id,
            item_id=item_id,
            nome=dados.nome or "Piso",
            ordem=dados.ordem if dados.ordem is not None else 1,
            obrigatorio=dados.obrigatorio if dados.obrigatorio is not None else True,
        )

    async def remover(session_recebida, marco_id, protocolo_id, item_id):
        assert session_recebida is session
        removidos.append((marco_id, protocolo_id, item_id))

    monkeypatch.setattr(routes, "criar_item_protocolo", criar)
    monkeypatch.setattr(routes, "listar_itens_protocolo", listar)
    monkeypatch.setattr(routes, "atualizar_item_protocolo", atualizar)
    monkeypatch.setattr(routes, "remover_item_protocolo", remover)

    caminho = "/empreendimentos/42/taxonomia/marcos/7/protocolos-evidencia/1/itens"
    criada = test_client.post(
        caminho,
        json={"nome": "Teste", "descricao": "Executar teste.", "obrigatorio": True, "ordem": 2},
    )
    consulta = test_client.get(caminho)
    atualizada = test_client.patch(
        f"{caminho}/2", json={"nome": "Piso revisado", "obrigatorio": False, "ordem": 3}
    )
    excluida = test_client.delete(f"{caminho}/2")

    assert criada.status_code == 201
    assert criada.json()["protocolo_id"] == 1
    assert criada.json()["nome"] == "Teste"
    assert [item["ordem"] for item in consulta.json()] == [0, 1]
    assert atualizada.status_code == 200
    assert atualizada.json()["nome"] == "Piso revisado"
    assert atualizada.json()["obrigatorio"] is False
    assert excluida.status_code == 204
    assert removidos == [(7, 1, 2)]


def test_atualiza_quantidade_minima_e_consulta_status_do_protocolo(cliente, monkeypatch):
    test_client, session = cliente

    async def atualizar(session_recebida, marco_id, protocolo_id, quantidade_minima):
        assert session_recebida is session
        assert marco_id == 7
        assert protocolo_id == 1
        protocolo = _protocolo(marco_id)
        protocolo.quantidade_minima = quantidade_minima
        return protocolo

    async def consultar_status(session_recebida, marco_id, protocolo_id, progresso_marco_id):
        assert session_recebida is session
        assert (marco_id, protocolo_id, progresso_marco_id) == (7, 1, 9)
        return {
            "protocolo_id": protocolo_id,
            "quantidade_minima": 5,
            "evidencias_registradas": 3,
            "quantidade_atendida": False,
        }

    monkeypatch.setattr(routes, "atualizar_quantidade_minima", atualizar)
    monkeypatch.setattr(routes, "consultar_status_protocolo", consultar_status)

    caminho = "/empreendimentos/42/taxonomia/marcos/7/protocolos-evidencia/1"
    atualizada = test_client.patch(caminho, json={"quantidade_minima": 0})
    status = test_client.get(f"{caminho}/status?progresso_marco_id=9")

    assert atualizada.status_code == 200
    assert atualizada.json()["quantidade_minima"] == 0
    assert status.status_code == 200
    assert status.json() == {
        "protocolo_id": 1,
        "quantidade_minima": 5,
        "evidencias_registradas": 3,
        "quantidade_atendida": False,
    }
