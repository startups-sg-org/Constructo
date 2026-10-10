from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from backend.modulos.dominio.modelos import Evidencia, LocalObra, Marco, ProgressoMarco
from backend.modulos.dominio.regras import Papel, TipoLocal
from backend.modulos.dominio.servicos import (
    exigir_marco_do_empreendimento,
    pode_gerir,
    pode_ler_unidade,
)
from backend.modulos.dominio.servicos import (
    registrar_evidencia as _registrar_evidencia_dominio,
)
from backend.modulos.usuarios.modelos import Usuario

from .modulos import ArquivoEvidencia, ItemProtocolo, ProtocoloEvidencia
from .regras import itens_obrigatorios_atendidos, quantidade_minima_atendida
from .repository import (
    ArquivosEvidenciaRepo,
    EvidenciasRepo,
    ItensProtocoloRepo,
    ProtocolosEvidenciaRepo,
)
from .schemas import (
    EvidenciaCriar_Schema,
    EvidenciaItem_FromRequest_Schema,
    ItemProtocolo_Atualizar_Schema,
    ItemProtocolo_FromRequest_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
)

_repositorio = ProtocolosEvidenciaRepo()
_repositorio_itens = ItensProtocoloRepo()
_repositorio_arquivos = ArquivosEvidenciaRepo()
_repositorio_evidencias = EvidenciasRepo()
# Mantido como ponto de extensao para integracoes que importavam o nome antigo.
registrar_evidencia_dominio = _registrar_evidencia_dominio


class LocalObraNaoEncontradoError(ValueError):
    pass


class MarcoNaoEncontradoError(ValueError):
    pass


class AcessoLocalObraNegadoError(PermissionError):
    pass


class EvidenciaInvalidaError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class ContextoLocalEvidencia:
    local: LocalObra
    marco: Marco
    progresso: ProgressoMarco


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


async def criar_evidencia(
    session: AsyncSession,
    *,
    empreendimento_id: int,
    usuario: Usuario,
    arquivo: ArquivoEvidencia,
    dados: EvidenciaCriar_Schema,
    contexto: ContextoLocalEvidencia | None = None,
) -> Evidencia:
    """Persiste metadados somente quando local, marco e arquivo sao coerentes."""
    contexto = contexto or await validar_local_da_evidencia(
        session,
        empreendimento_id=empreendimento_id,
        usuario=usuario,
        dados=dados,
    )
    local = contexto.local
    marco = contexto.marco
    progresso = contexto.progresso

    if arquivo.empreendimento_id != empreendimento_id:
        raise EvidenciaInvalidaError("Arquivo de evidência pertence a outro empreendimento")

    if dados.item_protocolo_id is not None:
        item = await _repositorio_itens.buscar_item_por_id(
            session, dados.item_protocolo_id
        )
        if item is None:
            raise EvidenciaInvalidaError("Item de protocolo inexistente")
        protocolo = await _repositorio.buscar_protocolo_por_id(session, item.protocolo_id)
        if protocolo is None or protocolo.marco_id != dados.marco_id:
            raise EvidenciaInvalidaError(
                "Item de protocolo não pertence ao marco informado"
            )

    return await _repositorio_evidencias.criar(
        session,
        progresso_marco_id=progresso.id,
        local=local,
        marco=marco,
        responsavel=usuario,
        local_obra_id=local.id,
        marco_id=dados.marco_id,
        item_protocolo_id=dados.item_protocolo_id,
        arquivo=arquivo,
        descricao_tecnica=dados.descricao_tecnica,
        capturado_por=usuario.id,
        capturado_em=dados.capturado_em,
    )


async def validar_local_da_evidencia(
    session: AsyncSession,
    *,
    empreendimento_id: int,
    usuario: Usuario,
    dados: EvidenciaCriar_Schema,
) -> ContextoLocalEvidencia:
    """Valida local, taxonomia, acesso e aplicabilidade do marco.

    Um progresso existente representa um mapeamento explícito e é aceito em
    qualquer nível físico. Na V1, a inicialização implícita de progresso é
    restrita a unidades, conforme a regra vigente do domínio de progresso.
    """
    local = await _repositorio_evidencias.buscar_local(session, dados.local_obra_id)
    if local is None:
        raise LocalObraNaoEncontradoError(
            f"Local da obra inexistente: {dados.local_obra_id}"
        )
    if local.empreendimento_id != empreendimento_id:
        raise EvidenciaInvalidaError(
            "Local da obra não pertence ao empreendimento informado"
        )

    acesso_gestao = await pode_gerir(session, usuario.id, empreendimento_id)
    acesso_comprador = False
    if usuario.papel == Papel.COMPRADOR:
        if local.tipo != TipoLocal.UNIDADE:
            raise EvidenciaInvalidaError(
                "Evidência registrada por comprador deve estar vinculada a uma unidade"
            )
        acesso_comprador = await pode_ler_unidade(session, usuario.id, local.id)
    if not acesso_gestao and not acesso_comprador:
        raise AcessoLocalObraNegadoError("Acesso negado ao empreendimento do local")

    marco = await _repositorio.buscar_marco_por_id(session, dados.marco_id)
    if marco is None:
        raise MarcoNaoEncontradoError(f"Marco inexistente: {dados.marco_id}")
    try:
        marco = await exigir_marco_do_empreendimento(
            session, empreendimento_id, dados.marco_id
        )
    except ValueError as erro:
        raise EvidenciaInvalidaError(str(erro)) from erro
    progresso = await _repositorio_evidencias.buscar_progresso(
        session, local.id, dados.marco_id
    )
    if progresso is None:
        if local.tipo != TipoLocal.UNIDADE:
            raise EvidenciaInvalidaError(
                "Marco não aplicável ao nível do local: não existe mapeamento de progresso"
            )
        progresso = await _repositorio_evidencias.iniciar_progresso(
            session, local.id, marco.id
        )
    return ContextoLocalEvidencia(local=local, marco=marco, progresso=progresso)


async def buscar_evidencia(
    session: AsyncSession, empreendimento_id: int, evidencia_id: int
) -> Evidencia:
    evidencia = await _repositorio_evidencias.buscar(
        session, evidencia_id, empreendimento_id
    )
    if evidencia is None:
        raise ValueError(f"Evidencia inexistente: {evidencia_id}")
    return evidencia


async def listar_evidencias(
    session: AsyncSession,
    empreendimento_id: int,
    *,
    local_obra_id: int | None = None,
    marco_id: int | None = None,
) -> list[Evidencia]:
    return await _repositorio_evidencias.listar(
        session,
        empreendimento_id,
        local_obra_id=local_obra_id,
        marco_id=marco_id,
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
    usuario: Usuario,
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
    local = await _repositorio_evidencias.buscar_local(session, progresso.local_obra_id)
    if local is None:
        raise ValueError("Local da obra da evidência não existe")
    marco = await _repositorio.buscar_marco_por_id(session, progresso.marco_id)
    if marco is None:
        raise ValueError("Marco da evidência não existe")

    return await _repositorio_evidencias.criar(
        session,
        progresso_marco_id=progresso.id,
        local=local,
        marco=marco,
        responsavel=usuario,
        local_obra_id=progresso.local_obra_id,
        marco_id=progresso.marco_id,
        item_protocolo_id=item_id,
        arquivo=arquivo,
        descricao_tecnica=dados.descricao,
        capturado_por=usuario.id,
        capturado_em=dados.capturado_em,
    )


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
