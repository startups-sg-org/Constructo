import type { EstruturaLocal, LocalObra } from "@constructo/shared";
import { useCallback, useMemo, useState } from "react";
import { useLoaderData, useLocation, useSearchParams } from "react-router-dom";

import StructureTree from "../../../componentes/StructureTree/StructureTree";
import { carregarEstruturaFisica } from "../../../features/empreendimentos/empreendimentos.loader";
import { encontrarLocalSelecionado, LOCAL_SELECIONADO_PARAM, obterLocalSelecionadoId } from "../../../features/empreendimentos/localSelecionado";
import { cn } from "../../../utils/classes";
import LocationDetails from "./LocationDetails";
import LocationCreationForm, { type TipoCriacaoLocal } from "./LocationCreationForm";
import StructureBreadcrumb from "./StructureBreadcrumb";
import StructureList from "./StructureList";
import UnitBuyerLink, { type CompradorVinculado } from "./UnitBuyerLink";

const estilos = {
    pagina: "grid w-full min-w-0 gap-4",
    cabecalho: "grid w-full min-w-0 gap-1 pt-1",
    tituloPagina: "m-0 font-headline-md text-headline-md font-semibold tracking-[-0.01em] text-foreground-strong",
    subtituloPagina: "m-0 font-body-md text-body-md text-foreground-muted",
    areaTrabalho: "grid w-full min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_14rem]",
    painel: "ds-panel min-w-0 overflow-hidden p-0!",
    painelArvore: "md:col-start-1 md:row-start-1",
    painelLista: "md:col-start-2 md:row-start-1",
    painelDetalhes: "md:col-span-2 md:row-start-2 xl:col-span-1 xl:col-start-3 xl:row-start-1",
    corpoPainel: "grid min-w-0 gap-3 p-3!",
    cabecalhoPainel: "flex min-w-0 items-center justify-between gap-2 border-b border-border-muted pb-2",
    tituloPainel: "m-0 font-label-md text-label-md font-medium text-foreground-strong",
    alternarTudo: "ds-icon-button h-6 w-6 flex-none border-0 bg-transparent p-0 text-body-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground-strong disabled:cursor-not-allowed disabled:opacity-40",
    busca: "relative min-w-0",
    iconeBusca: "pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-body-sm text-foreground-muted",
    campoBusca: "ds-dark-field h-9 bg-surface-muted! pl-9! font-body-sm text-body-sm placeholder:text-foreground-muted",
    acoesCriacao: "flex min-w-0 flex-wrap items-center gap-2",
    botaoCriacao: "ds-focus-ring-offset inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-border-control bg-surface-hover px-3 font-label-sm text-label-sm text-default-font hover:bg-border-muted hover:text-foreground-strong",
    botaoCriacaoPrimario: "border-action-primary bg-action-primary text-white hover:bg-action-primary-hover hover:text-white",
    alerta: "m-0 rounded-md border border-warning-700/40 bg-[rgb(210_153_34_/_15%)] px-3 py-2 font-body-sm text-body-sm text-[#e3b341]",
    sucesso: "m-0 rounded-md border border-success-700/40 bg-[rgb(35_134_54_/_15%)] px-3 py-2 font-body-sm text-body-sm text-success-700",
} as const;

function ramosIniciais(items: EstruturaLocal[]): Set<number> {
    return new Set(items.flatMap((item) => [
        ...(item.filhos.length ? [item.id] : []),
        ...ramosIniciais(item.filhos),
    ]));
}

function listarPorTipo(items: EstruturaLocal[], tipo: EstruturaLocal["tipo"]): EstruturaLocal[] {
    return items.flatMap((item) => [
        ...(item.tipo === tipo ? [item] : []),
        ...listarPorTipo(item.filhos, tipo),
    ]);
}

type CriacaoAtiva = {
    tipo: TipoCriacaoLocal;
    parent?: EstruturaLocal;
};

export default function StructureManagementPage() {
    const { empreendimento, estrutura } = useLoaderData<typeof carregarEstruturaFisica>();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const ramosExpansiveis = useMemo(() => ramosIniciais(estrutura), [estrutura]);
    const paisDePavimento = useMemo(
        () => estrutura.filter((item) => item.tipo === "TORRE" || item.tipo === "BLOCO"),
        [estrutura],
    );
    const paisDeUnidade = useMemo(() => listarPorTipo(estrutura, "PAVIMENTO"), [estrutura]);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set(ramosExpansiveis));
    const [busca, setBusca] = useState("");
    const [criacaoAtiva, setCriacaoAtiva] = useState<CriacaoAtiva | null>(
        () => estrutura.length === 0 ? { tipo: "raiz" } : null,
    );
    const [mensagemCriacao, setMensagemCriacao] = useState("");
    const [compradoresPorUnidade, setCompradoresPorUnidade] = useState<Record<number, CompradorVinculado[]>>({});
    const selectedId = obterLocalSelecionadoId(new URL(`${location.pathname}${location.search}`, window.location.origin));
    const selecao = useMemo(() => encontrarLocalSelecionado(estrutura, selectedId), [estrutura, selectedId]);
    const localAtual = selecao?.local ?? null;
    const filhos = localAtual?.filhos ?? estrutura;
    const parametroInvalido = searchParams.has(LOCAL_SELECIONADO_PARAM) && !selecao;
    const paiPavimento = localAtual && (localAtual.tipo === "TORRE" || localAtual.tipo === "BLOCO")
        ? localAtual
        : paisDePavimento.length === 1 ? paisDePavimento[0] : undefined;
    const paiUnidade = localAtual?.tipo === "PAVIMENTO"
        ? localAtual
        : paisDeUnidade.length === 1 ? paisDeUnidade[0] : undefined;
    const arvoreTotalmenteExpandida = ramosExpansiveis.size > 0
        && [...ramosExpansiveis].every((id) => expandedIds.has(id));

    function selecionarPorId(id: number | null) {
        const parametros = new URLSearchParams(searchParams);
        if (id === null) parametros.delete(LOCAL_SELECIONADO_PARAM);
        else parametros.set(LOCAL_SELECIONADO_PARAM, String(id));
        setBusca("");
        setSearchParams(parametros, { preventScrollReset: true, replace: true });
    }

    function alternarRamo(local: EstruturaLocal) {
        setExpandedIds((atual) => {
            const proximo = new Set(atual);
            if (proximo.has(local.id)) proximo.delete(local.id); else proximo.add(local.id);
            return proximo;
        });
    }

    function alternarTodosOsRamos() {
        setExpandedIds(arvoreTotalmenteExpandida ? new Set() : new Set(ramosExpansiveis));
    }

    function abrirCriacao(tipo: TipoCriacaoLocal, parent?: EstruturaLocal) {
        setMensagemCriacao("");
        setCriacaoAtiva({ tipo, parent });
    }

    function concluirCriacao(local: LocalObra, tipo: TipoCriacaoLocal, parentId?: number) {
        const rotulo = tipo === "raiz"
            ? (local.tipo === "TORRE" ? "Torre" : "Bloco")
            : tipo === "pavimento" ? "Pavimento" : "Unidade";
        const participio = tipo === "pavimento" ? "adicionado" : "adicionada";

        if (parentId) {
            setExpandedIds((atuais) => new Set([...atuais, parentId]));
        }
        setMensagemCriacao(`${rotulo} “${local.nome}” ${participio} com sucesso.`);
        setCriacaoAtiva(null);
    }

    const registrarCompradorVinculado = useCallback((unidadeId: number, comprador: CompradorVinculado) => {
        setCompradoresPorUnidade((atuais) => {
            const compradores = atuais[unidadeId] ?? [];
            if (compradores.some((item) => item.id === comprador.id)) return atuais;

            return { ...atuais, [unidadeId]: [...compradores, comprador] };
        });
    }, []);

    const registrarCompradoresCarregados = useCallback((unidadeId: number, compradores: CompradorVinculado[]) => {
        setCompradoresPorUnidade((atuais) => ({ ...atuais, [unidadeId]: compradores }));
    }, []);

    return (
        <section className={estilos.pagina} aria-labelledby="estrutura-gerenciamento-titulo">
            <header className={estilos.cabecalho}>
                <h2 className={estilos.tituloPagina} id="estrutura-gerenciamento-titulo">
                    Estrutura do empreendimento
                </h2>
                <p className={estilos.subtituloPagina}>Organize blocos, pavimentos e unidades.</p>
            </header>

            <div className={estilos.areaTrabalho}>
                <section
                    className={cn(estilos.painel, estilos.painelArvore)}
                    aria-labelledby="estrutura-hierarquia-titulo"
                >
                    <div className={estilos.corpoPainel}>
                        <header className={estilos.cabecalhoPainel}>
                            <h3 className={estilos.tituloPainel} id="estrutura-hierarquia-titulo">Hierarquia</h3>
                            <button
                                className={estilos.alternarTudo}
                                type="button"
                                aria-label={arvoreTotalmenteExpandida ? "Recolher tudo" : "Expandir tudo"}
                                title={arvoreTotalmenteExpandida ? "Recolher tudo" : "Expandir tudo"}
                                disabled={ramosExpansiveis.size === 0}
                                onClick={alternarTodosOsRamos}
                            >
                                <i
                                    className={cn(
                                        "bi",
                                        arvoreTotalmenteExpandida ? "bi-arrows-collapse" : "bi-arrows-expand",
                                    )}
                                    aria-hidden="true"
                                />
                            </button>
                        </header>
                        <StructureTree
                            items={estrutura}
                            selectedId={selecao?.local.id ?? null}
                            onSelect={(local) => selecionarPorId(local.id)}
                            expandedIds={expandedIds}
                            onToggle={alternarRamo}
                        />
                    </div>
                </section>

                <section
                    className={cn(estilos.painel, estilos.painelLista)}
                    aria-label="Locais do nível selecionado"
                >
                    <div className={estilos.corpoPainel}>
                        <div className={estilos.busca}>
                            <label className="sr-only" htmlFor="buscar-filhos">Buscar local neste nível</label>
                            <i className={cn("bi bi-search", estilos.iconeBusca)} aria-hidden="true" />
                            <input
                                className={estilos.campoBusca}
                                id="buscar-filhos"
                                type="search"
                                value={busca}
                                placeholder="Buscar local..."
                                onChange={(event) => setBusca(event.target.value)}
                            />
                        </div>
                        <div className={estilos.acoesCriacao} aria-label="Ações de criação de locais">
                            {criacaoAtiva?.tipo !== "raiz" && (
                                <button className={estilos.botaoCriacao} type="button" onClick={() => abrirCriacao("raiz")}>
                                    <i className="bi bi-plus-lg" aria-hidden="true" />
                                    Adicionar torre/bloco
                                </button>
                            )}
                            {paiPavimento && criacaoAtiva?.tipo !== "pavimento" && (
                                <button className={estilos.botaoCriacao} type="button" onClick={() => abrirCriacao("pavimento", paiPavimento)}>
                                    <i className="bi bi-plus-lg" aria-hidden="true" />
                                    Adicionar pavimento
                                </button>
                            )}
                            {paiUnidade && criacaoAtiva?.tipo !== "unidade" && (
                                <button
                                    className={cn(estilos.botaoCriacao, estilos.botaoCriacaoPrimario)}
                                    type="button"
                                    onClick={() => abrirCriacao("unidade", paiUnidade)}
                                >
                                    <i className="bi bi-plus-lg" aria-hidden="true" />
                                    Adicionar unidade
                                </button>
                            )}
                        </div>
                        {mensagemCriacao && <p className={estilos.sucesso} role="status">{mensagemCriacao}</p>}
                        {criacaoAtiva && (
                            <LocationCreationForm
                                key={`${criacaoAtiva.tipo}-${criacaoAtiva.parent?.id ?? "raiz"}`}
                                tipo={criacaoAtiva.tipo}
                                parent={criacaoAtiva.parent}
                                onCancel={() => setCriacaoAtiva(null)}
                                onCreated={concluirCriacao}
                            />
                        )}
                        {parametroInvalido && (
                            <p className={estilos.alerta} role="alert">O local informado não pertence a esta estrutura.</p>
                        )}
                        <StructureList
                            items={filhos}
                            busca={busca}
                            contexto={localAtual?.nome ?? "A estrutura"}
                            breadcrumb={<StructureBreadcrumb selecao={selecao} onSelect={selecionarPorId} />}
                            onSelect={(local) => selecionarPorId(local.id)}
                        />
                    </div>
                </section>

                <section
                    className={cn(estilos.painel, estilos.painelDetalhes)}
                    aria-labelledby="estrutura-detalhes-titulo"
                >
                    <div className={estilos.corpoPainel}>
                        <header className={estilos.cabecalhoPainel}>
                            <h3 className={estilos.tituloPainel} id="estrutura-detalhes-titulo">Detalhes do local</h3>
                        </header>
                        <LocationDetails
                            key={`detalhes-${selecao?.local.id ?? "sem-selecao"}`}
                            selecao={selecao}
                            empreendimentoNome={empreendimento.nome}
                        />
                        {localAtual?.tipo === "UNIDADE" && (
                            <UnitBuyerLink
                                key={`compradores-${localAtual.id}`}
                                empreendimentoId={empreendimento.id}
                                unidadeId={localAtual.id}
                                compradoresVinculados={compradoresPorUnidade[localAtual.id] ?? []}
                                onVinculado={registrarCompradorVinculado}
                                onCompradoresCarregados={registrarCompradoresCarregados}
                            />
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}
