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
from backend.modulos.dominio.modelos import (
    Empreendimento,
    Etapa,
    Evidencia,
    LocalObra,
    Marco,
    ProgressoMarco,
    Taxonomia,
)
from backend.modulos.dominio.regras import TipoLocal
from backend.modulos.evidencias import routes, servicos
from backend.modulos.evidencias.modulos import ItemProtocolo, ProtocoloEvidencia
from backend.modulos.evidencias.regras import quantidade_minima_atendida
from backend.modulos.evidencias.repository import ProtocolosEvidenciaRepo
from backend.modulos.evidencias.schemas import (
    EvidenciaCriar_Schema,
    EvidenciaItem_FromRequest_Schema,
    ProtocoloEvidencia_Atualizar_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
)
from backend.modulos.evidencias.storage import LocalStorage, obter_storage
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.rotas import get_admin_ou_gestor, get_usuario_autenticado


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
    usuario = SimpleNamespace(id=1, papel="ADMIN", ativo=True)
    app.dependency_overrides[get_admin_ou_gestor] = lambda: usuario
    app.dependency_overrides[get_usuario_autenticado] = lambda: usuario
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
    ids=["tipo-nao-permitido", "conteudo-invalido", "arquivo-muito-grande"],
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
            "itens_pendentes": [],
            "itens_obrigatorios_atendidos": True,
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
        "itens_pendentes": [],
        "itens_obrigatorios_atendidos": True,
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
            "itens_pendentes": [],
            "itens_obrigatorios_atendidos": True,
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
        contar_evidencias_do_protocolo=AsyncMock(return_value=3),
    )
    monkeypatch.setattr(servicos, "_repositorio", repositorio)
    monkeypatch.setattr(
        servicos,
        "_repositorio_itens",
        SimpleNamespace(listar_itens_obrigatorios_pendentes=AsyncMock(return_value=[])),
    )
    session = object()

    async def executar_teste():
        atualizado = await servicos.atualizar_quantidade_minima(session, 7, 1, 0)
        protocolo.quantidade_minima = 3
        status = await servicos.consultar_status_protocolo(session, 7, 1, 9)
        return atualizado, status

    atualizado, status = asyncio.run(executar_teste())

    assert atualizado is protocolo
    repositorio.atualizar_quantidade_minima.assert_awaited_once_with(session, protocolo, 0)
    repositorio.contar_evidencias_do_protocolo.assert_awaited_once_with(session, 1, 9)
    assert status == {
        "protocolo_id": 1,
        "quantidade_minima": 3,
        "evidencias_registradas": 3,
        "quantidade_atendida": True,
        "itens_pendentes": [],
        "itens_obrigatorios_atendidos": True,
    }


def test_servico_rejeita_progresso_de_outro_marco(monkeypatch):
    protocolo = SimpleNamespace(id=1, marco_id=7, quantidade_minima=3)
    repositorio = SimpleNamespace(
        buscar_protocolo_por_id=AsyncMock(return_value=protocolo),
        buscar_progresso_por_id=AsyncMock(return_value=SimpleNamespace(id=9, marco_id=8)),
        contar_evidencias_do_protocolo=AsyncMock(),
    )
    monkeypatch.setattr(servicos, "_repositorio", repositorio)

    async def executar_teste():
        with pytest.raises(ValueError, match="Progresso inexistente no marco: 9"):
            await servicos.consultar_status_protocolo(object(), 7, 1, 9)

    asyncio.run(executar_teste())
    repositorio.contar_evidencias_do_protocolo.assert_not_awaited()


def test_conta_apenas_evidencias_do_protocolo_e_progresso_informados():
    async def executar_teste():
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        try:
            async with engine.begin() as conexao:
                await conexao.run_sync(Base.metadata.create_all)

            fabrica_sessao = async_sessionmaker(engine, expire_on_commit=False)
            async with fabrica_sessao() as session:
                protocolo = ProtocoloEvidencia(marco_id=7, nome="Protocolo A")
                outro_protocolo = ProtocoloEvidencia(marco_id=7, nome="Protocolo B")
                session.add_all([protocolo, outro_protocolo])
                await session.flush()
                item = ItemProtocolo(protocolo_id=protocolo.id, nome="Item A", ordem=0)
                outro_item = ItemProtocolo(
                    protocolo_id=outro_protocolo.id, nome="Item B", ordem=0
                )
                session.add_all([item, outro_item])
                await session.flush()
                agora = datetime.now(UTC)
                session.add_all(
                    [
                        Evidencia(
                            progresso_marco_id=9,
                            local_obra_id=3,
                            marco_id=7,
                            item_protocolo_id=item.id,
                            arquivo_url="privado/um.jpg",
                            capturado_em=agora,
                            usuario_id=1,
                        ),
                        Evidencia(
                            progresso_marco_id=9,
                            local_obra_id=3,
                            marco_id=7,
                            item_protocolo_id=item.id,
                            arquivo_url="privado/dois.jpg",
                            capturado_em=agora,
                            usuario_id=1,
                        ),
                        Evidencia(
                            progresso_marco_id=9,
                            local_obra_id=3,
                            marco_id=7,
                            item_protocolo_id=outro_item.id,
                            arquivo_url="privado/outro-protocolo.jpg",
                            capturado_em=agora,
                            usuario_id=1,
                        ),
                        Evidencia(
                            progresso_marco_id=10,
                            local_obra_id=4,
                            marco_id=7,
                            item_protocolo_id=item.id,
                            arquivo_url="privado/outro-progresso.jpg",
                            capturado_em=agora,
                            usuario_id=1,
                        ),
                    ]
                )
                await session.flush()

                total = await ProtocolosEvidenciaRepo().contar_evidencias_do_protocolo(
                    session, protocolo.id, 9
                )

            assert total == 2
        finally:
            await engine.dispose()

    asyncio.run(executar_teste())


def test_registra_evidencia_associada_ao_item_pela_api(cliente, monkeypatch):
    test_client, session = cliente
    chamadas = []
    agora = datetime.now(UTC)

    async def registrar(session_recebida, **dados):
        assert session_recebida is session
        chamadas.append(dados)
        return SimpleNamespace(
            id=31,
            progresso_marco_id=dados["dados"].progresso_marco_id,
            item_protocolo_id=dados["item_id"],
            arquivo_url=dados["dados"].arquivo_url,
            descricao=dados["dados"].descricao,
            capturado_em=dados["dados"].capturado_em,
            usuario_id=dados["usuario_id"],
        )

    monkeypatch.setattr(routes, "registrar_evidencia_no_item", registrar)
    resposta = test_client.post(
        "/empreendimentos/42/taxonomia/marcos/7/protocolos-evidencia/1/itens/4/evidencias",
        json={
            "progresso_marco_id": 9,
            "arquivo_url": "privado/ralo.jpg",
            "descricao": "Detalhe do ralo",
            "capturado_em": agora.isoformat(),
        },
    )

    assert resposta.status_code == 201
    assert resposta.json()["item_protocolo_id"] == 4
    assert resposta.json()["usuario_id"] == 1
    assert chamadas[0]["empreendimento_id"] == 42
    assert chamadas[0]["marco_id"] == 7
    assert chamadas[0]["protocolo_id"] == 1


def test_servico_rejeita_arquivo_nao_registrado_no_empreendimento(monkeypatch):
    monkeypatch.setattr(
        servicos,
        "exigir_item_do_protocolo",
        AsyncMock(return_value=SimpleNamespace(id=4, protocolo_id=1)),
    )
    monkeypatch.setattr(
        servicos,
        "_repositorio",
        SimpleNamespace(
            buscar_progresso_por_id=AsyncMock(return_value=SimpleNamespace(id=9, marco_id=7))
        ),
    )
    monkeypatch.setattr(
        servicos,
        "_repositorio_arquivos",
        SimpleNamespace(buscar_por_url_no_empreendimento=AsyncMock(return_value=None)),
    )
    registrar = AsyncMock()
    monkeypatch.setattr(servicos, "registrar_evidencia_dominio", registrar)
    dados = EvidenciaItem_FromRequest_Schema(
        progresso_marco_id=9,
        arquivo_url="/uploads/empreendimentos/42/evidencias/inexistente.jpg",
        capturado_em=datetime.now(UTC),
    )

    async def executar_teste():
        with pytest.raises(
            ValueError, match="Arquivo de evidência inexistente no empreendimento"
        ):
            await servicos.registrar_evidencia_no_item(
                object(),
                empreendimento_id=42,
                marco_id=7,
                protocolo_id=1,
                item_id=4,
                usuario_id=1,
                dados=dados,
            )

    asyncio.run(executar_teste())
    registrar.assert_not_awaited()


def test_schema_da_evidencia_exige_local_marco_e_data_de_captura():
    agora = datetime.now(UTC)
    dados = EvidenciaCriar_Schema(
        local_obra_id=3,
        marco_id=7,
        descricao_tecnica="  Detalhe técnico  ",
        capturado_em=agora,
    )

    assert dados.local_obra_id == 3
    assert dados.marco_id == 7
    assert dados.item_protocolo_id is None
    assert dados.descricao_tecnica == "Detalhe técnico"

    with pytest.raises(ValidationError):
        EvidenciaCriar_Schema(local_obra_id=3, marco_id=7)


def test_servico_mantem_arquivo_e_metadados_na_mesma_evidencia(monkeypatch):
    agora = datetime.now(UTC)
    arquivo = SimpleNamespace(id=11, empreendimento_id=42, url="/uploads/foto.png")
    progresso = SimpleNamespace(id=9, local_obra_id=3, marco_id=7)
    evidencia = SimpleNamespace(id=31, arquivo_evidencia_id=arquivo.id)
    local = SimpleNamespace(id=3, empreendimento_id=42, tipo=TipoLocal.TORRE)
    repositorio_evidencias = SimpleNamespace(
        buscar_local=AsyncMock(return_value=local),
        buscar_progresso=AsyncMock(return_value=progresso),
        criar=AsyncMock(return_value=evidencia),
    )
    monkeypatch.setattr(servicos, "_repositorio_evidencias", repositorio_evidencias)
    monkeypatch.setattr(
        servicos, "exigir_marco_do_empreendimento", AsyncMock(return_value=SimpleNamespace(id=7))
    )
    monkeypatch.setattr(servicos, "pode_gerir", AsyncMock(return_value=True))
    dados = EvidenciaCriar_Schema(
        local_obra_id=3,
        marco_id=7,
        descricao_tecnica="Teste de estanqueidade",
        capturado_em=agora,
    )
    session = object()
    usuario = SimpleNamespace(id=1, papel="ADMIN", ativo=True)

    resultado = asyncio.run(
        servicos.criar_evidencia(
            session,
            empreendimento_id=42,
            usuario=usuario,
            arquivo=arquivo,
            dados=dados,
        )
    )

    assert resultado is evidencia
    repositorio_evidencias.criar.assert_awaited_once_with(
        session,
        progresso_marco_id=9,
        local=local,
        local_obra_id=3,
        marco_id=7,
        item_protocolo_id=None,
        arquivo=arquivo,
        descricao_tecnica="Teste de estanqueidade",
        capturado_por=1,
        capturado_em=agora,
    )


def test_servico_rejeita_local_inexistente(monkeypatch):
    repositorio_evidencias = SimpleNamespace(
        buscar_local=AsyncMock(return_value=None),
        buscar_progresso=AsyncMock(),
    )
    monkeypatch.setattr(servicos, "_repositorio_evidencias", repositorio_evidencias)
    dados = EvidenciaCriar_Schema(
        local_obra_id=999,
        marco_id=7,
        capturado_em=datetime.now(UTC),
    )

    async def executar_teste():
        with pytest.raises(servicos.LocalObraNaoEncontradoError):
            await servicos.validar_local_da_evidencia(
                object(),
                empreendimento_id=42,
                usuario=SimpleNamespace(id=1, papel="GESTOR", ativo=True),
                dados=dados,
            )

    asyncio.run(executar_teste())
    repositorio_evidencias.buscar_progresso.assert_not_awaited()


def test_servico_bloqueia_usuario_sem_acesso_ao_empreendimento(monkeypatch):
    local = SimpleNamespace(id=3, empreendimento_id=42, tipo=TipoLocal.TORRE)
    repositorio_evidencias = SimpleNamespace(
        buscar_local=AsyncMock(return_value=local),
        buscar_progresso=AsyncMock(),
    )
    monkeypatch.setattr(servicos, "_repositorio_evidencias", repositorio_evidencias)
    monkeypatch.setattr(servicos, "pode_gerir", AsyncMock(return_value=False))
    dados = EvidenciaCriar_Schema(
        local_obra_id=3,
        marco_id=7,
        capturado_em=datetime.now(UTC),
    )

    async def executar_teste():
        with pytest.raises(servicos.AcessoLocalObraNegadoError):
            await servicos.validar_local_da_evidencia(
                object(),
                empreendimento_id=42,
                usuario=SimpleNamespace(id=8, papel="GESTOR", ativo=True),
                dados=dados,
            )

    asyncio.run(executar_teste())
    repositorio_evidencias.buscar_progresso.assert_not_awaited()


def test_api_retorna_403_sem_salvar_arquivo_quando_usuario_nao_tem_acesso(
    cliente, monkeypatch
):
    test_client, _ = cliente
    validar = AsyncMock(
        side_effect=servicos.AcessoLocalObraNegadoError(
            "Acesso negado ao empreendimento do local"
        )
    )
    salvar = AsyncMock()
    monkeypatch.setattr(routes, "validar_local_da_evidencia", validar)
    monkeypatch.setattr(routes, "salvar_evidencia", salvar)

    resposta = test_client.post(
        "/empreendimentos/42/evidencias",
        data={
            "local_obra_id": "3",
            "marco_id": "7",
            "capturado_em": datetime.now(UTC).isoformat(),
        },
        files={"file": ("foto.png", b"\x89PNG\r\n\x1a\nconteudo", "image/png")},
    )

    assert resposta.status_code == 403
    salvar.assert_not_awaited()


def test_comprador_so_pode_registrar_na_unidade_vinculada(monkeypatch):
    local = SimpleNamespace(id=12, empreendimento_id=42, tipo=TipoLocal.UNIDADE)
    progresso = SimpleNamespace(id=9, local_obra_id=12, marco_id=7)
    repositorio_evidencias = SimpleNamespace(
        buscar_local=AsyncMock(return_value=local),
        buscar_progresso=AsyncMock(return_value=progresso),
    )
    monkeypatch.setattr(servicos, "_repositorio_evidencias", repositorio_evidencias)
    monkeypatch.setattr(servicos, "pode_gerir", AsyncMock(return_value=False))
    monkeypatch.setattr(servicos, "pode_ler_unidade", AsyncMock(return_value=True))
    monkeypatch.setattr(
        servicos, "exigir_marco_do_empreendimento", AsyncMock(return_value=SimpleNamespace(id=7))
    )
    dados = EvidenciaCriar_Schema(
        local_obra_id=12,
        marco_id=7,
        capturado_em=datetime.now(UTC),
    )

    contexto = asyncio.run(
        servicos.validar_local_da_evidencia(
            object(),
            empreendimento_id=42,
            usuario=SimpleNamespace(id=15, papel="COMPRADOR", ativo=True),
            dados=dados,
        )
    )

    assert contexto.local is local
    assert contexto.progresso is progresso


def test_evidencia_pode_ser_consultada_pela_api(cliente, monkeypatch):
    test_client, session = cliente
    agora = datetime.now(UTC)

    async def buscar(session_recebida, empreendimento_id, evidencia_id):
        assert session_recebida is session
        assert (empreendimento_id, evidencia_id) == (42, 31)
        return SimpleNamespace(
            id=31,
            arquivo_url="/uploads/empreendimentos/42/evidencias/foto.png",
            descricao_tecnica="Detalhe técnico",
            local_obra_id=3,
            marco_id=7,
            item_protocolo_id=None,
            capturado_por=1,
            capturado_em=agora,
            criado_em=agora,
            atualizado_em=agora,
            local_obra=SimpleNamespace(
                id=3,
                nome="Torre A",
                tipo=TipoLocal.TORRE,
                parent_id=None,
            ),
        )

    monkeypatch.setattr(routes, "buscar_evidencia", buscar)
    resposta = test_client.get("/empreendimentos/42/evidencias/31")

    assert resposta.status_code == 200
    assert resposta.json()["arquivo_url"].endswith("/foto.png")
    assert resposta.json()["local_obra_id"] == 3
    assert resposta.json()["marco_id"] == 7
    assert resposta.json()["capturado_por"] == 1
    assert resposta.json()["local_obra"] == {
        "id": 3,
        "nome": "Torre A",
        "tipo": "TORRE",
        "parent_id": None,
    }


def test_lista_evidencias_filtrando_por_local(cliente, monkeypatch):
    test_client, session = cliente
    agora = datetime.now(UTC)
    listar = AsyncMock(
        return_value=[
            SimpleNamespace(
                id=31,
                arquivo_url="/uploads/foto.png",
                descricao_tecnica=None,
                local_obra_id=12,
                marco_id=7,
                item_protocolo_id=None,
                capturado_por=1,
                capturado_em=agora,
                criado_em=agora,
                atualizado_em=agora,
                local_obra=SimpleNamespace(
                    id=12,
                    nome="Unidade 101",
                    tipo=TipoLocal.UNIDADE,
                    parent_id=5,
                ),
            )
        ]
    )
    monkeypatch.setattr(routes, "listar_evidencias", listar)

    resposta = test_client.get("/empreendimentos/42/evidencias?local_obra_id=12")

    assert resposta.status_code == 200
    assert resposta.json()[0]["local_obra"]["tipo"] == "UNIDADE"
    listar.assert_awaited_once_with(
        session,
        42,
        local_obra_id=12,
        marco_id=None,
    )


def test_status_real_separa_minimo_de_itens_obrigatorios():
    async def executar_teste():
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        try:
            async with engine.begin() as conexao:
                await conexao.run_sync(Base.metadata.create_all)

            fabrica_sessao = async_sessionmaker(engine, expire_on_commit=False)
            async with fabrica_sessao() as session:
                usuario = Usuario(
                    cpf="12345678901",
                    nome="Gestor",
                    sobrenome="Teste",
                    email="gestor@example.com",
                    senha="hash",
                    telefone="63999999999",
                    empreendimento="Obra",
                    unidade="101",
                    papel="ADMIN",
                )
                empreendimento = Empreendimento(nome="Obra teste")
                session.add_all([usuario, empreendimento])
                await session.flush()

                local = LocalObra(
                    empreendimento_id=empreendimento.id,
                    nome="Torre A",
                    tipo=TipoLocal.TORRE,
                )
                taxonomia = Taxonomia(empreendimento_id=empreendimento.id, nome="Padrão")
                session.add_all([local, taxonomia])
                await session.flush()

                etapa = Etapa(taxonomia_id=taxonomia.id, nome="Impermeabilização")
                session.add(etapa)
                await session.flush()
                marco = Marco(etapa_id=etapa.id, nome="Teste de estanqueidade")
                session.add(marco)
                await session.flush()
                progresso = ProgressoMarco(
                    local_obra_id=local.id, marco_id=marco.id, status="NAO_INICIADO"
                )
                protocolo = ProtocoloEvidencia(
                    marco_id=marco.id, nome="Impermeabilização", quantidade_minima=2
                )
                session.add_all([progresso, protocolo])
                await session.flush()

                visao_geral = ItemProtocolo(
                    protocolo_id=protocolo.id, nome="Visão geral", obrigatorio=True, ordem=0
                )
                ralo = ItemProtocolo(
                    protocolo_id=protocolo.id, nome="Ralo", obrigatorio=True, ordem=1
                )
                detalhe_opcional = ItemProtocolo(
                    protocolo_id=protocolo.id, nome="Detalhe lateral", obrigatorio=False, ordem=2
                )
                session.add_all([visao_geral, ralo, detalhe_opcional])
                await session.flush()

                agora = datetime.now(UTC)
                session.add_all(
                    [
                        Evidencia(
                            progresso_marco_id=progresso.id,
                            local_obra_id=local.id,
                            marco_id=marco.id,
                            item_protocolo_id=visao_geral.id,
                            arquivo_url="privado/visao.jpg",
                            capturado_em=agora,
                            usuario_id=usuario.id,
                        ),
                        Evidencia(
                            progresso_marco_id=progresso.id,
                            local_obra_id=local.id,
                            marco_id=marco.id,
                            item_protocolo_id=detalhe_opcional.id,
                            arquivo_url="privado/outro.jpg",
                            capturado_em=agora,
                            usuario_id=usuario.id,
                        ),
                    ]
                )
                await session.flush()

                status = await servicos.consultar_status_protocolo(
                    session, marco.id, protocolo.id, progresso.id
                )

                assert status["evidencias_registradas"] == 2
                assert status["quantidade_atendida"] is True
                assert status["itens_obrigatorios_atendidos"] is False
                assert [item["nome"] for item in status["itens_pendentes"]] == ["Ralo"]

                session.add(
                    Evidencia(
                        progresso_marco_id=progresso.id,
                        local_obra_id=local.id,
                        marco_id=marco.id,
                        item_protocolo_id=ralo.id,
                        arquivo_url="privado/ralo.jpg",
                        capturado_em=agora,
                        usuario_id=usuario.id,
                    )
                )
                await session.flush()
                status_completo = await servicos.consultar_status_protocolo(
                    session, marco.id, protocolo.id, progresso.id
                )
                assert status_completo["quantidade_atendida"] is True
                assert status_completo["itens_obrigatorios_atendidos"] is True
                assert status_completo["itens_pendentes"] == []
        finally:
            await engine.dispose()

    asyncio.run(executar_teste())
