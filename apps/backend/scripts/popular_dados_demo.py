"""Adiciona uma massa de dados fictícios ao PostgreSQL local.

A carga é atômica, preserva os registros existentes e pode ser executada mais
de uma vez: a presença do usuário marcador impede duplicações.
"""

import argparse
import asyncio
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select

from backend.banco_de_dados.connections.database_postgres import postgres
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
from backend.modulos.usuarios.modelos import Usuario
from backend.modulos.usuarios.senhas import gerar_senha_hash

EMAIL_MARCADOR = "demo.admin@example.com"
SENHA_PADRAO = "Demo@123"


@dataclass(frozen=True)
class ConfiguracaoEstrutura:
    tipo_raiz: TipoLocal
    prefixo_raiz: str
    raizes: int
    pavimentos: int
    unidades: int


EMPREENDIMENTOS = (
    {
        "nome": "Residencial Jardim do Sol",
        "descricao": "Condomínio residencial com duas torres e área de lazer integrada.",
        "endereco": "Av. das Palmeiras, 1200 — Plano Diretor Sul, Palmas/TO",
        "status": "EM_ANDAMENTO",
        "estrutura": ConfiguracaoEstrutura(TipoLocal.TORRE, "Torre", 2, 2, 3),
    },
    {
        "nome": "Parque das Águas",
        "descricao": "Conjunto habitacional planejado com dois blocos residenciais.",
        "endereco": "Rua das Acácias, 450 — Araguaína/TO",
        "status": "PLANEJADO",
        "estrutura": ConfiguracaoEstrutura(TipoLocal.BLOCO, "Bloco", 2, 3, 2),
    },
    {
        "nome": "Horizonte Corporate",
        "descricao": "Edifício corporativo com lajes comerciais flexíveis.",
        "endereco": "Av. JK, 880 — Centro, Palmas/TO",
        "status": "EM_ANDAMENTO",
        "estrutura": ConfiguracaoEstrutura(TipoLocal.BLOCO, "Edifício", 1, 4, 4),
    },
    {
        "nome": "Vila Cerrado",
        "descricao": "Empreendimento residencial entregue e em fase de acompanhamento.",
        "endereco": "Alameda dos Ipês, 75 — Gurupi/TO",
        "status": "CONCLUIDO",
        "estrutura": ConfiguracaoEstrutura(TipoLocal.BLOCO, "Bloco", 1, 2, 4),
    },
    {
        "nome": "Estação Norte",
        "descricao": "Projeto temporariamente inativo para revisão de viabilidade.",
        "endereco": "Rodovia TO-222, km 12 — Araguaína/TO",
        "status": "INATIVO",
        "estrutura": ConfiguracaoEstrutura(TipoLocal.TORRE, "Torre", 1, 0, 0),
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
        "empreendimento": "Residencial Jardim do Sol",
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
        "empreendimento": "Horizonte Corporate",
        "unidade": "Gestão",
        "ativo": True,
        "papel": "GESTOR",
    },
    {
        "cpf": "12345678909",
        "nome": "João",
        "sobrenome": "Martins",
        "email": "demo.comprador1@example.com",
        "telefone": "63994567890",
        "canal_preferido": "whatsapp",
        "receber_atualizacoes": True,
        "empreendimento": "Residencial Jardim do Sol",
        "unidade": "101",
        "ativo": True,
        "papel": "COMPRADOR",
    },
    {
        "cpf": "98765432100",
        "nome": "Beatriz",
        "sobrenome": "Lima",
        "email": "demo.comprador2@example.com",
        "telefone": "63995678901",
        "canal_preferido": "email",
        "receber_atualizacoes": True,
        "empreendimento": "Parque das Águas",
        "unidade": "202",
        "ativo": True,
        "papel": "COMPRADOR",
    },
    {
        "cpf": "39053344705",
        "nome": "Lucas",
        "sobrenome": "Mendes",
        "email": "demo.comprador3@example.com",
        "telefone": "63996789012",
        "canal_preferido": "whatsapp",
        "receber_atualizacoes": False,
        "empreendimento": "Horizonte Corporate",
        "unidade": "301",
        "ativo": True,
        "papel": "COMPRADOR",
    },
    {
        "cpf": "86288366757",
        "nome": "Ana",
        "sobrenome": "Carvalho",
        "email": "demo.comprador4@example.com",
        "telefone": "63997890123",
        "canal_preferido": "email",
        "receber_atualizacoes": True,
        "empreendimento": "Vila Cerrado",
        "unidade": "102",
        "ativo": True,
        "papel": "COMPRADOR",
    },
    {
        "cpf": "15350946056",
        "nome": "Pedro",
        "sobrenome": "Araújo",
        "email": "demo.inativo@example.com",
        "telefone": "63998901234",
        "canal_preferido": "email",
        "receber_atualizacoes": False,
        "empreendimento": "Estação Norte",
        "unidade": "—",
        "ativo": False,
        "papel": "COMPRADOR",
    },
)


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
        (
            "Estrutura",
            "Execução de pilares, vigas e lajes.",
            "Construção da estrutura do edifício.",
        ),
        (
            "Instalações",
            "Redes elétricas, hidráulicas e de dados.",
            "Instalação dos sistemas do imóvel.",
        ),
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


async def popular(senha: str) -> None:
    async with postgres.get_session() as session:
        marcador = await session.scalar(select(Usuario.id).where(Usuario.email == EMAIL_MARCADOR))
        if marcador is not None:
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
        evidencias: list[Evidencia] = []
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

        for indice, progresso in enumerate(progressos_publicaveis, start=1):
            evidencia = Evidencia(
                progresso_marco_id=progresso.id,
                arquivo_url=f"https://images.example.com/constructo/demo-{indice:02d}.jpg",
                descricao=f"Registro fotográfico fictício #{indice}.",
                capturado_em=agora - timedelta(days=indice),
                usuario_id=usuarios[1 + (indice % 2)].id,
            )
            session.add(evidencia)
            evidencias.append(evidencia)
        await session.flush()

        for indice, (progresso, evidencia) in enumerate(
            zip(progressos_publicaveis[:6], evidencias[:6], strict=True),
            start=1,
        ):
            publicacao = Publicacao(
                progresso_marco_id=progresso.id,
                titulo=f"Atualização da obra #{indice}",
                texto_cliente="Os serviços avançaram conforme o cronograma demonstrativo.",
                proximo_passo="Dar continuidade à próxima frente de serviço.",
                publicado_em=agora - timedelta(days=indice),
                publicado_por=usuarios[1 + (indice % 2)].id,
            )
            session.add(publicacao)
            await session.flush()
            session.add(PublicacaoEvidencia(publicacao_id=publicacao.id, evidencia_id=evidencia.id))

        for usuario in usuarios[:3]:
            for empreendimento in empreendimentos:
                session.add(
                    UsuarioEmpreendimento(
                        usuario_id=usuario.id,
                        empreendimento_id=empreendimento.id,
                    )
                )
        for indice, usuario in enumerate(usuarios[3:7]):
            empreendimento = empreendimentos[indice]
            session.add(
                UsuarioEmpreendimento(
                    usuario_id=usuario.id,
                    empreendimento_id=empreendimento.id,
                )
            )
            if unidades_por_empreendimento[indice]:
                session.add(
                    UsuarioUnidade(
                        usuario_id=usuario.id,
                        local_obra_id=unidades_por_empreendimento[indice][0].id,
                    )
                )

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
    parser = argparse.ArgumentParser(description="Insere dados fictícios no banco local.")
    parser.add_argument(
        "--senha",
        default=SENHA_PADRAO,
        help="Senha compartilhada pelos usuários demo (padrão: Demo@123).",
    )
    argumentos = parser.parse_args()
    asyncio.run(popular(argumentos.senha))


if __name__ == "__main__":
    main()
