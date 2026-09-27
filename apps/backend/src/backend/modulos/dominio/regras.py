"""Regras puras compartilhadas pelos futuros serviços administrativo e comprador."""

from collections.abc import Iterable
from enum import StrEnum


class Papel(StrEnum):
    ADMIN = "ADMIN"
    GESTOR = "GESTOR"
    COMPRADOR = "COMPRADOR"


class TipoLocal(StrEnum):
    TORRE = "TORRE"
    PAVIMENTO = "PAVIMENTO"
    UNIDADE = "UNIDADE"


class EstadoMarco(StrEnum):
    NAO_INICIADO = "NAO_INICIADO"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDO = "CONCLUIDO"


TRANSICOES = {
    EstadoMarco.NAO_INICIADO: {EstadoMarco.EM_ANDAMENTO},
    EstadoMarco.EM_ANDAMENTO: {EstadoMarco.CONCLUIDO},
    EstadoMarco.CONCLUIDO: {EstadoMarco.EM_ANDAMENTO},
}


def validar_transicao(atual: EstadoMarco, proximo: EstadoMarco) -> None:
    if proximo not in TRANSICOES[atual]:
        raise ValueError(f"Transição inválida: {atual} → {proximo}")


def validar_local(tipo: TipoLocal, pai: TipoLocal | None) -> None:
    esperado = {
        TipoLocal.TORRE: None,
        TipoLocal.PAVIMENTO: TipoLocal.TORRE,
        TipoLocal.UNIDADE: TipoLocal.PAVIMENTO,
    }[tipo]
    if pai != esperado:
        raise ValueError(f"{tipo} requer pai {esperado}")


class EstadoProtocolo(StrEnum):
    SEM_PROTOCOLO = "SEM_PROTOCOLO"
    INCOMPLETO = "INCOMPLETO"
    COMPLETO = "COMPLETO"


def calcular_estado_protocolo(
    total_necessario: int,
    total_registrado: int,
) -> EstadoProtocolo:
    """Calcula o estado do protocolo de evidências."""
    if total_necessario <= 0:
        return EstadoProtocolo.SEM_PROTOCOLO
    if total_registrado >= total_necessario:
        return EstadoProtocolo.COMPLETO
    return EstadoProtocolo.INCOMPLETO


def calcular_progresso(estados: Iterable[EstadoMarco]) -> int:
    """Percentual inteiro dos marcos aplicáveis à unidade; sem marcos, zero."""
    valores = list(estados)
    return (
        round(100 * sum(estado == EstadoMarco.CONCLUIDO for estado in valores) / len(valores))
        if valores
        else 0
    )

