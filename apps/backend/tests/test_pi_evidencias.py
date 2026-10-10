import asyncio
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from backend.banco_de_dados.connections.database_postgres import Base, get_db
from backend.main import app
from backend.modulos.dominio.modelos import Evidencia
from backend.modulos.evidencias import routes, servicos
from backend.modulos.evidencias.regras import quantidade_minima_atendida
from backend.modulos.evidencias.repository import ProtocolosEvidenciaRepo
from backend.modulos.evidencias.schemas import (
    ProtocoloEvidencia_Atualizar_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
)
from backend.modulos.evidencias.storage import LocalStorage, obter_storage
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


def test_upload_salva_imagem_em_diretorio_isolado_do_empreendimento(
    cliente, tmp_path, monkeypatch
):
    test_client, session = cliente
    storage = LocalStorage(tmp_path)
    app.dependency_overrides[obter_storage] = lambda: storage
    png = b"\x89PNG\r\n\x1a\n" + b"conteudo-da-imagem"
    registros = []

    async def registrar(session_recebida, **dados):
        assert session_recebida is session
        registros.append(dados)
        return SimpleNamespace(id=len(registros), criado_em=datetime.now(UTC))

    monkeypatch.setattr(routes, "registrar_arquivo_evidencia", registrar)

    resposta = test_client.post(
        "/api/evidences/upload",
        data={"empreendimento_id": "42"},
        files={"file": ("obra.png", png, "image/png")},
    )

    assert resposta.status_code == 201
    dados = resposta.json()
    assert dados["id"] == 1
    assert dados["empreendimento_id"] == 42
    assert dados["tipo_mime"] == "image/png"
    assert dados["tamanho"] == len(png)
    assert dados["caminho"].startswith("empreendimentos/42/evidencias/")
    assert dados["url"] == f"/uploads/{dados['caminho']}"
    assert dados["nome"].endswith(".png")
    assert (tmp_path / dados["caminho"]).read_bytes() == png
    assert registros[0]["empreendimento_id"] == 42
    assert registros[0]["usuario_id"] == 1
    assert registros[0]["nome_original"] == "obra.png"

    segunda_resposta = test_client.post(
        "/api/evidences/upload",
        data={"empreendimento_id": "42"},
        files={"file": ("obra.png", png, "image/png")},
    )
    assert segunda_resposta.status_code == 201
    assert segunda_resposta.json()["id"] == 2
    assert segunda_resposta.json()["nome"] != dados["nome"]


@pytest.mark.parametrize(
    ("nome", "conteudo", "tipo_mime", "status"),
    [
        ("documento.pdf", b"%PDF-1.7", "application/pdf", 415),
        ("imagem.png", b"nao-e-uma-imagem", "image/png", 415),
        ("imagem.png", b"\x89PNG\r\n\x1a\n" + b"x" * (5 * 1024 * 1024), "image/png", 413),
    ],
)
def test_upload_rejeita_formato_conteudo_e_tamanho_invalidos(
    cliente, tmp_path, nome, conteudo, tipo_mime, status
):
    test_client, _ = cliente
    app.dependency_overrides[obter_storage] = lambda: LocalStorage(tmp_path)

    resposta = test_client.post(
        "/api/evidences/upload",
        data={"empreendimento_id": "42"},
        files={"file": (nome, conteudo, tipo_mime)},
    )

    assert resposta.status_code == status
    assert not list(tmp_path.rglob("*"))


def test_atualiza_quantidade_minima_e_consulta_status_do_protocolo(cliente, monkeypatch):
    test_client, session = cliente

    async def atualizar(session_recebida, marco_id, protocolo_id, quantidade_minima):
        assert session_recebida is session
        assert (marco_id, protocolo_id, quantidade_minima) == (7, 1, 0)
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
    resposta_status = test_client.get(f"{caminho}/status?progresso_marco_id=9")

    assert atualizada.status_code == 200
    assert atualizada.json()["quantidade_minima"] == 0
    assert resposta_status.status_code == 200
    assert resposta_status.json() == {
        "protocolo_id": 1,
        "quantidade_minima": 5,
        "evidencias_registradas": 3,
        "quantidade_atendida": False,
    }


def test_schemas_aceitam_zero_e_rejeitam_quantidade_minima_negativa():
    criado = ProtocoloEvidencia_FromRequest_Schema(nome="Impermeabilização")
    atualizado = ProtocoloEvidencia_Atualizar_Schema(quantidade_minima=0)

    assert criado.quantidade_minima == 0
    assert atualizado.quantidade_minima == 0

    with pytest.raises(ValidationError):
        ProtocoloEvidencia_FromRequest_Schema(nome="Impermeabilização", quantidade_minima=-1)
    with pytest.raises(ValidationError):
        ProtocoloEvidencia_Atualizar_Schema(quantidade_minima=-1)


def test_endpoint_rejeita_quantidade_minima_negativa(cliente):
    test_client, _ = cliente

    resposta = test_client.patch(
        "/empreendimentos/42/taxonomia/marcos/7/protocolos-evidencia/1",
        json={"quantidade_minima": -1},
    )

    assert resposta.status_code == 422


@pytest.mark.parametrize(
    ("registradas", "minima", "esperado"),
    [(0, 0, True), (2, 3, False), (3, 3, True), (4, 3, True)],
)
def test_regra_quantidade_minima_atendida(registradas, minima, esperado):
    assert quantidade_minima_atendida(registradas, minima) is esperado


def test_status_indica_quantidade_minima_atendida(cliente, monkeypatch):
    test_client, session = cliente

    async def consultar_status(session_recebida, marco_id, protocolo_id, progresso_marco_id):
        assert session_recebida is session
        assert (marco_id, protocolo_id, progresso_marco_id) == (7, 1, 9)
        return {
            "protocolo_id": 1,
            "quantidade_minima": 3,
            "evidencias_registradas": 3,
            "quantidade_atendida": True,
        }

    monkeypatch.setattr(routes, "consultar_status_protocolo", consultar_status)
    resposta = test_client.get(
        "/empreendimentos/42/taxonomia/marcos/7/protocolos-evidencia/1/status?progresso_marco_id=9"
    )

    assert resposta.status_code == 200
    assert resposta.json()["quantidade_atendida"] is True


def test_servico_atualiza_quantidade_e_calcula_status(monkeypatch):
    protocolo = SimpleNamespace(id=1, marco_id=7, quantidade_minima=3)
    progresso = SimpleNamespace(id=9, marco_id=7)
    repositorio = SimpleNamespace(
        buscar_protocolo_por_id=AsyncMock(return_value=protocolo),
        atualizar_quantidade_minima=AsyncMock(return_value=protocolo),
        buscar_progresso_por_id=AsyncMock(return_value=progresso),
        contar_evidencias_do_progresso=AsyncMock(return_value=3),
    )
    monkeypatch.setattr(servicos, "_repositorio", repositorio)
    session = object()

    async def executar_teste():
        atualizado = await servicos.atualizar_quantidade_minima(session, 7, 1, 0)
        protocolo.quantidade_minima = 3
        status = await servicos.consultar_status_protocolo(session, 7, 1, 9)
        return atualizado, status

    atualizado, status = asyncio.run(executar_teste())

    assert atualizado is protocolo
    repositorio.atualizar_quantidade_minima.assert_awaited_once_with(session, protocolo, 0)
    repositorio.contar_evidencias_do_progresso.assert_awaited_once_with(session, 9)
    assert status == {
        "protocolo_id": 1,
        "quantidade_minima": 3,
        "evidencias_registradas": 3,
        "quantidade_atendida": True,
    }


def test_servico_rejeita_progresso_de_outro_marco(monkeypatch):
    protocolo = SimpleNamespace(id=1, marco_id=7, quantidade_minima=3)
    repositorio = SimpleNamespace(
        buscar_protocolo_por_id=AsyncMock(return_value=protocolo),
        buscar_progresso_por_id=AsyncMock(return_value=SimpleNamespace(id=9, marco_id=8)),
        contar_evidencias_do_progresso=AsyncMock(),
    )
    monkeypatch.setattr(servicos, "_repositorio", repositorio)

    async def executar_teste():
        with pytest.raises(ValueError, match="Progresso inexistente no marco: 9"):
            await servicos.consultar_status_protocolo(object(), 7, 1, 9)

    asyncio.run(executar_teste())
    repositorio.contar_evidencias_do_progresso.assert_not_awaited()


def test_conta_apenas_evidencias_do_progresso_informado():
    async def executar_teste():
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        try:
            async with engine.begin() as conexao:
                await conexao.run_sync(Base.metadata.create_all)

            fabrica_sessao = async_sessionmaker(engine, expire_on_commit=False)
            async with fabrica_sessao() as session:
                agora = datetime.now(UTC)
                session.add_all(
                    [
                        Evidencia(
                            progresso_marco_id=9,
                            arquivo_url="privado/um.jpg",
                            capturado_em=agora,
                            usuario_id=1,
                        ),
                        Evidencia(
                            progresso_marco_id=9,
                            arquivo_url="privado/dois.jpg",
                            capturado_em=agora,
                            usuario_id=1,
                        ),
                        Evidencia(
                            progresso_marco_id=10,
                            arquivo_url="privado/outro-progresso.jpg",
                            capturado_em=agora,
                            usuario_id=1,
                        ),
                    ]
                )
                await session.flush()

                total = await ProtocolosEvidenciaRepo().contar_evidencias_do_progresso(
                    session, 9
                )

            assert total == 2
        finally:
            await engine.dispose()

    asyncio.run(executar_teste())
