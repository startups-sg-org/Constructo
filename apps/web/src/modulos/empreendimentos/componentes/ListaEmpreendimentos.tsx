import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import type { Empreendimento } from "@constructo/shared";

import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";
import { carregarEmpreendimentos } from "../../../features/empreendimentos/empreendimentos.loader";
import { cn } from "../../../utils/classes";
import { formatarDataEmpreendimento, obterClassesStatus, obterRotuloStatus } from "./empreendimentoFormatters";

type Ordenacao = "atualizado-desc" | "atualizado-asc" | "nome-asc" | "nome-desc";

const classesPontoStatus: Record<Empreendimento["status"], string> = {
    PLANEJADO: "bg-accent",
    EM_ANDAMENTO: "bg-[#e3b341]",
    CONCLUIDO: "bg-success-700",
    INATIVO: "bg-[#8b949e]",
};

const estilos = {
    raiz: "lista-empreendimentos mx-auto grid w-full gap-5 text-foreground",
    contexto: "flex w-full flex-wrap items-center justify-between gap-3",
    caminho: "flex items-center gap-2 font-code-sm text-[13px] leading-5",
    sincronizacao: "rounded-sm border border-border-control bg-surface-muted px-2 py-0.5 text-foreground-muted",
    indicadores: "flex flex-wrap items-center gap-x-5 gap-y-2",
    indicador: "flex items-center gap-2 text-[13px] leading-5 text-foreground-muted",
    cabecalho: "flex w-full items-end justify-between gap-6 border-b border-border-muted pb-5 max-md:flex-col max-md:items-start",
    titulo: "font-headline-xl text-[36px] font-semibold leading-[44px] tracking-[-0.02em] text-foreground-strong max-md:text-[28px] max-md:leading-9",
    subtitulo: "text-[16px] leading-6 text-foreground-muted",
    acoes: "flex items-center gap-3 max-md:w-full",
    acaoSecundaria: "ds-focus-ring-offset flex h-10 items-center gap-2 rounded-md border border-border-control bg-surface-hover px-4 text-[14px] font-medium text-foreground transition-colors hover:bg-surface-muted",
    acaoPrimaria: "ds-focus-ring-offset flex h-10 items-center gap-2 rounded-md bg-[#1f6feb] px-4 text-[14px] font-medium text-white no-underline transition-colors hover:bg-[#388bfd] max-md:flex-1 max-md:justify-center",
    filtros: "flex w-full items-center gap-3 max-md:flex-wrap",
    busca: "flex h-10 min-w-72 flex-1 items-center gap-3 rounded-md border border-border-control bg-canvas px-4 focus-within:border-accent",
    campoBusca: "!min-h-0 !w-full !border-0 !bg-transparent !p-0 !text-[15px] !leading-6 !text-foreground !shadow-none !outline-none placeholder:!text-foreground-muted",
    seletor: "relative flex h-10 items-center gap-2.5 rounded-md border border-border-control bg-surface-hover pl-4 text-foreground",
    campoSeletor: "!min-h-0 !w-auto appearance-none !border-0 !bg-transparent !py-0 !pl-0 !pr-10 !text-[14px] !leading-5 !text-foreground !shadow-none !outline-none",
    chevron: "pointer-events-none absolute right-3 text-sm text-foreground-muted",
    visualizacao: "flex h-10 items-center rounded-md border border-border-control bg-canvas",
    visualizacaoAtiva: "grid h-full w-10 place-items-center rounded-l-md bg-surface-hover text-foreground",
    visualizacaoInativa: "grid h-full w-10 place-items-center border-l border-border-control text-foreground-muted",
    resumo: "flex w-full flex-wrap items-center justify-between gap-3",
    resumoPrincipal: "flex flex-wrap items-center gap-3 text-[14px] leading-5 text-foreground-muted",
    filtroAtivo: "ds-focus-ring flex items-center gap-2 rounded-sm border border-border-control bg-surface-muted px-2 py-1 font-code-sm text-[13px] text-foreground",
    demonstracao: "flex items-center gap-1 text-label-sm font-label-sm",
    grade: "grid w-full min-w-0 items-start gap-6 2xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
    painel: "ds-panel w-full min-w-0 overflow-hidden",
    painelCabecalho: "flex w-full items-center justify-between border-b border-border-muted bg-surface-muted px-5 py-4",
    rotuloPainel: "text-[13px] font-medium uppercase leading-5 tracking-[0.08em] text-foreground-muted",
    tabela: "block w-full border-collapse",
    linha: "block border-b border-border-muted transition-colors hover:bg-surface-hover",
    linhaAtiva: "bg-surface-selected hover:bg-surface-selected",
    registro: "flex w-full cursor-pointer items-start gap-4 px-5 py-4",
    iconeRegistro: "ds-focus-ring grid h-8 w-8 flex-none place-items-center rounded-md border border-border-control bg-surface-muted text-[16px] text-foreground-muted",
    dadosRegistro: "flex min-w-0 flex-1 flex-col items-start gap-1.5",
    tituloRegistro: "ds-focus-ring-offset truncate text-[17px] font-semibold leading-6 text-foreground-strong no-underline hover:text-accent hover:underline",
    etiquetaAtivo: "rounded-sm border border-border-control bg-surface-muted px-1.5 py-0.5 font-code-sm text-[12px] leading-4 text-foreground",
    metadados: "flex w-full min-w-0 flex-wrap items-center gap-2.5 text-[13px] leading-5 text-foreground-muted",
    abrir: "ds-focus-ring grid h-8 w-8 flex-none place-items-center rounded-md text-[15px] text-foreground-muted hover:bg-surface-muted hover:text-accent",
    rodapeLista: "flex w-full items-center justify-between gap-3 px-5 py-4 text-[13px] leading-5 text-foreground-muted",
    previaCabecalho: "flex w-full items-center justify-between gap-4 border-b border-border-muted bg-surface-muted px-5 py-4",
    previaConteudo: "grid w-full gap-5 px-5 py-5",
    previaIdentidade: "flex w-full items-start gap-4 border-b border-border-muted pb-5",
    previaIcone: "grid h-12 w-12 flex-none place-items-center rounded-md border border-border-control bg-surface-muted text-2xl text-foreground",
    secaoPrevia: "grid gap-3 border-b border-border-muted pb-5 last:border-b-0 last:pb-0",
    acoesRapidas: "grid grid-cols-1 gap-3 min-[1800px]:grid-cols-2",
    acaoRapida: "ds-surface-card ds-focus-ring-offset flex items-center gap-2.5 px-4 py-3 text-[14px] font-medium text-foreground no-underline transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60",
    diretriz: "ds-surface-card flex items-start gap-4 px-4 py-4",
} as const;

export default function ListaEmpreendimentos() {
    const empreendimentos = useLoaderData<typeof carregarEmpreendimentos>();
    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState<Empreendimento["status"] | "TODOS">("TODOS");
    const [ordenacao, setOrdenacao] = useState<Ordenacao>("atualizado-desc");
    const [selecionadoId, setSelecionadoId] = useState<number | null>(null);

    const empreendimentosVisiveis = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        const filtrados = empreendimentos.filter((empreendimento) => {
            const correspondeStatus = status === "TODOS" || empreendimento.status === status;
            const texto = [empreendimento.nome, empreendimento.descricao, empreendimento.endereco]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("pt-BR");
            return correspondeStatus && (!termo || texto.includes(termo));
        });
        return [...filtrados].sort((a, b) => compararEmpreendimentos(a, b, ordenacao));
    }, [busca, empreendimentos, ordenacao, status]);

    const totais = useMemo(() => ({
        PLANEJADO: empreendimentos.filter((item) => item.status === "PLANEJADO").length,
        EM_ANDAMENTO: empreendimentos.filter((item) => item.status === "EM_ANDAMENTO").length,
        CONCLUIDO: empreendimentos.filter((item) => item.status === "CONCLUIDO").length,
        INATIVO: empreendimentos.filter((item) => item.status === "INATIVO").length,
    }), [empreendimentos]);

    const selecionado = empreendimentosVisiveis.find((item) => item.id === selecionadoId)
        ?? empreendimentosVisiveis[0]
        ?? null;
    const filtrosAtivos = Boolean(busca.trim()) || status !== "TODOS";

    function limparFiltros() {
        setBusca("");
        setStatus("TODOS");
    }

    return (
        <section className={estilos.raiz} aria-labelledby="lista-empreendimentos-titulo">
            <div className={estilos.contexto}>
                <div className={estilos.caminho} aria-label="Localização atual">
                    <span className="text-foreground-muted">constructo /</span>
                    <span>empreendimentos</span>
                    <span className={estilos.sincronizacao}>live-sync</span>
                </div>
                <div className={estilos.indicadores} aria-label="Resumo por status">
                    <IndicadorStatus status="CONCLUIDO" total={totais.CONCLUIDO} />
                    <IndicadorStatus status="EM_ANDAMENTO" total={totais.EM_ANDAMENTO} />
                    <IndicadorStatus status="PLANEJADO" total={totais.PLANEJADO} />
                    <IndicadorStatus status="INATIVO" total={totais.INATIVO} />
                </div>
            </div>

            <header className={estilos.cabecalho}>
                <div className="grid gap-1">
                    <h1 className={estilos.titulo} id="lista-empreendimentos-titulo">Empreendimentos</h1>
                    <p className={estilos.subtitulo}>Gerencie suas obras em um só lugar com precisão operacional.</p>
                </div>
                <div className={estilos.acoes}>
                    <button className={estilos.acaoSecundaria} type="button">
                        <i className="bi bi-download" aria-hidden="true" /> Exportar
                    </button>
                    <Link
                        className={estilos.acaoPrimaria}
                        to="/admin/empreendimentos/novo"
                        role="button"
                    >
                        <i className="bi bi-plus-lg" aria-hidden="true" /> Criar empreendimento
                    </Link>
                </div>
            </header>

            <div className={estilos.filtros}>
                <label className={estilos.busca} htmlFor="busca-empreendimento">
                    <i className="bi bi-search flex-none text-foreground-muted" aria-hidden="true" />
                    <span className="sr-only">Buscar empreendimento</span>
                    <input
                        className={estilos.campoBusca}
                        id="busca-empreendimento"
                        type="search"
                        value={busca}
                        placeholder="Buscar empreendimento..."
                        onChange={(evento) => setBusca(evento.target.value)}
                    />
                </label>

                <label className={estilos.seletor} htmlFor="filtro-status">
                    <i className="bi bi-funnel flex-none" aria-hidden="true" />
                    <span className="sr-only">Filtrar por status</span>
                    <select
                        className={estilos.campoSeletor}
                        id="filtro-status"
                        value={status}
                        onChange={(evento) => setStatus(evento.target.value as typeof status)}
                    >
                        <option value="TODOS">Status: todos</option>
                        <option value="PLANEJADO">Planejado</option>
                        <option value="EM_ANDAMENTO">Em andamento</option>
                        <option value="CONCLUIDO">Concluído</option>
                        <option value="INATIVO">Inativo</option>
                    </select>
                    <i className={cn("bi bi-chevron-down", estilos.chevron)} aria-hidden="true" />
                </label>

                <label className={estilos.seletor} htmlFor="ordenacao-empreendimentos">
                    <i className="bi bi-sort-down flex-none" aria-hidden="true" />
                    <span className="sr-only">Ordenar empreendimentos</span>
                    <select
                        className={estilos.campoSeletor}
                        id="ordenacao-empreendimentos"
                        value={ordenacao}
                        onChange={(evento) => setOrdenacao(evento.target.value as Ordenacao)}
                    >
                        <option value="atualizado-desc">Mais recentes</option>
                        <option value="atualizado-asc">Mais antigos</option>
                        <option value="nome-asc">Nome: A–Z</option>
                        <option value="nome-desc">Nome: Z–A</option>
                    </select>
                    <i className={cn("bi bi-chevron-down", estilos.chevron)} aria-hidden="true" />
                </label>

                <div className={estilos.visualizacao} aria-label="Visualização em lista ativa">
                    <span className={estilos.visualizacaoAtiva}><i className="bi bi-list-ul" aria-hidden="true" /></span>
                    <span className={estilos.visualizacaoInativa}><i className="bi bi-list" aria-hidden="true" /></span>
                </div>
            </div>

            <div className={estilos.resumo} aria-live="polite">
                <div className={estilos.resumoPrincipal}>
                    <span>{empreendimentosVisiveis.length} {empreendimentosVisiveis.length === 1 ? "empreendimento encontrado" : "empreendimentos encontrados"}</span>
                    {filtrosAtivos && (
                        <>
                            <span className="h-3 w-px bg-border-muted" aria-hidden="true" />
                            <button className={estilos.filtroAtivo} type="button" aria-label="Limpar filtros" onClick={limparFiltros}>
                                {status === "TODOS" ? "Busca ativa" : `Status: ${obterRotuloStatus(status)}`}
                                <i className="bi bi-x-lg" aria-hidden="true" />
                                <span className="sr-only">Limpar filtros</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={estilos.grade}>
                <section className={estilos.painel} aria-labelledby="painel-lista-titulo">
                    <div className={estilos.painelCabecalho}>
                        <h2 className={estilos.rotuloPainel} id="painel-lista-titulo">Lista de empreendimentos</h2>
                        <span className="font-code-sm text-[13px] leading-5 text-foreground-muted">{empreendimentosVisiveis.length} registros</span>
                    </div>

                    {empreendimentos.length === 0 ? (
                        <EstadoVazio className="lista-empreendimentos__vazia m-4" titulo="Nenhum empreendimento cadastrado" descricao="Use o botão acima ou o formulário abaixo para adicionar a primeira obra." />
                    ) : empreendimentosVisiveis.length === 0 ? (
                        <EstadoVazio className="lista-empreendimentos__vazia m-4" titulo="Nenhum resultado encontrado" descricao="Ajuste a busca ou os filtros para encontrar um empreendimento." />
                    ) : (
                        <>
                            <table className={estilos.tabela} aria-label="Lista de empreendimentos">
                                <thead className="sr-only">
                                    <tr>
                                        <th scope="col">Empreendimento</th><th scope="col">Descrição</th><th scope="col">Localização</th><th scope="col">Status</th><th scope="col">Atualizado em</th><th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="block">
                                    {empreendimentosVisiveis.map((empreendimento) => {
                                        const estaSelecionado = empreendimento.id === selecionado?.id;
                                        return (
                                            <tr className={cn(estilos.linha, estaSelecionado && estilos.linhaAtiva)} key={empreendimento.id}>
                                                <td className="block p-0" colSpan={6}>
                                                    <article
                                                        aria-label={`Selecionar ${empreendimento.nome} para pré-visualização`}
                                                        className={estilos.registro}
                                                        onClick={() => setSelecionadoId(empreendimento.id)}
                                                    >
                                                        <button className={estilos.iconeRegistro} type="button" aria-label={`Pré-visualizar ${empreendimento.nome}`} aria-pressed={estaSelecionado} onClick={() => setSelecionadoId(empreendimento.id)}>
                                                            <i className="bi bi-building" aria-hidden="true" />
                                                        </button>
                                                        <div className={estilos.dadosRegistro}>
                                                            <div className="flex w-full min-w-0 items-center gap-2">
                                                                <Link className={cn(estilos.tituloRegistro, estaSelecionado && "text-accent")} to={`/admin/empreendimentos/${empreendimento.id}`}>{empreendimento.nome}</Link>
                                                                {estaSelecionado && <span className={estilos.etiquetaAtivo}>ATIVO</span>}
                                                            </div>
                                                            <p className="line-clamp-1 w-full text-[14px] leading-5 text-foreground-muted">{empreendimento.descricao || "Descrição não informada"}</p>
                                                            <div className={estilos.metadados}>
                                                                <i className="bi bi-geo-alt flex-none" aria-hidden="true" />
                                                                <span className="truncate">{empreendimento.endereco || "Localização não informada"}</span>
                                                                <span className="h-1 w-1 flex-none rounded-full bg-foreground-muted" aria-hidden="true" />
                                                                <time dateTime={empreendimento.atualizado_em}>{formatarDataEmpreendimento(empreendimento.atualizado_em)}</time>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-none items-center gap-1.5">
                                                            <span className={cn(obterClassesStatus(empreendimento.status), "px-2.5 py-1 text-[13px] leading-5")}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{obterRotuloStatus(empreendimento.status)}</span>
                                                            <Link className={estilos.abrir} to={`/admin/empreendimentos/${empreendimento.id}`} aria-label="Abrir"><i className="bi bi-box-arrow-up-right" aria-hidden="true" /></Link>
                                                        </div>
                                                    </article>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <footer className={estilos.rodapeLista}>
                                <span>Exibindo 1–{empreendimentosVisiveis.length} de {empreendimentosVisiveis.length}</span>
                                <div className="flex items-center gap-1.5 text-[13px] font-medium" aria-label="Paginação">
                                    <span className="rounded-sm border border-border-muted px-2 py-1">Anterior</span>
                                    <span className="rounded-sm border border-foreground px-2 py-1 text-foreground-strong" aria-current="page">1</span>
                                    <span className="rounded-sm border border-border-muted px-2 py-1">Próximo</span>
                                </div>
                            </footer>
                        </>
                    )}
                </section>

                <PainelPrevia empreendimento={selecionado} />
            </div>
        </section>
    );
}

function IndicadorStatus({ status, total }: { status: Empreendimento["status"]; total: number }) {
    return <span className={estilos.indicador}><span className={cn("h-1.5 w-1.5 rounded-full", classesPontoStatus[status])} aria-hidden="true" />{total} {obterRotuloStatus(status)}</span>;
}

function PainelPrevia({ empreendimento }: { empreendimento: Empreendimento | null }) {
    return (
        <aside className={estilos.painel} aria-labelledby="titulo-previa-empreendimento">
            <div className={estilos.previaCabecalho}>
                <h2 className="flex min-w-0 items-center gap-2.5 text-[16px] font-medium leading-6 text-foreground" id="titulo-previa-empreendimento">
                    <i className="bi bi-eye" aria-hidden="true" /><span className="truncate">Pré-visualização do Empreendimento</span>
                </h2>
                {empreendimento && <span className="rounded-sm border border-border-control bg-surface px-2 py-1 font-code-sm text-[13px] leading-5 text-foreground-muted">EMP-{String(empreendimento.id).padStart(5, "0")}</span>}
            </div>
            {!empreendimento ? (
                <div className="p-5 text-[14px] leading-5 text-foreground-muted">Selecione um empreendimento para visualizar os detalhes.</div>
            ) : (
                <div className={estilos.previaConteudo}>
                    <div className={estilos.previaIdentidade}>
                        <span className={estilos.previaIcone}><i className="bi bi-building" aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-headline-md text-[24px] font-semibold leading-8 text-foreground-strong">{empreendimento.nome}</h3>
                            <div className={estilos.metadados}><i className="bi bi-geo-alt" aria-hidden="true" /><span className="truncate text-foreground">{empreendimento.endereco || "Localização não informada"}</span><span className="h-1 w-1 rounded-full bg-foreground-muted" aria-hidden="true" /><span>Atualizado em {formatarDataEmpreendimento(empreendimento.atualizado_em)}</span></div>
                        </div>
                        <span className={cn(obterClassesStatus(empreendimento.status), "px-2.5 py-1 text-[13px] leading-5")}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{obterRotuloStatus(empreendimento.status)}</span>
                    </div>

                    <section className={estilos.secaoPrevia}>
                        <h3 className={estilos.rotuloPainel}>Descrição do empreendimento</h3>
                        <p className="ds-surface-card px-4 py-4 text-[15px] leading-6 text-foreground">{empreendimento.descricao || "Descrição não informada"}</p>
                    </section>

                    <section className={estilos.secaoPrevia}>
                        <h3 className={estilos.rotuloPainel}>Ações rápidas</h3>
                        <div className={estilos.acoesRapidas}>
                            <Link className={cn(estilos.acaoRapida, "border-accent bg-[rgb(31_111_235_/_12%)] text-foreground-strong")} to={`/admin/empreendimentos/${empreendimento.id}`}><i className="bi bi-box-arrow-up-right text-accent" aria-hidden="true" />Abrir empreendimento</Link>
                            <Link className={estilos.acaoRapida} to={`/admin/empreendimentos/${empreendimento.id}/editar`}><i className="bi bi-pencil text-foreground-muted" aria-hidden="true" />Editar informações</Link>
                            <button className={estilos.acaoRapida} type="button" disabled><i className="bi bi-copy text-foreground-muted" aria-hidden="true" />Duplicar dados</button>
                            <button className={cn(estilos.acaoRapida, "text-error")} type="button" disabled><i className="bi bi-archive" aria-hidden="true" />Arquivar obra</button>
                        </div>
                    </section>

                    <section className={estilos.secaoPrevia}>
                        <h3 className={estilos.rotuloPainel}>Diretrizes &amp; módulos vinculados</h3>
                        <Diretriz icone="bi-graph-up-arrow" cor="text-accent" titulo="Auditoria Ativa">Todas as alterações de status alimentam relatórios de governança ESG e compliance.</Diretriz>
                        <Diretriz icone="bi-diagram-3" cor="text-warning-700" titulo="Estrutura EAP">Vincule pacotes de trabalho e marcos contratuais com rastreio de medições em campo.</Diretriz>
                        <Diretriz icone="bi-arrow-repeat" cor="text-success-700" titulo="Integração ERP">Sincronização bidirecional em tempo real para ordens de serviço e centros de custos.</Diretriz>
                    </section>
                </div>
            )}
        </aside>
    );
}

function Diretriz({ icone, cor, titulo, children }: { icone: string; cor: string; titulo: string; children: string }) {
    return (
        <div className={estilos.diretriz}>
            <span className={cn("grid h-8 w-8 flex-none place-items-center rounded bg-surface-hover text-[16px]", cor)}><i className={cn("bi", icone)} aria-hidden="true" /></span>
            <div className="grid gap-1"><strong className="text-[15px] font-medium leading-5 text-foreground-strong">{titulo}</strong><p className="text-[13px] leading-5 text-foreground-muted">{children}</p></div>
        </div>
    );
}

function compararEmpreendimentos(a: Empreendimento, b: Empreendimento, ordenacao: Ordenacao): number {
    if (ordenacao === "nome-asc" || ordenacao === "nome-desc") {
        const resultado = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
        if (resultado !== 0) return ordenacao === "nome-desc" ? -resultado : resultado;
        return a.id - b.id;
    }
    const dataA = new Date(a.atualizado_em).getTime();
    const dataB = new Date(b.atualizado_em).getTime();
    const resultado = (Number.isNaN(dataA) ? 0 : dataA) - (Number.isNaN(dataB) ? 0 : dataB);
    if (resultado !== 0) return ordenacao === "atualizado-desc" ? -resultado : resultado;
    const desempate = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    return desempate || a.id - b.id;
}
