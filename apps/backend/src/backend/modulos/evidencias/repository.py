from datetime import UTC, datetime

from sqlalchemy import exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from backend.modulos.dominio.modelos import Evidencia, LocalObra, Marco, ProgressoMarco
from backend.modulos.dominio.regras import ProgressStatus

from .modulos import ArquivoEvidencia, ItemProtocolo, ProtocoloEvidencia
from .schemas import (
    ItemProtocolo_Atualizar_Schema,
    ItemProtocolo_FromRequest_Schema,
    ProtocoloEvidencia_FromRequest_Schema,
)


class ProtocolosEvidenciaRepo:
    """Acesso persistente a protocolos de evidência e seus marcos."""

    async def buscar_marco_por_id(self, db: AsyncSession, marco_id: int) -> Marco | None:
        return await db.get(Marco, marco_id)

    async def criar_protocolo_evidencia(
        self,
        db: AsyncSession,
        marco_id: int,
        dados: ProtocoloEvidencia_FromRequest_Schema,
    ) -> ProtocoloEvidencia:
        protocolo = ProtocoloEvidencia(marco_id=marco_id, **dados.model_dump())
        db.add(protocolo)
        await db.flush()
        await db.refresh(protocolo)
        return protocolo

    async def listar_protocolos_evidencia(
        self, db: AsyncSession, marco_id: int
    ) -> list[ProtocoloEvidencia]:
        protocolos = await db.scalars(
            select(ProtocoloEvidencia)
            .where(ProtocoloEvidencia.marco_id == marco_id)
            .options(selectinload(ProtocoloEvidencia.itens))
            .order_by(ProtocoloEvidencia.id)
        )
        return list(protocolos.all())

    async def buscar_protocolo_por_id(
        self, db: AsyncSession, protocolo_id: int
    ) -> ProtocoloEvidencia | None:
        return await db.get(ProtocoloEvidencia, protocolo_id)

    async def associar_protocolo_ao_marco(
        self, db: AsyncSession, protocolo: ProtocoloEvidencia, marco_id: int
    ) -> ProtocoloEvidencia:
        protocolo.marco_id = marco_id
        await db.flush()
        await db.refresh(protocolo)
        return protocolo

    async def remover_associacao_do_protocolo(
        self, db: AsyncSession, protocolo: ProtocoloEvidencia
    ) -> None:
        protocolo.marco_id = None
        await db.flush()

    async def atualizar_quantidade_minima(
        self, db: AsyncSession, protocolo: ProtocoloEvidencia, quantidade_minima: int
    ) -> ProtocoloEvidencia:
        protocolo.quantidade_minima = quantidade_minima
        await db.flush()
        await db.refresh(protocolo)
        return protocolo

    async def buscar_progresso_por_id(
        self, db: AsyncSession, progresso_marco_id: int
    ) -> ProgressoMarco | None:
        return await db.get(ProgressoMarco, progresso_marco_id)

    async def contar_evidencias_do_protocolo(
        self, db: AsyncSession, protocolo_id: int, progresso_marco_id: int
    ) -> int:
        return await db.scalar(
            select(func.count(Evidencia.id))
            .join(ItemProtocolo, ItemProtocolo.id == Evidencia.item_protocolo_id)
            .where(
                ItemProtocolo.protocolo_id == protocolo_id,
                Evidencia.progresso_marco_id == progresso_marco_id,
            )
        ) or 0


class ItensProtocoloRepo:
    """Acesso persistente aos itens que compõem um protocolo de evidência."""

    async def criar_item_protocolo(
        self,
        db: AsyncSession,
        protocolo_id: int,
        dados: ItemProtocolo_FromRequest_Schema,
    ) -> ItemProtocolo:
        item = ItemProtocolo(protocolo_id=protocolo_id, **dados.model_dump())
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    async def listar_itens_protocolo(
        self, db: AsyncSession, protocolo_id: int
    ) -> list[ItemProtocolo]:
        itens = await db.scalars(
            select(ItemProtocolo)
            .where(ItemProtocolo.protocolo_id == protocolo_id)
            .order_by(ItemProtocolo.ordem, ItemProtocolo.id)
        )
        return list(itens.all())

    async def listar_itens_obrigatorios_pendentes(
        self, db: AsyncSession, protocolo_id: int, progresso_marco_id: int
    ) -> list[ItemProtocolo]:
        itens = await db.scalars(
            select(ItemProtocolo)
            .where(
                ItemProtocolo.protocolo_id == protocolo_id,
                ItemProtocolo.obrigatorio.is_(True),
                ~exists(
                    select(Evidencia.id).where(
                        Evidencia.item_protocolo_id == ItemProtocolo.id,
                        Evidencia.progresso_marco_id == progresso_marco_id,
                    )
                ),
            )
            .order_by(ItemProtocolo.ordem, ItemProtocolo.id)
        )
        return list(itens.all())

    async def buscar_item_protocolo(
        self, db: AsyncSession, protocolo_id: int, item_id: int
    ) -> ItemProtocolo | None:
        return await db.scalar(
            select(ItemProtocolo).where(
                ItemProtocolo.id == item_id,
                ItemProtocolo.protocolo_id == protocolo_id,
            )
        )

    async def buscar_item_por_id(
        self, db: AsyncSession, item_id: int
    ) -> ItemProtocolo | None:
        return await db.get(ItemProtocolo, item_id)

    async def atualizar_item_protocolo(
        self, db: AsyncSession, item: ItemProtocolo, dados: ItemProtocolo_Atualizar_Schema
    ) -> ItemProtocolo:
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(item, campo, valor)
        await db.flush()
        await db.refresh(item)
        return item

    async def remover_item_protocolo(self, db: AsyncSession, item: ItemProtocolo) -> None:
        await db.delete(item)
        await db.flush()


class ArquivosEvidenciaRepo:
    """Persistência dos metadados dos arquivos enviados."""

    async def buscar_por_url_no_empreendimento(
        self, db: AsyncSession, empreendimento_id: int, url: str
    ) -> ArquivoEvidencia | None:
        return await db.scalar(
            select(ArquivoEvidencia).where(
                ArquivoEvidencia.empreendimento_id == empreendimento_id,
                ArquivoEvidencia.url == url,
            )
        )

    async def criar(
        self,
        db: AsyncSession,
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
        registro = ArquivoEvidencia(
            empreendimento_id=empreendimento_id,
            usuario_id=usuario_id,
            nome_original=nome_original,
            nome_armazenado=nome_armazenado,
            caminho=caminho,
            url=url,
            tipo_mime=tipo_mime,
            tamanho=tamanho,
        )
        db.add(registro)
        await db.flush()
        await db.refresh(registro)
        return registro


class EvidenciasRepo:
    """Persistencia e consultas da evidencia junto aos seus metadados."""

    async def buscar_progresso(
        self, db: AsyncSession, local_obra_id: int, marco_id: int
    ) -> ProgressoMarco | None:
        return await db.scalar(
            select(ProgressoMarco).where(
                ProgressoMarco.local_obra_id == local_obra_id,
                ProgressoMarco.marco_id == marco_id,
            )
        )

    async def iniciar_progresso(
        self, db: AsyncSession, local_obra_id: int, marco_id: int
    ) -> ProgressoMarco:
        agora = datetime.now(UTC)
        progresso = ProgressoMarco(
            local_obra_id=local_obra_id,
            marco_id=marco_id,
            status=ProgressStatus.EM_ANDAMENTO,
            iniciado_em=agora,
        )
        db.add(progresso)
        await db.flush()
        await db.refresh(progresso)
        return progresso

    async def buscar_local(
        self, db: AsyncSession, local_obra_id: int
    ) -> LocalObra | None:
        return await db.get(LocalObra, local_obra_id)

    async def criar(
        self,
        db: AsyncSession,
        *,
        progresso_marco_id: int,
        local: LocalObra,
        marco: Marco,
        local_obra_id: int,
        marco_id: int,
        item_protocolo_id: int | None,
        arquivo: ArquivoEvidencia,
        descricao_tecnica: str | None,
        capturado_por: int,
        capturado_em: datetime,
    ) -> Evidencia:
        evidencia = Evidencia(
            progresso_marco_id=progresso_marco_id,
            local_obra=local,
            local_obra_id=local_obra_id,
            marco=marco,
            marco_id=marco_id,
            item_protocolo_id=item_protocolo_id,
            arquivo_evidencia_id=arquivo.id,
            arquivo_url=arquivo.url,
            descricao_tecnica=descricao_tecnica,
            capturado_por=capturado_por,
            capturado_em=capturado_em,
        )
        db.add(evidencia)
        await db.flush()
        await db.refresh(evidencia)
        return evidencia

    async def buscar(
        self, db: AsyncSession, evidencia_id: int, empreendimento_id: int
    ) -> Evidencia | None:
        return await db.scalar(
            select(Evidencia)
            .join(LocalObra, LocalObra.id == Evidencia.local_obra_id)
            .options(joinedload(Evidencia.local_obra))
            .options(joinedload(Evidencia.marco))
            .where(
                Evidencia.id == evidencia_id,
                LocalObra.empreendimento_id == empreendimento_id,
            )
        )

    async def listar(
        self,
        db: AsyncSession,
        empreendimento_id: int,
        *,
        local_obra_id: int | None = None,
        marco_id: int | None = None,
    ) -> list[Evidencia]:
        consulta = (
            select(Evidencia)
            .join(LocalObra, LocalObra.id == Evidencia.local_obra_id)
            .options(joinedload(Evidencia.local_obra))
            .options(joinedload(Evidencia.marco))
            .where(LocalObra.empreendimento_id == empreendimento_id)
        )
        if local_obra_id is not None:
            consulta = consulta.where(Evidencia.local_obra_id == local_obra_id)
        if marco_id is not None:
            consulta = consulta.where(Evidencia.marco_id == marco_id)
        resultado = await db.scalars(
            consulta.order_by(Evidencia.capturado_em.desc(), Evidencia.id.desc())
        )
        return list(resultado.all())
