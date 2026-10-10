from sqlalchemy.ext.asyncio import AsyncSession

from backend.modulos.dominio.esquemas import EvidenciaCriar
from backend.modulos.dominio.servicos import registrar_evidencia as registrar_evidencia_dominio

from .modulos import ArquivoEvidencia, ItemProtocolo, ProtocoloEvidencia
from .regras import itens_obrigatorios_atendidos, quantidade_minima_atendida
from .repository import ArquivosEvidenciaRepo, ItensProtocoloRepo, ProtocolosEvidenciaRepo
from .schemas import (
    EvidenciaItem_FromRequest_Schema,
    ItemProtocolo_Atualizar_Schema,
    ItemProtocolo_FromRequest_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
)

_repositorio = ProtocolosEvidenciaRepo()
_repositorio_itens = ItensProtocoloRepo()
_repositorio_arquivos = ArquivosEvidenciaRepo()


async def registrar_arquivo_evidencia(
    session: AsyncSession,
    *,
    empreendimento_id: int,
    usuario_id: int,
    nome_original: str,
    nome_armazenado: str,
    caminho: str,
    url: str,
    tipo_mime: str,
    tamanho: int,
) -> ArquivoEvidencia:
    return await _repositorio_arquivos.criar(
        session,
        empreendimento_id=empreendimento_id,
        usuario_id=usuario_id,
        nome_original=nome_original,
        nome_armazenado=nome_armazenado,
        caminho=caminho,
        url=url,
        tipo_mime=tipo_mime,
        tamanho=tamanho,
    )


async def _exigir_marco(session: AsyncSession, marco_id: int) -> None:
    marco = await _repositorio.buscar_marco_por_id(session, marco_id)
    if marco is None:
        raise ValueError(f"Marco inexistente: {marco_id}")


async def criar_protocolo_evidencia(
    session: AsyncSession,
    marco_id: int,
    dados: ProtocoloEvidencia_FromRequest_Schema,
) -> ProtocoloEvidencia:
    await _exigir_marco(session, marco_id)
    return await _repositorio.criar_protocolo_evidencia(session, marco_id, dados)


async def listar_protocolos_evidencia(
    session: AsyncSession, marco_id: int
) -> list[ProtocoloEvidencia]:
    await _exigir_marco(session, marco_id)
    return await _repositorio.listar_protocolos_evidencia(session, marco_id)


async def associar_protocolo_ao_marco(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> ProtocoloEvidencia:
    await _exigir_marco(session, marco_id)
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    if protocolo is None:
        raise ValueError(f"Protocolo inexistente: {protocolo_id}")
    return await _repositorio.associar_protocolo_ao_marco(session, protocolo, marco_id)


async def remover_associacao_do_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> None:
    await _exigir_marco(session, marco_id)
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    if protocolo is None or protocolo.marco_id != marco_id:
        raise ValueError(f"Protocolo inexistente no marco: {protocolo_id}")
    await _repositorio.remover_associacao_do_protocolo(session, protocolo)


async def atualizar_quantidade_minima(
    session: AsyncSession, marco_id: int, protocolo_id: int, quantidade_minima: int
) -> ProtocoloEvidencia:
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    return await _repositorio.atualizar_quantidade_minima(session, protocolo, quantidade_minima)


async def consultar_status_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int, progresso_marco_id: int
) -> dict[str, int | bool | list[dict[str, int | str]]]:
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    progresso = await _repositorio.buscar_progresso_por_id(session, progresso_marco_id)
    if progresso is None or progresso.marco_id != marco_id:
        raise ValueError(f"Progresso inexistente no marco: {progresso_marco_id}")
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    registradas = await _repositorio.contar_evidencias_do_protocolo(
        session, protocolo_id, progresso_marco_id
    )
    pendentes = await _repositorio_itens.listar_itens_obrigatorios_pendentes(
        session, protocolo_id, progresso_marco_id
    )
    return {
        "protocolo_id": protocolo.id,
        "quantidade_minima": protocolo.quantidade_minima,
        "evidencias_registradas": registradas,
        "quantidade_atendida": quantidade_minima_atendida(registradas, protocolo.quantidade_minima),
        "itens_pendentes": [
            {"id": item.id, "nome": item.nome, "ordem": item.ordem} for item in pendentes
        ],
        "itens_obrigatorios_atendidos": itens_obrigatorios_atendidos(len(pendentes)),
    }


async def validar_conclusao_progresso(
    session: AsyncSession, progresso_marco_id: int
) -> None:
    """Impede a conclusão quando algum protocolo do marco está incompleto.

    Marcos sem protocolos associados são válidos. Quando há mais de um
    protocolo, todos precisam atender simultaneamente à quantidade mínima e
    aos itens obrigatórios.
    """
    progresso = await _repositorio.buscar_progresso_por_id(session, progresso_marco_id)
    if progresso is None:
        raise ValueError(f"Progresso inexistente: {progresso_marco_id}")

    protocolos = await _repositorio.listar_protocolos_evidencia(session, progresso.marco_id)
    pendencias: list[str] = []
    for protocolo in protocolos:
        status = await consultar_status_protocolo(
            session, progresso.marco_id, protocolo.id, progresso_marco_id
        )
        detalhes: list[str] = []
        if not status["quantidade_atendida"]:
            detalhes.append(
                "quantidade mínima "
                f"({status['evidencias_registradas']}/{status['quantidade_minima']})"
            )
        if not status["itens_obrigatorios_atendidos"]:
            nomes = ", ".join(item["nome"] for item in status["itens_pendentes"])
            detalhes.append(f"itens obrigatórios sem evidência: {nomes}")
        if detalhes:
            pendencias.append(f"Protocolo '{protocolo.nome}': {'; '.join(detalhes)}")

    if pendencias:
        raise ValueError(
            "Não foi possível concluir o marco. Pendências: " + " | ".join(pendencias)
        )


async def registrar_evidencia_no_item(
    session: AsyncSession,
    *,
    empreendimento_id: int,
    marco_id: int,
    protocolo_id: int,
    item_id: int,
    usuario_id: int,
    dados: EvidenciaItem_FromRequest_Schema,
):
    await exigir_item_do_protocolo(session, marco_id, protocolo_id, item_id)
    progresso = await _repositorio.buscar_progresso_por_id(session, dados.progresso_marco_id)
    if progresso is None or progresso.marco_id != marco_id:
        raise ValueError("O progresso informado não pertence ao marco da evidência")

    arquivo = await _repositorio_arquivos.buscar_por_url_no_empreendimento(
        session, empreendimento_id, dados.arquivo_url
    )
    if arquivo is None:
        raise ValueError("Arquivo de evidência inexistente no empreendimento")

    evidencia = EvidenciaCriar(
        progresso_marco_id=dados.progresso_marco_id,
        item_protocolo_id=item_id,
        arquivo_url=dados.arquivo_url,
        descricao=dados.descricao,
        capturado_em=dados.capturado_em,
        usuario_id=usuario_id,
    )
    return await registrar_evidencia_dominio(session, evidencia)


async def exigir_item_do_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int, item_id: int
) -> ItemProtocolo:
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    item = await _repositorio_itens.buscar_item_protocolo(session, protocolo_id, item_id)
    if item is None:
        raise ValueError(f"Item de protocolo inexistente: {item_id}")
    return item


async def _exigir_protocolo_do_marco(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> None:
    protocolo = await _repositorio.buscar_protocolo_por_id(session, protocolo_id)
    if protocolo is None or protocolo.marco_id != marco_id:
        raise ValueError(f"Protocolo inexistente no marco: {protocolo_id}")


async def criar_item_protocolo(
    session: AsyncSession,
    marco_id: int,
    protocolo_id: int,
    dados: ItemProtocolo_FromRequest_Schema,
) -> ItemProtocolo:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    return await _repositorio_itens.criar_item_protocolo(session, protocolo_id, dados)


async def listar_itens_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int
) -> list[ItemProtocolo]:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    return await _repositorio_itens.listar_itens_protocolo(session, protocolo_id)


async def atualizar_item_protocolo(
    session: AsyncSession,
    marco_id: int,
    protocolo_id: int,
    item_id: int,
    dados: ItemProtocolo_Atualizar_Schema,
) -> ItemProtocolo:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    item = await _repositorio_itens.buscar_item_protocolo(session, protocolo_id, item_id)
    if item is None:
        raise ValueError(f"Item de protocolo inexistente: {item_id}")
    return await _repositorio_itens.atualizar_item_protocolo(session, item, dados)


async def remover_item_protocolo(
    session: AsyncSession, marco_id: int, protocolo_id: int, item_id: int
) -> None:
    await _exigir_marco(session, marco_id)
    await _exigir_protocolo_do_marco(session, marco_id, protocolo_id)
    item = await _repositorio_itens.buscar_item_protocolo(session, protocolo_id, item_id)
    if item is None:
        raise ValueError(f"Item de protocolo inexistente: {item_id}")
    await _repositorio_itens.remover_item_protocolo(session, item)
