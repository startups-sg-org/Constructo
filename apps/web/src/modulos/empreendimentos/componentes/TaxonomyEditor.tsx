import React from "react";
import { Link, useFetcher, useLoaderData, useRevalidator } from "react-router-dom";

import type { Etapa, Marco } from "../../../features/empreendimentos/empreendimentos.service";
import type { alterarTaxonomia } from "../../../features/empreendimentos/taxonomia.action";
import type { carregarTaxonomia } from "../../../features/empreendimentos/taxonomia.loader";
import { cn } from "../../../utils/classes";
import TaxonomyInitialSetupDialog from "./TaxonomyInitialSetupDialog";

type ItemTaxonomia = Etapa | Marco;
type TotaisEstrutura = { etapas: number; subetapas: number; marcos: number };
type ModoFormulario =
    | { tipo: "criar-etapa" }
    | { tipo: "editar-etapa"; etapa: Etapa }
    | { tipo: "criar-subetapa"; parent: Etapa }
    | { tipo: "criar-marco"; etapa: Etapa }
    | { tipo: "editar-marco"; marco: Marco };

const estilos = {
    editor: "grid w-full min-w-0 gap-4",
    cabecalhoPagina: "flex min-w-0 items-start justify-between gap-4 pt-1 max-sm:flex-col max-sm:items-stretch",
    tituloPagina: "m-0 text-[24px] font-semibold leading-tight text-foreground-strong",
    subtituloPagina: "mt-1 mb-0 text-[14px] text-foreground-muted",
    statusPagina: "w-max flex-none rounded border border-border-control bg-surface-muted px-2 py-1 text-[12px] text-foreground-muted",
    areaTrabalho: "grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_15rem]",
    areaConfiguracao: "grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-[13rem_minmax(0,1fr)]",
    painel: "ds-panel min-w-0 overflow-hidden p-0!",
    painelNavegacao: "md:col-start-1 md:row-start-1",
    painelHierarquia: "md:col-start-2 md:row-start-1",
    painelDetalhes: "md:col-span-2 md:row-start-2 xl:col-span-1 xl:col-start-3 xl:row-start-1",
    cabecalhoPainel: "flex min-h-12 items-center border-b border-border-muted px-3 py-3",
    cabecalhoPainelComAcoes: "items-start justify-between gap-3",
    tituloPainel: "m-0 text-[14px] font-semibold text-foreground-strong",
    subtituloPainel: "mt-0.5 mb-0 text-[12px] text-foreground-muted",
    botaoAdicionar: "ds-focus-ring-offset inline-flex min-h-8 flex-none items-center gap-1.5 rounded-md border border-action-primary bg-action-primary px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-action-primary-hover",
    conteudoNavegacao: "grid gap-3 p-3",
    busca: "relative min-w-0",
    iconeBusca: "pointer-events-none absolute inset-y-0 left-2.5 grid place-items-center text-[12px] text-foreground-muted",
    campoBusca: "ds-dark-field h-9 w-full bg-surface-muted! pl-8! text-[12px] placeholder:text-foreground-muted",
    itemNavegacao: "ds-focus-ring-offset flex w-full min-w-0 items-center gap-2.5 rounded-md border border-accent/45 bg-accent/10 p-2.5 text-left text-foreground",
    iconeNavegacao: "grid size-7 flex-none place-items-center rounded bg-surface-hover text-accent",
    textoNavegacao: "grid min-w-0 gap-0.5",
    nomeNavegacao: "truncate text-[13px] text-foreground-strong",
    contextoNavegacao: "truncate text-[11px] text-foreground-muted",
    semResultado: "m-0 px-1 py-3 text-center text-[12px] leading-5 text-foreground-muted",
    resumo: "m-0 grid gap-1 border-t border-border-muted pt-3",
    resumoLinha: "flex items-center justify-between gap-2 px-1 py-1 text-[12px] text-foreground-muted",
    resumoValor: "m-0 font-semibold text-foreground-strong",
    vazioNavegacao: "grid min-h-36 place-content-center justify-items-center gap-2 p-4 text-center text-[12px] text-foreground-muted",
    iconeVazioNavegacao: "text-[20px] text-accent",
    botaoConfigurar: "ds-focus-ring-offset inline-flex min-h-9 items-center gap-1.5 rounded-md border border-action-primary bg-action-primary px-3 py-2 text-[12px] font-semibold text-white no-underline hover:bg-action-primary-hover",
    painelConfiguracao: "grid min-h-64 place-content-center justify-items-center gap-3 p-6! text-center",
    iconeConfiguracao: "grid size-12 place-items-center rounded-lg border border-accent/40 bg-accent/10 text-[22px] text-accent",
    tituloConfiguracao: "m-0 text-[18px] font-semibold text-foreground-strong",
    textoConfiguracao: "m-0 max-w-lg text-[13px] leading-5 text-foreground-muted",
    statusConfiguracao: "mt-3 mb-0 text-[12px] text-foreground-muted",
    conteudoHierarquia: "grid gap-3 p-3",
    arvore: "m-0 list-none p-0 [&_ul]:m-0 [&_ul]:ml-4 [&_ul]:list-none [&_ul]:border-l [&_ul]:border-border-muted [&_ul]:pl-3",
    itemArvore: "my-1.5 rounded-md border border-border-control bg-surface-muted p-2.5",
    itemSelecionado: "border-accent bg-accent/10",
    linhaItem: "flex min-w-0 items-center gap-2",
    botaoExpandir: "ds-icon-button size-6 flex-none border-0 bg-transparent p-0 text-foreground-muted hover:bg-surface-hover hover:text-foreground-strong",
    espacoExpandir: "block size-6 flex-none",
    iconeTipo: "grid size-6 flex-none place-items-center rounded bg-surface-hover",
    selecionarItem: "grid min-w-0 flex-1 gap-0.5 border-0 bg-transparent p-0 text-left text-foreground-strong",
    nomeItem: "truncate text-[14px]",
    tipoItem: "text-[11px] text-foreground-muted",
    contagensItem: "inline-flex flex-none items-center gap-1.5",
    contagemItem: "inline-flex items-center gap-1 rounded border border-border-muted px-1 py-0.5 text-[10px] text-foreground-muted",
    ordemItem: "flex-none text-[11px] text-foreground-muted",
    descricaoItem: "mt-1.5 ml-12 text-[12px] leading-5 text-foreground-muted",
    conteudoItem: "mt-2.5 grid gap-2",
    linkProtocolo: "inline-flex w-fit items-center gap-1.5 text-[12px] text-accent no-underline hover:underline",
    vazioConteudo: "grid min-h-40 place-content-center justify-items-center gap-2 p-4 text-center text-foreground-muted",
    textoVazio: "m-0 max-w-64 text-[13px] leading-5",
    formulario: "grid gap-3 rounded-lg border border-accent bg-accent/5 p-3.5",
    cabecalhoFormulario: "flex min-w-0 items-start justify-between gap-3 border-b border-border-muted pb-3",
    tituloFormulario: "m-0 text-[14px] font-semibold text-foreground-strong",
    subtituloFormulario: "mt-1 mb-0 text-[12px] text-foreground-muted",
    contextoFormulario: "flex min-w-0 items-center gap-2 rounded-md border border-border-control bg-surface-muted px-3 py-2",
    iconeContextoFormulario: "grid size-7 flex-none place-items-center rounded bg-surface-hover text-accent",
    textoContextoFormulario: "grid min-w-0 gap-0.5",
    rotuloContextoFormulario: "text-[10px] font-medium uppercase tracking-wide text-foreground-muted",
    valorContextoFormulario: "truncate text-[13px] font-semibold text-foreground-strong",
    fecharFormulario: "ds-icon-button size-8 flex-none border-0 bg-transparent p-0 text-foreground-muted hover:bg-surface-hover hover:text-foreground-strong",
    camposFormulario: "m-0 grid min-w-0 grid-cols-[minmax(0,1fr)_6rem] gap-3 border-0 p-0 disabled:cursor-wait disabled:opacity-60 max-sm:grid-cols-1",
    campoFormulario: "grid min-w-0 gap-1",
    campoAmplo: "col-span-full max-sm:col-auto",
    rotuloCampo: "text-[11px] font-medium text-foreground-muted",
    controleFormulario: "ds-dark-field w-full min-w-0 bg-surface-muted! text-[13px]",
    textareaFormulario: "ds-dark-field w-full min-w-0 resize-y bg-surface-muted! text-[13px]",
    erroFormulario: "m-0 rounded-md border border-[#f85149]/45 bg-[#f85149]/10 px-2.5 py-2 text-[12px] text-[#ff7b72]",
    erroCampo: "m-0 text-[11px] text-error",
    sucessoFormulario: "m-0 rounded-md border border-[#3fb950]/45 bg-[#3fb950]/10 px-2.5 py-2 text-[12px] text-[#56d364]",
    acoesFormulario: "flex justify-end gap-2 border-t border-border-muted pt-3",
    botaoCancelar: "ds-focus-ring-offset min-h-9 rounded-md border border-border-control bg-surface-hover px-3 py-1.5 text-[12px] font-semibold text-foreground-strong disabled:cursor-wait disabled:opacity-60",
    botaoSalvar: "ds-focus-ring-offset min-h-9 rounded-md border border-action-primary bg-action-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-action-primary-hover disabled:cursor-wait disabled:opacity-60",
    detalhes: "grid gap-3.5 p-3",
    cabecalhoDetalhes: "flex min-w-0 items-start gap-2.5",
    textoCabecalhoDetalhes: "grid min-w-0 gap-1",
    iconeDetalhes: "grid size-8 flex-none place-items-center rounded-md bg-surface-hover",
    tipoDetalhes: "w-max rounded border border-border-control bg-surface-muted px-1.5 py-0.5 text-[10px] uppercase text-foreground-muted",
    nomeDetalhes: "m-0 break-words text-[16px] font-semibold text-foreground-strong",
    listaDetalhes: "m-0 grid gap-3",
    linhaDetalhes: "grid gap-1",
    termoDetalhes: "text-[10px] uppercase text-foreground-muted",
    valorDetalhes: "m-0 break-words text-[13px] leading-5 text-foreground",
    acoesDetalhes: "grid gap-1.5 border-t border-border-muted pt-3",
    acaoDetalhes: "flex min-h-8 w-full items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[12px] font-medium text-accent no-underline hover:bg-surface-hover",
} as const;

const estilosTipo = {
    etapa: "text-accent",
    subetapa: "text-[#a371f7]",
    marco: "text-[#e3b341]",
} as const;

function itemEhEtapa(item: ItemTaxonomia): item is Etapa {
    return "taxonomia_id" in item;
}

function contarEstrutura(etapas: Etapa[]): TotaisEstrutura {
    return etapas.reduce(
        (total, etapa) => {
            const contagemFilhas = contarEstrutura(etapa.subetapas ?? []);
            return {
                etapas: total.etapas + (etapa.parent_id ? 0 : 1) + contagemFilhas.etapas,
                subetapas: total.subetapas + (etapa.parent_id ? 1 : 0) + contagemFilhas.subetapas,
                marcos: total.marcos + (etapa.marcos?.length ?? 0) + contagemFilhas.marcos,
            };
        },
        { etapas: 0, subetapas: 0, marcos: 0 },
    );
}

function compararItens(a: ItemTaxonomia, b: ItemTaxonomia) {
    const porOrdem = a.ordem - b.ordem;
    if (porOrdem !== 0) return porOrdem;

    const aEtapa = itemEhEtapa(a);
    const bEtapa = itemEhEtapa(b);
    if (aEtapa !== bEtapa) return aEtapa ? -1 : 1;

    const porNome = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    return porNome || a.id - b.id;
}

function tipoDoItem(
    item: ItemTaxonomia,
    nivel: number,
): { rotulo: string; icone: string; classe: keyof typeof estilosTipo } {
    if (!itemEhEtapa(item)) return { rotulo: "Marco", icone: "bi-flag-fill", classe: "marco" };
    if (nivel > 0 || item.parent_id) return { rotulo: "Subetapa", icone: "bi-diagram-2", classe: "subetapa" };
    return { rotulo: "Etapa", icone: "bi-layers", classe: "etapa" };
}

function normalizarBusca(valor: string) {
    return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function chaveFormulario(modo: ModoFormulario) {
    if (modo.tipo === "criar-etapa") return modo.tipo;
    if (modo.tipo === "editar-etapa") return `${modo.tipo}-${modo.etapa.id}`;
    if (modo.tipo === "criar-subetapa") return `${modo.tipo}-${modo.parent.id}`;
    if (modo.tipo === "criar-marco") return `${modo.tipo}-${modo.etapa.id}`;
    return `${modo.tipo}-${modo.marco.id}`;
}

function contextoFormulario(modo: ModoFormulario) {
    if (modo.tipo === "criar-etapa") {
        return { rotulo: "Destino da criação", valor: "Nível principal da taxonomia", icone: "bi-layers" };
    }
    if (modo.tipo === "criar-subetapa") {
        return { rotulo: "Etapa pai", valor: modo.parent.nome, icone: "bi-diagram-2" };
    }
    if (modo.tipo === "criar-marco") {
        return {
            rotulo: modo.etapa.parent_id ? "Subetapa vinculada" : "Etapa vinculada",
            valor: modo.etapa.nome,
            icone: "bi-flag",
        };
    }
    if (modo.tipo === "editar-etapa") {
        return { rotulo: "Item em edição", valor: modo.etapa.nome, icone: "bi-pencil" };
    }
    return { rotulo: "Item em edição", valor: modo.marco.nome, icone: "bi-pencil" };
}

function ItemForm({
    modo,
    onCancel,
    onSaved,
}: {
    modo: ModoFormulario;
    onCancel: () => void;
    onSaved: (item: ItemTaxonomia) => void;
}) {
    const fetcher = useFetcher<typeof alterarTaxonomia>();
    const [mensagemSucesso, setMensagemSucesso] = React.useState("");
    const respostaProcessada = React.useRef<unknown>(null);
    const etapa = modo.tipo === "editar-etapa" ? modo.etapa : undefined;
    const marco = modo.tipo === "editar-marco" ? modo.marco : undefined;
    const alvo = etapa ?? marco;
    const enviando = fetcher.state !== "idle";
    const respostaErro = fetcher.data && !fetcher.data.ok ? fetcher.data : undefined;
    const prefixoCampo = chaveFormulario(modo);
    const contexto = contextoFormulario(modo);
    const configuracao = {
        "criar-etapa": { titulo: "Adicionar etapa", descricao: "Crie uma etapa principal para a taxonomia.", intencao: "criar-etapa" },
        "editar-etapa": { titulo: "Editar etapa", descricao: "Atualize os dados da etapa selecionada.", intencao: "editar-etapa" },
        "criar-subetapa": { titulo: "Adicionar subetapa", descricao: `Inclua uma subetapa em ${modo.tipo === "criar-subetapa" ? modo.parent.nome : ""}.`, intencao: "criar-etapa" },
        "criar-marco": { titulo: "Adicionar marco", descricao: `Inclua um marco em ${modo.tipo === "criar-marco" ? modo.etapa.nome : ""}.`, intencao: "criar-marco" },
        "editar-marco": { titulo: "Editar marco", descricao: "Atualize os dados do marco selecionado.", intencao: "editar-marco" },
    }[modo.tipo];

    React.useEffect(() => {
        if (fetcher.state !== "idle" || !fetcher.data?.ok || !fetcher.data.item) return;
        if (respostaProcessada.current === fetcher.data) return;
        respostaProcessada.current = fetcher.data;
        setMensagemSucesso("Alterações salvas com sucesso.");
        onSaved(fetcher.data.item);
    }, [fetcher.data, fetcher.state, onSaved]);

    return (
        <fetcher.Form
            method="post"
            className={estilos.formulario}
            aria-labelledby="taxonomy-form-title"
            aria-busy={enviando}
            noValidate
        >
            <header className={estilos.cabecalhoFormulario}>
                <div>
                    <h4 className={estilos.tituloFormulario} id="taxonomy-form-title">{configuracao.titulo}</h4>
                    <p className={estilos.subtituloFormulario}>{configuracao.descricao}</p>
                </div>
                <button type="button" className={estilos.fecharFormulario} onClick={onCancel} aria-label="Fechar formulário">
                    <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
            </header>
            <div className={estilos.contextoFormulario} aria-label={`${contexto.rotulo}: ${contexto.valor}`}>
                <span className={estilos.iconeContextoFormulario} aria-hidden="true">
                    <i className={`bi ${contexto.icone}`} />
                </span>
                <span className={estilos.textoContextoFormulario}>
                    <span className={estilos.rotuloContextoFormulario}>{contexto.rotulo}</span>
                    <strong className={estilos.valorContextoFormulario} title={contexto.valor}>{contexto.valor}</strong>
                </span>
            </div>
            <input
                type="hidden"
                name="intencao"
                value={configuracao.intencao}
            />
            {alvo && <input type="hidden" name="id" value={alvo.id} />}
            {modo.tipo === "criar-subetapa" && <input type="hidden" name="parent_id" value={modo.parent.id} />}
            {modo.tipo === "criar-marco" && <input type="hidden" name="etapa_id" value={modo.etapa.id} />}
            {modo.tipo === "editar-marco" && <input type="hidden" name="etapa_id" value={modo.marco.etapa_id} />}

            <fieldset className={estilos.camposFormulario} disabled={enviando}>
                <label className={estilos.campoFormulario} htmlFor={`${prefixoCampo}-nome`}>
                    <span className={estilos.rotuloCampo}>Nome <span aria-hidden="true">*</span></span>
                    <input
                        className={estilos.controleFormulario}
                        id={`${prefixoCampo}-nome`}
                        name="nome"
                        defaultValue={alvo?.nome ?? ""}
                        placeholder={modo.tipo.includes("marco") ? "Nome do marco" : "Nome da etapa"}
                        maxLength={200}
                        required
                        autoFocus
                        aria-invalid={Boolean(respostaErro?.campos?.nome)}
                        aria-describedby={respostaErro?.campos?.nome ? `${prefixoCampo}-nome-erro` : undefined}
                    />
                    {respostaErro?.campos?.nome && (
                        <p className={estilos.erroCampo} id={`${prefixoCampo}-nome-erro`} role="alert">{respostaErro.campos.nome}</p>
                    )}
                </label>
                <label className={estilos.campoFormulario} htmlFor={`${prefixoCampo}-ordem`}>
                    <span className={estilos.rotuloCampo}>Ordem <span aria-hidden="true">*</span></span>
                    <input
                        className={estilos.controleFormulario}
                        id={`${prefixoCampo}-ordem`}
                        name="ordem"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={alvo?.ordem ?? 0}
                        required
                        aria-invalid={Boolean(respostaErro?.campos?.ordem)}
                        aria-describedby={respostaErro?.campos?.ordem ? `${prefixoCampo}-ordem-erro` : undefined}
                    />
                    {respostaErro?.campos?.ordem && (
                        <p className={estilos.erroCampo} id={`${prefixoCampo}-ordem-erro`} role="alert">{respostaErro.campos.ordem}</p>
                    )}
                </label>
                <label className={cn(estilos.campoFormulario, estilos.campoAmplo)}>
                    <span className={estilos.rotuloCampo}>Descrição técnica</span>
                    <textarea className={estilos.textareaFormulario} name="descricao_tecnica" defaultValue={alvo?.descricao_tecnica ?? ""} rows={2} placeholder="Orientações internas da equipe" />
                </label>
                <label className={cn(estilos.campoFormulario, estilos.campoAmplo)}>
                    <span className={estilos.rotuloCampo}>Descrição para o comprador</span>
                    <textarea className={estilos.textareaFormulario} name="descricao_cliente" defaultValue={alvo?.descricao_cliente ?? ""} rows={2} placeholder="Texto apresentado ao comprador" />
                </label>
            </fieldset>

            {respostaErro?.erro && !respostaErro.campos && <p className={estilos.erroFormulario} role="alert">{respostaErro.erro}</p>}
            {mensagemSucesso && <p className={estilos.sucessoFormulario} role="status">{mensagemSucesso}</p>}

            <footer className={estilos.acoesFormulario}>
                <button type="button" className={estilos.botaoCancelar} onClick={onCancel} disabled={enviando}>Cancelar</button>
                <button type="submit" className={estilos.botaoSalvar} disabled={enviando}>
                    {enviando ? "Salvando…" : alvo ? "Salvar alterações" : "Criar item"}
                </button>
            </footer>
        </fetcher.Form>
    );
}

function TaxonomyTreeItem({
    item,
    empreendimentoId,
    nivel = 0,
    selecionado,
    onSelect,
}: {
    item: ItemTaxonomia;
    empreendimentoId: number;
    nivel?: number;
    selecionado?: ItemTaxonomia;
    onSelect: (item: ItemTaxonomia) => void;
}) {
    const [aberto, setAberto] = React.useState(nivel === 0);
    const conteudoId = React.useId();
    const etapa = itemEhEtapa(item);
    const tipo = tipoDoItem(item, nivel);
    const filhos = etapa
        ? [...(item.subetapas ?? []), ...(item.marcos ?? [])].sort(compararItens)
        : [];
    const contagens = etapa ? contarEstrutura(item.subetapas ?? []) : null;
    const quantidadeMarcos = etapa ? (item.marcos?.length ?? 0) + (contagens?.marcos ?? 0) : 0;
    const estaSelecionado = selecionado
        ? itemEhEtapa(selecionado) === etapa && selecionado.id === item.id
        : false;

    return (
        <li className={cn(estilos.itemArvore, estaSelecionado && estilos.itemSelecionado)}>
            <div className={estilos.linhaItem}>
                {etapa ? (
                    <button
                        type="button"
                        className={estilos.botaoExpandir}
                        onClick={() => setAberto(!aberto)}
                        aria-label={aberto ? `Recolher ${item.nome}` : `Expandir ${item.nome}`}
                        aria-expanded={aberto}
                        aria-controls={conteudoId}
                    >
                        <i className={`bi ${aberto ? "bi-chevron-down" : "bi-chevron-right"}`} aria-hidden="true" />
                    </button>
                ) : (
                    <span className={estilos.espacoExpandir} aria-hidden="true" />
                )}
                <span className={cn(estilos.iconeTipo, estilosTipo[tipo.classe])} aria-hidden="true">
                    <i className={`bi ${tipo.icone}`} />
                </span>
                <button type="button" className={estilos.selecionarItem} onClick={() => onSelect(item)}>
                    <strong className={estilos.nomeItem}>{item.nome}</strong>
                    <span className={estilos.tipoItem}>{tipo.rotulo}</span>
                </button>
                {etapa && (
                    <span className={estilos.contagensItem} aria-label={`${contagens?.subetapas ?? 0} subetapas e ${quantidadeMarcos} marcos`}>
                        {(contagens?.subetapas ?? 0) > 0 && <span className={estilos.contagemItem}><i className="bi bi-diagram-2" aria-hidden="true" />{contagens?.subetapas}</span>}
                        {quantidadeMarcos > 0 && <span className={estilos.contagemItem}><i className="bi bi-flag" aria-hidden="true" />{quantidadeMarcos}</span>}
                    </span>
                )}
                <span className={estilos.ordemItem}>#{item.ordem}</span>
            </div>
            <div className={estilos.descricaoItem}>
                {item.descricao_cliente || item.descricao_tecnica || "Sem descrição"}
            </div>

            {etapa && aberto && (
                <div className={estilos.conteudoItem} id={conteudoId}>
                    {filhos.length > 0 && (
                        <ul>
                            {filhos.map((filho) => (
                                <TaxonomyTreeItem
                                    key={`${itemEhEtapa(filho) ? "etapa" : "marco"}-${filho.id}`}
                                    item={filho}
                                    empreendimentoId={empreendimentoId}
                                    nivel={nivel + 1}
                                    selecionado={selecionado}
                                    onSelect={onSelect}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {!etapa && (
                <div className={estilos.conteudoItem}>
                    <Link className={estilos.linkProtocolo} to={`/admin/empreendimentos/${empreendimentoId}/taxonomia/marcos/${item.id}/protocolos`}>
                        <i className="bi bi-paperclip" aria-hidden="true" />
                        Protocolos de evidências — {item.nome}
                    </Link>
                </div>
            )}
        </li>
    );
}

function PainelDetalhes({
    item,
    empreendimentoId,
    onAction,
}: {
    item?: ItemTaxonomia;
    empreendimentoId: number;
    onAction: (modo: ModoFormulario) => void;
}) {
    if (!item) {
        return (
            <div className={estilos.vazioConteudo}>
                <i className="bi bi-cursor text-[20px]" aria-hidden="true" />
                <p className={estilos.textoVazio}>Selecione uma etapa, subetapa ou marco para visualizar seus detalhes.</p>
            </div>
        );
    }

    const etapa = itemEhEtapa(item);
    const subetapa = etapa && Boolean(item.parent_id);
    const tipo = etapa ? (subetapa ? "Subetapa" : "Etapa") : "Marco";

    return (
        <div className={estilos.detalhes}>
            <div className={estilos.cabecalhoDetalhes}>
                <span className={cn(estilos.iconeDetalhes, estilosTipo[tipo.toLocaleLowerCase("pt-BR") as keyof typeof estilosTipo])} aria-hidden="true">
                    <i className={`bi ${etapa ? (subetapa ? "bi-diagram-2" : "bi-layers") : "bi-flag-fill"}`} />
                </span>
                <div className={estilos.textoCabecalhoDetalhes}>
                    <span className={estilos.tipoDetalhes}>{tipo}</span>
                    <h4 className={estilos.nomeDetalhes}>{item.nome}</h4>
                </div>
            </div>
            <dl className={estilos.listaDetalhes}>
                <div className={estilos.linhaDetalhes}><dt className={estilos.termoDetalhes}>Ordem</dt><dd className={estilos.valorDetalhes}>{item.ordem}</dd></div>
                <div className={estilos.linhaDetalhes}><dt className={estilos.termoDetalhes}>Descrição técnica</dt><dd className={estilos.valorDetalhes}>{item.descricao_tecnica || "Não informada"}</dd></div>
                <div className={estilos.linhaDetalhes}><dt className={estilos.termoDetalhes}>Descrição para o comprador</dt><dd className={estilos.valorDetalhes}>{item.descricao_cliente || "Não informada"}</dd></div>
            </dl>
            <div className={estilos.acoesDetalhes} aria-label={`Ações de ${item.nome}`}>
                {etapa ? (
                    <>
                        <button className={estilos.acaoDetalhes} type="button" onClick={() => onAction({ tipo: "editar-etapa", etapa: item })}>
                            <i className="bi bi-pencil" aria-hidden="true" />
                            Editar {subetapa ? "subetapa" : "etapa"}
                        </button>
                        {!subetapa && (
                            <button className={estilos.acaoDetalhes} type="button" onClick={() => onAction({ tipo: "criar-subetapa", parent: item })}>
                                <i className="bi bi-plus-lg" aria-hidden="true" />
                                Adicionar subetapa
                            </button>
                        )}
                        <button className={estilos.acaoDetalhes} type="button" onClick={() => onAction({ tipo: "criar-marco", etapa: item })}>
                            <i className="bi bi-flag" aria-hidden="true" />
                            Adicionar marco
                        </button>
                    </>
                ) : (
                    <>
                        <button className={estilos.acaoDetalhes} type="button" onClick={() => onAction({ tipo: "editar-marco", marco: item })}>
                            <i className="bi bi-pencil" aria-hidden="true" />
                            Editar marco
                        </button>
                        <Link className={estilos.acaoDetalhes} to={`/admin/empreendimentos/${empreendimentoId}/taxonomia/marcos/${item.id}/protocolos`}>
                            <i className="bi bi-paperclip" aria-hidden="true" />
                            Ver protocolos de evidências
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function TaxonomyEditor() {
    const { empreendimento, taxonomia } = useLoaderData<typeof carregarTaxonomia>();
    const revalidator = useRevalidator();
    const [busca, setBusca] = React.useState("");
    const etapasDaTaxonomia = taxonomia?.etapas;
    const etapas = React.useMemo(
        () => [...(etapasDaTaxonomia ?? [])].sort(compararItens),
        [etapasDaTaxonomia],
    );
    const totais = React.useMemo(() => contarEstrutura(etapas), [etapas]);
    const [selecionado, setSelecionado] = React.useState<ItemTaxonomia | undefined>(() => etapas[0]);
    const [modoFormulario, setModoFormulario] = React.useState<ModoFormulario | null>(null);
    const [configuracaoInicialAberta, setConfiguracaoInicialAberta] = React.useState(false);
    const termoBusca = normalizarBusca(busca);
    const taxonomiaEncontrada = taxonomia && (!termoBusca || normalizarBusca(taxonomia.nome).includes(termoBusca));
    const selecionarItem = React.useCallback((item: ItemTaxonomia) => {
        setSelecionado(item);
        setModoFormulario(null);
    }, []);
    const concluirFormulario = React.useCallback((item: ItemTaxonomia) => {
        setSelecionado(item);
        revalidator.revalidate();
    }, [revalidator]);
    const fecharConfiguracaoInicial = React.useCallback(() => setConfiguracaoInicialAberta(false), []);
    const concluirConfiguracaoInicial = React.useCallback(() => {
        setConfiguracaoInicialAberta(false);
        revalidator.revalidate();
    }, [revalidator]);

    if (!taxonomia) {
        return (
            <section className={estilos.editor} aria-labelledby="taxonomy-title">
                <header className={estilos.cabecalhoPagina}>
                    <div>
                        <h2 className={estilos.tituloPagina} id="taxonomy-title">Taxonomia</h2>
                        <p className={estilos.subtituloPagina}>Configure a estrutura de etapas e marcos de {empreendimento.nome}.</p>
                    </div>
                    <span className={estilos.statusPagina}>Não configurada</span>
                </header>
                <div className={estilos.areaConfiguracao}>
                    <aside className={cn(estilos.painel, estilos.painelNavegacao)} aria-labelledby="taxonomy-navigation-title">
                        <div className={estilos.cabecalhoPainel}>
                            <h3 className={estilos.tituloPainel} id="taxonomy-navigation-title">Taxonomia da obra</h3>
                        </div>
                        <div className={estilos.vazioNavegacao}>
                            <i className={cn("bi bi-diagram-3", estilos.iconeVazioNavegacao)} aria-hidden="true" />
                            <p className="m-0">Nenhuma taxonomia configurada.</p>
                        </div>
                    </aside>
                    <section
                        className={cn(estilos.painel, estilos.painelConfiguracao)}
                        aria-label="Configuração da taxonomia"
                    >
                        <span className={estilos.iconeConfiguracao} aria-hidden="true">
                            <i className="bi bi-diagram-3" />
                        </span>
                        <h3 className={estilos.tituloConfiguracao}>Configure a taxonomia inicial</h3>
                        <p className={estilos.textoConfiguracao}>
                            Escolha um modelo padrão para cadastrar a estrutura personalizada de etapas, subetapas e marcos deste empreendimento.
                        </p>
                        <button
                            className={estilos.botaoConfigurar}
                            type="button"
                            onClick={() => setConfiguracaoInicialAberta(true)}
                        >
                            <i className="bi bi-plus-lg" aria-hidden="true" />
                            Configurar taxonomia
                        </button>
                        {revalidator.state !== "idle" && <p className={estilos.statusConfiguracao} role="status">Atualizando estrutura…</p>}
                    </section>
                </div>
                {configuracaoInicialAberta && (
                    <TaxonomyInitialSetupDialog
                        empreendimentoId={empreendimento.id}
                        empreendimentoNome={empreendimento.nome}
                        onClose={fecharConfiguracaoInicial}
                        onConfigured={concluirConfiguracaoInicial}
                    />
                )}
            </section>
        );
    }

    return (
        <section className={estilos.editor} aria-labelledby="taxonomy-title">
            <header className={estilos.cabecalhoPagina}>
                <div>
                    <h2 className={estilos.tituloPagina} id="taxonomy-title">Taxonomia</h2>
                    <p className={estilos.subtituloPagina}>{taxonomia.descricao || "Estrutura personalizada do empreendimento."}</p>
                </div>
                <span className={estilos.statusPagina}>Taxonomia personalizada</span>
            </header>

            <div className={estilos.areaTrabalho}>
                <aside className={cn(estilos.painel, estilos.painelNavegacao)} aria-labelledby="taxonomy-navigation-title">
                    <div className={estilos.cabecalhoPainel}>
                        <h3 className={estilos.tituloPainel} id="taxonomy-navigation-title">Taxonomia da obra</h3>
                    </div>
                    <div className={estilos.conteudoNavegacao}>
                        <div className={estilos.busca}>
                            <label className="sr-only" htmlFor="buscar-taxonomia">Buscar taxonomia por nome</label>
                            <i className={cn("bi bi-search", estilos.iconeBusca)} aria-hidden="true" />
                            <input
                                className={estilos.campoBusca}
                                id="buscar-taxonomia"
                                type="search"
                                value={busca}
                                placeholder="Buscar taxonomia..."
                                onChange={(event) => setBusca(event.target.value)}
                            />
                        </div>
                        {taxonomiaEncontrada ? (
                            <button
                                className={estilos.itemNavegacao}
                                type="button"
                                aria-current="true"
                                onClick={() => setSelecionado(etapas[0])}
                            >
                                <span className={estilos.iconeNavegacao}><i className="bi bi-diagram-3" aria-hidden="true" /></span>
                                <span className={estilos.textoNavegacao}><strong className={estilos.nomeNavegacao}>{taxonomia.nome}</strong><small className={estilos.contextoNavegacao}>{empreendimento.nome}</small></span>
                            </button>
                        ) : (
                            <p className={estilos.semResultado}>Nenhuma taxonomia encontrada.</p>
                        )}
                        <dl className={estilos.resumo}>
                            <div className={estilos.resumoLinha}><dt>Etapas</dt><dd className={estilos.resumoValor}>{totais.etapas}</dd></div>
                            <div className={estilos.resumoLinha}><dt>Subetapas</dt><dd className={estilos.resumoValor}>{totais.subetapas}</dd></div>
                            <div className={estilos.resumoLinha}><dt>Marcos</dt><dd className={estilos.resumoValor}>{totais.marcos}</dd></div>
                        </dl>
                    </div>
                </aside>

                <section className={cn(estilos.painel, estilos.painelHierarquia)} aria-labelledby="taxonomy-hierarchy-title">
                    <div className={cn(estilos.cabecalhoPainel, estilos.cabecalhoPainelComAcoes)}>
                        <div>
                            <h3 className={estilos.tituloPainel} id="taxonomy-hierarchy-title">Estrutura da taxonomia</h3>
                            <p className={estilos.subtituloPainel}>Etapas, subetapas e marcos da obra</p>
                        </div>
                        <button
                            type="button"
                            className={estilos.botaoAdicionar}
                            onClick={() => setModoFormulario({ tipo: "criar-etapa" })}
                        >
                            <i className="bi bi-plus-lg" aria-hidden="true" />
                            Adicionar etapa
                        </button>
                    </div>
                    <div className={estilos.conteudoHierarquia}>
                        {modoFormulario && (
                            <ItemForm
                                key={chaveFormulario(modoFormulario)}
                                modo={modoFormulario}
                                onCancel={() => setModoFormulario(null)}
                                onSaved={concluirFormulario}
                            />
                        )}
                        {etapas.length > 0 ? (
                            <ul className={estilos.arvore}>
                                {etapas.map((etapa) => (
                                    <TaxonomyTreeItem
                                        key={`etapa-${etapa.id}`}
                                        item={etapa}
                                        empreendimentoId={empreendimento.id}
                                        selecionado={selecionado}
                                        onSelect={selecionarItem}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <div className={estilos.vazioConteudo}>
                                <i className="bi bi-diagram-3 text-[20px]" aria-hidden="true" />
                                <p className={estilos.textoVazio}>Esta taxonomia ainda não possui etapas.</p>
                            </div>
                        )}
                    </div>
                </section>

                <aside className={cn(estilos.painel, estilos.painelDetalhes)} aria-labelledby="taxonomy-details-title">
                    <div className={estilos.cabecalhoPainel}>
                        <h3 className={estilos.tituloPainel} id="taxonomy-details-title">Detalhes do item</h3>
                    </div>
                    <PainelDetalhes
                        item={selecionado}
                        empreendimentoId={empreendimento.id}
                        onAction={setModoFormulario}
                    />
                </aside>
            </div>
        </section>
    );
}
