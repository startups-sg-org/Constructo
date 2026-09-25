import pytest
from pydantic import ValidationError
from sqlalchemy.orm import configure_mappers

from backend.banco_de_dados.connections.database_postgres import Base
from backend.modulos.dominio import modelos as dominio  # noqa: F401
from backend.modulos.dominio.esquemas import LocalCriar, PublicacaoCriar
from backend.modulos.dominio.regras import (
    EstadoMarco,
    TipoLocal,
    calcular_progresso,
    validar_local,
    validar_transicao,
)
from backend.modulos.usuarios import modelos as usuarios  # noqa: F401


def test_mapeamento_e_tabelas():
    configure_mappers()
    assert {
        "empreendimentos",
        "locais_obra",
        "taxonomias",
        "etapas",
        "marcos",
        "progressos_marco",
        "evidencias",
        "publicacoes",
        "publicacoes_evidencias",
        "usuarios_unidades",
        "usuarios_empreendimentos",
    } <= set(Base.metadata.tables)


def test_arvore_e_transicoes():
    validar_local(TipoLocal.UNIDADE, TipoLocal.PAVIMENTO)
    validar_local(TipoLocal.TORRE, None)
    with pytest.raises(ValueError):
        validar_local(TipoLocal.UNIDADE, TipoLocal.TORRE)
    validar_transicao(EstadoMarco.NAO_INICIADO, EstadoMarco.EM_ANDAMENTO)
    with pytest.raises(ValueError):
        validar_transicao(EstadoMarco.NAO_INICIADO, EstadoMarco.CONCLUIDO)


def test_progresso_conta_todos_os_marcos_e_caso_vazio():
    assert calcular_progresso([]) == 0
    assert (
        calcular_progresso(
            [EstadoMarco.CONCLUIDO, EstadoMarco.NAO_INICIADO, EstadoMarco.EM_ANDAMENTO]
        )
        == 33
    )


def test_esquemas_rejeitam_dados_invalidos():
    with pytest.raises(ValidationError):
        LocalCriar(empreendimento_id=1, nome="", tipo="UNIDADE")
    with pytest.raises(ValidationError):
        PublicacaoCriar(progresso_marco_id=1, titulo="", texto_cliente="")
