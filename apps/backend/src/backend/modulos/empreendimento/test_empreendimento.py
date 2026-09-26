import asyncio
import uuid
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from .esquemas import (
    Empreendimento_FromRequest_Schema,
    Empreendimento_StatusRequest_Schema,
    Empreendimento_UpdateRequest_Schema,
    Pavimento_FromRequest_Schema,
    Unidade_FromRequest_Schema,
)
from .modelos import Empreendimento, StatusEmpreendimento, TipoLocalObra
from .servicos import EmpreendimentoService


def payload_valido(**alteracoes):
    dados = {
        "empresa_id": uuid.uuid4(),
        "nome": "Residencial Ipê",
        "descricao": "Duas torres residenciais",
        "endereco": "Av. Central, 100",
    }
    dados.update(alteracoes)
    return dados


class EmpreendimentoRepoFalso:
    def __init__(self, *, empresa=None, empreendimento=None):
        self.empresa = empresa
        self.empreendimento = empreendimento
        self.status_criacao = None
        self.payload_atualizacao = None
        self.payload_status = None

    async def get_empresa_by_id(self, _db, _empresa_id):
        return self.empresa

    async def create_empreendimento(self, _db, payload, status):
        self.status_criacao = status
        return SimpleNamespace(**payload.model_dump(), status=status)

    async def get_empreendimento_by_id(self, _db, _empreendimento_id):
        return self.empreendimento

    async def get_all_empreendimentos(self, _db):
        return [self.empreendimento] if self.empreendimento else []

    async def update_empreendimento(self, _db, _empreendimento_id, payload):
        self.payload_atualizacao = payload
        return self.empreendimento

    async def update_status(self, _db, _empreendimento_id, payload):
        self.payload_status = payload
        self.empreendimento.status = payload.status
        return self.empreendimento


def service_com(repo):
    service = EmpreendimentoService()
    service.repo = repo
    return service


def test_schema_de_criacao_nao_recebe_status():
    with pytest.raises(ValidationError):
        Empreendimento_FromRequest_Schema.model_validate(
            {**payload_valido(), "status": "CONCLUIDO"}
        )


def test_schema_remove_espacos_e_rejeita_nome_vazio():
    schema = Empreendimento_FromRequest_Schema.model_validate(
        payload_valido(nome="  Residencial Novo  ")
    )
    assert schema.nome == "Residencial Novo"

    with pytest.raises(ValidationError):
        Empreendimento_FromRequest_Schema.model_validate(payload_valido(nome="  "))


def test_schema_de_atualizacao_considera_apenas_campos_enviados():
    schema = Empreendimento_UpdateRequest_Schema.model_validate({"nome": "  Residencial Novo  "})

    assert schema.model_dump(exclude_unset=True) == {"nome": "Residencial Novo"}


def test_criacao_define_status_planejado_no_service():
    repo = EmpreendimentoRepoFalso(empresa=SimpleNamespace(ativo=True))
    payload = Empreendimento_FromRequest_Schema.model_validate(payload_valido())

    resultado = asyncio.run(service_com(repo).create_empreendimento(None, payload))

    assert resultado.status is StatusEmpreendimento.PLANEJADO
    assert repo.status_criacao is StatusEmpreendimento.PLANEJADO


def test_criacao_rejeita_empresa_inexistente():
    payload = Empreendimento_FromRequest_Schema.model_validate(payload_valido())

    with pytest.raises(HTTPException) as erro:
        asyncio.run(service_com(EmpreendimentoRepoFalso()).create_empreendimento(None, payload))

    assert erro.value.status_code == 404
    assert erro.value.detail == "Empresa não encontrada."


def test_criacao_rejeita_empresa_inativa():
    payload = Empreendimento_FromRequest_Schema.model_validate(payload_valido())

    with pytest.raises(HTTPException) as erro:
        asyncio.run(
            service_com(
                EmpreendimentoRepoFalso(empresa=SimpleNamespace(ativo=False))
            ).create_empreendimento(None, payload)
        )

    assert erro.value.status_code == 409


def test_consulta_rejeita_empreendimento_inexistente():
    with pytest.raises(HTTPException) as erro:
        asyncio.run(
            service_com(EmpreendimentoRepoFalso()).get_empreendimento_by_id(None, uuid.uuid4())
        )

    assert erro.value.status_code == 404
    assert erro.value.detail == "Empreendimento não encontrado."


def test_edicao_de_empreendimento_inativo_e_bloqueada():
    atual = SimpleNamespace(status=StatusEmpreendimento.INATIVO)
    payload = Empreendimento_UpdateRequest_Schema(nome="Novo nome")

    with pytest.raises(HTTPException) as erro:
        asyncio.run(
            service_com(EmpreendimentoRepoFalso(empreendimento=atual)).update_empreendimento(
                None, uuid.uuid4(), payload
            )
        )

    assert erro.value.status_code == 403


def test_edicao_delega_somente_campos_enviados():
    atual = SimpleNamespace(status=StatusEmpreendimento.PLANEJADO)
    repo = EmpreendimentoRepoFalso(empreendimento=atual)
    payload = Empreendimento_UpdateRequest_Schema(nome="Novo nome")

    asyncio.run(service_com(repo).update_empreendimento(None, uuid.uuid4(), payload))

    assert repo.payload_atualizacao.model_dump(exclude_unset=True) == {"nome": "Novo nome"}


def test_status_igual_ao_atual_e_rejeitado():
    atual = SimpleNamespace(status=StatusEmpreendimento.PLANEJADO)
    payload = Empreendimento_StatusRequest_Schema(status=StatusEmpreendimento.PLANEJADO)

    with pytest.raises(HTTPException) as erro:
        asyncio.run(
            service_com(EmpreendimentoRepoFalso(empreendimento=atual)).update_status(
                None, uuid.uuid4(), payload
            )
        )

    assert erro.value.status_code == 400


def test_status_e_alterado_por_operacao_dedicada():
    atual = SimpleNamespace(status=StatusEmpreendimento.PLANEJADO)
    repo = EmpreendimentoRepoFalso(empreendimento=atual)
    payload = Empreendimento_StatusRequest_Schema(status=StatusEmpreendimento.EM_ANDAMENTO)

    resultado = asyncio.run(service_com(repo).update_status(None, uuid.uuid4(), payload))

    assert resultado.status is StatusEmpreendimento.EM_ANDAMENTO
    assert repo.payload_status is payload


def test_modelo_atualiza_timestamp_em_alteracoes():
    assert Empreendimento.__table__.c.atualizado_em.onupdate is not None


class RepoLocalFalso:
    def __init__(self, empreendimento, pai):
        self.empreendimento = empreendimento
        self.pai = pai
        self.criacao = None

    async def get_local_empreendimento(self, _db, _id):
        return self.empreendimento

    async def get_local_obra(self, _db, _id):
        return self.pai

    async def create_pavimento(self, _db, empreendimento_id, parent_id, payload):
        self.criacao = (empreendimento_id, parent_id, payload)
        return SimpleNamespace(
            empreendimento_id=empreendimento_id,
            parent_id=parent_id,
            tipo=TipoLocalObra.PAVIMENTO,
            nome=payload.nome,
            ordem=payload.ordem,
        )

    async def create_unidade(self, _db, empreendimento_id, parent_id, payload):
        self.criacao = (empreendimento_id, parent_id, payload)
        return SimpleNamespace(
            empreendimento_id=empreendimento_id,
            parent_id=parent_id,
            tipo=TipoLocalObra.UNIDADE,
            nome=payload.nome,
            ordem=payload.ordem,
        )


def usuario_com_acesso():
    return SimpleNamespace(papel="COMPRADOR", empreendimento="Residencial Ipê")


def test_schema_de_pavimento_nao_recebe_pai_ou_tipo():
    with pytest.raises(ValidationError):
        Pavimento_FromRequest_Schema.model_validate(
            {"nome": "Térreo", "ordem": 0, "parent_id": uuid.uuid4()}
        )


def test_cria_pavimento_sob_torre():
    empreendimento = SimpleNamespace(
        nome="Residencial Ipê", status=StatusEmpreendimento.PLANEJADO
    )
    pai = SimpleNamespace(
        empreendimento_id=uuid.uuid4(), tipo=TipoLocalObra.TORRE
    )
    repo = RepoLocalFalso(empreendimento, pai)
    empreendimento_id = uuid.uuid4()
    pai.empreendimento_id = empreendimento_id
    payload = Pavimento_FromRequest_Schema(nome="Térreo", ordem=1)

    resultado = asyncio.run(
        service_com(repo).create_pavimento(
            None, empreendimento_id, pai.empreendimento_id, payload, usuario_com_acesso()
        )
    )

    assert resultado.tipo is TipoLocalObra.PAVIMENTO
    assert resultado.parent_id == empreendimento_id


def test_pavimento_nao_aceita_pai_pavimento():
    empreendimento = SimpleNamespace(
        nome="Residencial Ipê", status=StatusEmpreendimento.PLANEJADO
    )
    pai = SimpleNamespace(empreendimento_id=uuid.uuid4(), tipo=TipoLocalObra.PAVIMENTO)
    empreendimento_id = pai.empreendimento_id

    with pytest.raises(HTTPException) as erro:
        asyncio.run(
            service_com(RepoLocalFalso(empreendimento, pai)).create_pavimento(
                None,
                empreendimento_id,
                pai.empreendimento_id,
                Pavimento_FromRequest_Schema(nome="Térreo"),
                usuario_com_acesso(),
            )
        )

    assert erro.value.status_code == 400


def test_schema_de_unidade_nao_recebe_tipo_ou_pai():
    with pytest.raises(ValidationError):
        Unidade_FromRequest_Schema.model_validate(
            {"nome": "101", "ordem": 0, "tipo": "UNIDADE"}
        )


def test_cria_unidade_sob_pavimento():
    empreendimento_id = uuid.uuid4()
    empreendimento = SimpleNamespace(
        nome="Residencial Ipê", status=StatusEmpreendimento.PLANEJADO
    )
    pai = SimpleNamespace(
        empreendimento_id=empreendimento_id, tipo=TipoLocalObra.PAVIMENTO
    )
    resultado = asyncio.run(
        service_com(RepoLocalFalso(empreendimento, pai)).create_unidade(
            None,
            empreendimento_id,
            uuid.uuid4(),
            Unidade_FromRequest_Schema(nome="101", ordem=1),
            usuario_com_acesso(),
        )
    )

    assert resultado.tipo is TipoLocalObra.UNIDADE
    assert resultado.parent_id != empreendimento_id


def test_unidade_nao_aceita_pai_torre():
    empreendimento_id = uuid.uuid4()
    empreendimento = SimpleNamespace(
        nome="Residencial Ipê", status=StatusEmpreendimento.PLANEJADO
    )
    pai = SimpleNamespace(empreendimento_id=empreendimento_id, tipo=TipoLocalObra.TORRE)

    with pytest.raises(HTTPException) as erro:
        asyncio.run(
            service_com(RepoLocalFalso(empreendimento, pai)).create_unidade(
                None,
                empreendimento_id,
                uuid.uuid4(),
                Unidade_FromRequest_Schema(nome="101"),
                usuario_com_acesso(),
            )
        )

    assert erro.value.status_code == 400
