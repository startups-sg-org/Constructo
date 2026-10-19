"""Adiciona a massa de dados Parque das Águas ao PostgreSQL local.

As imagens de evidência devem estar em ``apps/web/docs`` (ou no diretório
informado por ``--imagens-dir``). Durante a carga, elas são copiadas para o
storage público do backend e as evidências recebem URLs locais ``/uploads/...``.

Execute a partir de ``apps/backend``:
    uv run python scripts/popular_dados_demo.py
"""

import argparse
import asyncio
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path

from sqlalchemy import func, select

from backend.banco_de_dados.connections.database_postgres import postgres
from backend.banco_de_dados.registro_modelos import registrar_modelos
from backend.modulos.dominio.modelos import (
    Empreendimento,
    Etapa,
    Evidencia,
    LocalObra,
    Marco,
    ProgressoMarco,
    Publicacao,
    PublicacaoEvidencia,
    Taxonomia,
    UsuarioEmpreendimento,
    UsuarioUnidade,
)
from backend.modulos.dominio.regras import TipoLocal
from backend.modulos.evidencias.storage import obter_storage
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.senhas import gerar_senha_hash

EMAIL_MARCADOR = "demo.admin@example.com"
SENHA_PADRAO = "Demo@123"
EMPREENDIMENTO_DESTAQUE = "Parque das Águas"
EMAILS_AUTORES = ("demo.gestor1@example.com", "demo.gestor2@example.com")
EXTENSOES_IMAGEM = {".jpeg", ".jpg", ".png", ".webp"}
RAIZ_REPOSITORIO = Path(__file__).resolve().parents[3]
DIRETORIO_IMAGENS_PADRAO = RAIZ_REPOSITORIO / "apps" / "web" / "docs"


@dataclass(frozen=True)
class ConfiguracaoEstrutura:
    tipo_raiz: TipoLocal
    prefixo_raiz: str
    raizes: int
    pavimentos: int
    unidades: int


EMPREENDIMENTOS = (
    {
        "nome": EMPREENDIMENTO_DESTAQUE,
        "descricao": "Conjunto habitacional planejado com dois blocos residenciais.",
        "endereco": "Rua das Acácias, 450 — Araguaína/TO",
        "status": "PLANEJADO",
        "estrutura": ConfiguracaoEstrutura(TipoLocal.BLOCO, "Bloco", 2, 3, 2),
    },
)

USUARIOS = (
    {
        "cpf": "52998224725",
        "nome": "Marina",
        "sobrenome": "Albuquerque",
        "email": EMAIL_MARCADOR,
        "telefone": "63991234567",
        "canal_preferido": "email",
        "receber_atualizacoes": True,
        "empreendimento": "Todos os empreendimentos",
        "unidade": "Administração",
        "ativo": True,
        "papel": "ADMIN",
    },
    {
        "cpf": "16899535009",
        "nome": "Rafael",
        "sobrenome": "Nogueira",
        "email": "demo.gestor1@example.com",
        "telefone": "63992345678",
        "canal_preferido": "whatsapp",
        "receber_atualizacoes": True,
        "empreendimento": EMPREENDIMENTO_DESTAQUE,
        "unidade": "Gestão",
        "ativo": True,
        "papel": "GESTOR",
    },
    {
        "cpf": "11144477735",
        "nome": "Camila",
        "sobrenome": "Ferreira",
        "email": "demo.gestor2@example.com",
        "telefone": "63993456789",
        "canal_preferido": "email",
        "receber_atualizacoes": True,
        "empreendimento": EMPREENDIMENTO_DESTAQUE,
        "unidade": "Gestão",
        "ativo": True,
        "papel": "GESTOR",
    },
    {
        "cpf": "98765432100",
        "nome": "Beatriz",
        "sobrenome": "Lima",
        "email": "demo.comprador2@example.com",
        "telefone": "63995678901",
        "canal_preferido": "email",
        "receber_atualizacoes": True,
        "empreendimento": EMPREENDIMENTO_DESTAQUE,
        "unidade": "202",
        "ativo": True,
        "papel": "COMPRADOR",
    },
)


def listar_imagens(diretorio: Path) -> list[Path]:
    diretorio = diretorio.expanduser().resolve()
    if not diretorio.is_dir():
        raise FileNotFoundError(f"Diretório de imagens não encontrado: {diretorio}")

    imagens = sorted(
        (
            caminho
            for caminho in diretorio.rglob("*")
            if caminho.is_file() and caminho.suffix.lower() in EXTENSOES_IMAGEM
        ),
        key=lambda caminho: caminho.as_posix(),
    )
    if not imagens:
        extensoes = ", ".join(sorted(EXTENSOES_IMAGEM))
        raise FileNotFoundError(
            f"Nenhuma imagem ({extensoes}) encontrada em {diretorio}"
        )
    return imagens


async def criar_estrutura(
    session,
    empreendimento: Empreendimento,
    configuracao: ConfiguracaoEstrutura,
) -> list[LocalObra]:
    unidades: list[LocalObra] = []
    for indice_raiz in range(1, configuracao.raizes + 1):
        raiz = LocalObra(
            empreendimento_id=empreendimento.id,
            nome=f"{configuracao.prefixo_raiz} {chr(64 + indice_raiz)}",
            tipo=configuracao.tipo_raiz,
            ordem=indice_raiz,
        )
        session.add(raiz)
        await session.flush()

        for indice_pavimento in range(1, configuracao.pavimentos + 1):
            pavimento = LocalObra(
                empreendimento_id=empreendimento.id,
                parent_id=raiz.id,
                nome=f"{indice_pavimento}º Pavimento",
                tipo=TipoLocal.PAVIMENTO,
                ordem=indice_pavimento,
            )
            session.add(pavimento)
            await session.flush()

            for indice_unidade in range(1, configuracao.unidades + 1):
                numero = indice_pavimento * 100 + indice_unidade
                unidade = LocalObra(
                    empreendimento_id=empreendimento.id,
                    parent_id=pavimento.id,
                    nome=f"Unidade {numero}",
                    tipo=TipoLocal.UNIDADE,
                    ordem=indice_unidade,
                )
                session.add(unidade)
                unidades.append(unidade)
    await session.flush()
    return unidades


async def criar_taxonomia(session, empreendimento: Empreendimento) -> list[Marco]:
    taxonomia = Taxonomia(
        empreendimento_id=empreendimento.id,
        nome="Etapas padrão da obra",
        descricao="Taxonomia fictícia para demonstração do acompanhamento físico.",
    )
    session.add(taxonomia)
    await session.flush()

    definicoes = (
        ("Fundação", "Execução das fundações e infraestrutura.", "Preparação da base da obra."),
        ("Estrutura", "Execução de pilares, vigas e lajes.", "Construção da estrutura do edifício."),
        ("Instalações", "Redes elétricas, hidráulicas e de dados.", "Instalação dos sistemas do imóvel."),
        ("Acabamentos", "Revestimentos, pintura e louças.", "Finalização dos ambientes."),
    )
    marcos: list[Marco] = []
    for ordem, (nome, tecnica, cliente) in enumerate(definicoes, start=1):
        etapa = Etapa(
            taxonomia_id=taxonomia.id,
            nome=nome,
            descricao_tecnica=tecnica,
            descricao_cliente=cliente,
            ordem=ordem,
        )
        session.add(etapa)
        await session.flush()
        for ordem_marco, sufixo in enumerate(("iniciada", "concluída"), start=1):
            marco = Marco(
                etapa_id=etapa.id,
                nome=f"{nome} {sufixo}",
                descricao_tecnica=f"Marco de controle: {nome.lower()} {sufixo}.",
                descricao_cliente=f"{nome} {sufixo} conforme o planejamento.",
                ordem=ordem_marco,
            )
            session.add(marco)
            marcos.append(marco)
    await session.flush()
    return marcos


async def copiar_imagem_para_storage(
    imagem: Path,
    empreendimento_id: int,
    indice: int,
) -> str:
    conteudo = await asyncio.to_thread(imagem.read_bytes)
    caminho = (
        f"empreendimentos/{empreendimento_id}/evidencias/"
        f"parque-das-aguas-{indice:02d}{imagem.suffix.lower()}"
    )
    arquivo = await obter_storage().salvar(caminho, conteudo)
    return arquivo.url


async def criar_evidencias_e_publicacoes(
    session,
    progressos: list[ProgressoMarco],
    usuarios: list[Usuario],
    imagens: list[Path],
    empreendimento_id: int,
    agora: datetime,
) -> tuple[int, int]:
    """Completa evidências e publicações, sem URLs externas ou duplicações."""
    evidencias_criadas = 0
    publicacoes_criadas = 0

    for indice, progresso in enumerate(progressos[:10], start=1):
        evidencia = await session.scalar(
            select(Evidencia).where(Evidencia.progresso_marco_id == progresso.id)
        )
        imagem = imagens[(indice - 1) % len(imagens)]
        arquivo_url = await copiar_imagem_para_storage(
            imagem,
            empreendimento_id,
            indice,
        )

        if evidencia is None:
            evidencia = Evidencia(
                progresso_marco_id=progresso.id,
                local_obra_id=progresso.local_obra_id,
                marco_id=progresso.marco_id,
                arquivo_url=arquivo_url,
                descricao_tecnica=(
                    f"Registro fotográfico técnico {indice} do avanço da obra "
                    "Parque das Águas."
                ),
                capturado_em=agora - timedelta(days=indice),
                capturado_por=usuarios[(indice - 1) % len(usuarios)].id,
            )
            session.add(evidencia)
            await session.flush()
            evidencias_criadas += 1
        elif evidencia.arquivo_url.startswith("https://images.example.com/"):
            evidencia.arquivo_url = arquivo_url

        if indice > 6:
            continue

        publicacao = await session.scalar(
            select(Publicacao).where(Publicacao.progresso_marco_id == progresso.id)
        )
        if publicacao is None:
            publicacao = Publicacao(
                progresso_marco_id=progresso.id,
                titulo=f"Atualização do Parque das Águas #{indice}",
                texto_cliente="Os serviços avançaram conforme o cronograma demonstrativo.",
                proximo_passo="Dar continuidade à próxima frente de serviço.",
                publicado_em=agora - timedelta(days=indice),
                publicado_por=usuarios[(indice - 1) % len(usuarios)].id,
            )
            session.add(publicacao)
            await session.flush()
            session.add(
                PublicacaoEvidencia(publicacao_id=publicacao.id, evidencia_id=evidencia.id)
            )
            publicacoes_criadas += 1

    return evidencias_criadas, publicacoes_criadas


async def completar_empreendimento_destaque(
    session,
    imagens: list[Path],
) -> tuple[int, int]:
    empreendimento_id = await session.scalar(
        select(Empreendimento.id).where(Empreendimento.nome == EMPREENDIMENTO_DESTAQUE)
    )
    if empreendimento_id is None:
        return 0, 0

    progressos = list(
        (
            await session.scalars(
                select(ProgressoMarco)
                .join(LocalObra, LocalObra.id == ProgressoMarco.local_obra_id)
                .where(
                    LocalObra.empreendimento_id == empreendimento_id,
                    ProgressoMarco.status != "NAO_INICIADO",
                )
                .order_by(ProgressoMarco.id)
                .limit(10)
            )
        ).all()
    )
    usuarios = list(
        (
            await session.scalars(
                select(Usuario).where(Usuario.email.in_(EMAILS_AUTORES)).order_by(Usuario.id)
            )
        ).all()
    )
    if not progressos or not usuarios:
        return 0, 0

    return await criar_evidencias_e_publicacoes(
        session,
        progressos,
        usuarios,
        imagens,
        empreendimento_id,
        datetime.now(UTC),
    )


async def popular(senha: str, diretorio_imagens: Path) -> None:
    imagens = listar_imagens(diretorio_imagens)
    registrar_modelos()
    async with postgres.get_session() as session:
        marcador = await session.scalar(select(Usuario.id).where(Usuario.email == EMAIL_MARCADOR))
        if marcador is not None:
            evidencias, publicacoes = await completar_empreendimento_destaque(session, imagens)
            await session.commit()
            if evidencias or publicacoes:
                print(
                    f"Dados de {EMPREENDIMENTO_DESTAQUE} completados: "
                    f"{evidencias} evidências e {publicacoes} publicações."
                )
            else:
                print("A massa demo já está instalada; nenhum registro foi duplicado.")
            await exibir_resumo(session)
            return

        senha_hash = gerar_senha_hash(senha)
        usuarios = [Usuario(**dados, senha=senha_hash) for dados in USUARIOS]
        session.add_all(usuarios)
        await session.flush()

        empreendimentos: list[Empreendimento] = []
        unidades_por_empreendimento: list[list[LocalObra]] = []
        marcos_por_empreendimento: list[list[Marco]] = []
        for dados in EMPREENDIMENTOS:
            configuracao = dados["estrutura"]
            empreendimento = Empreendimento(
                nome=dados["nome"],
                descricao=dados["descricao"],
                endereco=dados["endereco"],
                status=dados["status"],
            )
            session.add(empreendimento)
            await session.flush()
            empreendimentos.append(empreendimento)
            unidades_por_empreendimento.append(
                await criar_estrutura(session, empreendimento, configuracao)
            )
            marcos_por_empreendimento.append(await criar_taxonomia(session, empreendimento))

        agora = datetime.now(UTC)
        progressos_publicaveis: list[ProgressoMarco] = []
        for indice_obra, (unidades, marcos) in enumerate(
            zip(unidades_por_empreendimento, marcos_por_empreendimento, strict=True)
        ):
            for indice_unidade, unidade in enumerate(unidades[:4]):
                for indice_marco, marco in enumerate(marcos[:4]):
                    variacao = (indice_obra + indice_unidade + indice_marco) % 3
                    if variacao == 0:
                        status = "CONCLUIDO"
                        iniciado_em = agora - timedelta(days=40 + indice_marco)
                        concluido_em = agora - timedelta(days=10 + indice_unidade)
                    elif variacao == 1:
                        status = "EM_ANDAMENTO"
                        iniciado_em = agora - timedelta(days=12 + indice_marco)
                        concluido_em = None
                    else:
                        status = "NAO_INICIADO"
                        iniciado_em = None
                        concluido_em = None
                    progresso = ProgressoMarco(
                        local_obra_id=unidade.id,
                        marco_id=marco.id,
                        status=status,
                        iniciado_em=iniciado_em,
                        concluido_em=concluido_em,
                    )
                    session.add(progresso)
                    if status != "NAO_INICIADO" and len(progressos_publicaveis) < 10:
                        progressos_publicaveis.append(progresso)
        await session.flush()

        await criar_evidencias_e_publicacoes(
            session,
            progressos_publicaveis,
            [usuarios[1], usuarios[2]],
            imagens,
            empreendimentos[0].id,
            agora,
        )

        for usuario in usuarios[:3]:
            for empreendimento in empreendimentos:
                session.add(
                    UsuarioEmpreendimento(
                        usuario_id=usuario.id,
                        empreendimento_id=empreendimento.id,
                    )
                )
        empreendimento = empreendimentos[0]
        for usuario in usuarios[3:]:
            session.add(
                UsuarioEmpreendimento(
                    usuario_id=usuario.id,
                    empreendimento_id=empreendimento.id,
                )
            )
            unidade = next(
                (
                    local
                    for local in unidades_por_empreendimento[0]
                    if local.nome == f"Unidade {usuario.unidade}"
                ),
                None,
            )
            if unidade is not None:
                session.add(UsuarioUnidade(usuario_id=usuario.id, local_obra_id=unidade.id))

        await session.commit()
        print("Massa demo inserida com sucesso.")
        print(f"Login administrador: {EMAIL_MARCADOR}")
        print(f"Senha compartilhada pelos usuários demo: {senha}")
        await exibir_resumo(session)


async def exibir_resumo(session) -> None:
    modelos = (
        ("usuários", Usuario),
        ("empreendimentos", Empreendimento),
        ("locais", LocalObra),
        ("taxonomias", Taxonomia),
        ("etapas", Etapa),
        ("marcos", Marco),
        ("progressos", ProgressoMarco),
        ("evidências", Evidencia),
        ("publicações", Publicacao),
    )
    totais = [
        f"{rotulo}: {await session.scalar(select(func.count()).select_from(modelo))}"
        for rotulo, modelo in modelos
    ]
    print("Totais no banco — " + " | ".join(totais))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Insere os dados fictícios da obra Parque das Águas no banco local."
    )
    parser.add_argument(
        "--senha",
        default=SENHA_PADRAO,
        help="Senha compartilhada pelos usuários demo (padrão: Demo@123).",
    )
    parser.add_argument(
        "--imagens-dir",
        type=Path,
        default=DIRETORIO_IMAGENS_PADRAO,
        help=(
            "Diretório com imagens JPEG, PNG ou WEBP "
            f"(padrão: {DIRETORIO_IMAGENS_PADRAO})."
        ),
    )
    argumentos = parser.parse_args()
    asyncio.run(popular(argumentos.senha, argumentos.imagens_dir))


if __name__ == "__main__":
    main()
