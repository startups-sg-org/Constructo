import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type MouseEvent,
} from "react";
import { useParams } from "react-router-dom";

import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";
import {
    listarEvidencias,
    resolverUrlEvidencia,
} from "../../../features/evidencias/evidencias.service";
import { ApiError } from "../../../services/api";
import { formatarDataCaptura } from "../evidenciaFormatters";
import type { Evidencia, FiltrosEvidencia } from "../types";
import EvidenceCard from "./EvidenceCard";

const ITENS_POR_PAGINA = 12;

type EvidenceGalleryProps = {
    empreendimentoId?: number;
};

type CamposFiltro = {
    localObraId: string;
    marcoId: string;
    dataInicio: string;
    dataFim: string;
};

const FILTROS_VAZIOS: CamposFiltro = {
    localObraId: "",
    marcoId: "",
    dataInicio: "",
    dataFim: "",
};

function inicioDoDia(valor: string): string | undefined {
    return valor ? new Date(`${valor}T00:00:00`).toISOString() : undefined;
}

function fimDoDia(valor: string): string | undefined {
    return valor ? new Date(`${valor}T23:59:59.999`).toISOString() : undefined;
}

function montarFiltros(campos: CamposFiltro): FiltrosEvidencia {
    return {
        localObraId: campos.localObraId ? Number(campos.localObraId) : undefined,
        marcoId: campos.marcoId ? Number(campos.marcoId) : undefined,
        dataCapturaInicio: inicioDoDia(campos.dataInicio),
        dataCapturaFim: fimDoDia(campos.dataFim),
    };
}

function mensagemErro(erro: unknown): string {
    if (erro instanceof ApiError && erro.message) return erro.message;
    return "Não foi possível carregar as evidências.";
}

function normalizarTexto(valor: string | null | undefined): string {
    return (valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .trim();
}

export default function EvidenceGallery({ empreendimentoId }: EvidenceGalleryProps) {
    const parametros = useParams<{ empreendimentoId: string }>();
    const idEmpreendimento = empreendimentoId ?? Number(parametros.empreendimentoId);
    const [busca, setBusca] = useState("");
    const [camposFiltro, setCamposFiltro] = useState<CamposFiltro>(FILTROS_VAZIOS);
    const [filtros, setFiltros] = useState<FiltrosEvidencia>({});
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [erro, setErro] = useState<string | null>(null);
    const [tentativa, setTentativa] = useState(0);
    const chaveConsulta = JSON.stringify({ idEmpreendimento, filtros, tentativa });
    const [chaveCarregada, setChaveCarregada] = useState<string | null>(null);
    const carregando = chaveCarregada !== chaveConsulta;
    const [pagina, setPagina] = useState(1);
    const [selecionada, setSelecionada] = useState<Evidencia | null>(null);
    const [imagemModalComErro, setImagemModalComErro] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        if (!Number.isInteger(idEmpreendimento) || idEmpreendimento <= 0) {
            queueMicrotask(() => {
                if (!controller.signal.aborted) {
                    setErro("Empreendimento inválido.");
                    setChaveCarregada(chaveConsulta);
                }
            });
            return () => controller.abort();
        }

        listarEvidencias(idEmpreendimento, filtros, { signal: controller.signal })
            .then((dados) => {
                setErro(null);
                setEvidencias(dados);
                setPagina(1);
                setSelecionada((atual) => (
                    atual && dados.some((evidencia) => evidencia.id === atual.id)
                        ? atual
                        : null
                ));
            })
            .catch((falha: unknown) => {
                if (falha instanceof DOMException && falha.name === "AbortError") return;
                setErro(mensagemErro(falha));
            })
            .finally(() => {
                if (!controller.signal.aborted) setChaveCarregada(chaveConsulta);
            });

        return () => controller.abort();
    }, [chaveConsulta, filtros, idEmpreendimento]);

    useEffect(() => {
        if (!selecionada) return;

        function fecharComEscape(evento: globalThis.KeyboardEvent) {
            if (evento.key === "Escape") setSelecionada(null);
        }

        document.addEventListener("keydown", fecharComEscape);
        return () => document.removeEventListener("keydown", fecharComEscape);
    }, [selecionada]);

    const evidenciasFiltradas = useMemo(() => {
        const termo = normalizarTexto(busca);
        if (!termo) return evidencias;

        return evidencias.filter((evidencia) => [
            evidencia.descricao_tecnica,
            evidencia.local_obra.nome,
            evidencia.marco.nome,
            evidencia.responsavel.nome,
            evidencia.responsavel.email,
        ].some((valor) => normalizarTexto(valor).includes(termo)));
    }, [busca, evidencias]);

    const locaisDisponiveis = useMemo(
        () => [...new Map(evidencias.map((evidencia) => [evidencia.local_obra.id, evidencia.local_obra])).values()]
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
        [evidencias],
    );
    const marcosDisponiveis = useMemo(
        () => [...new Map(evidencias.map((evidencia) => [evidencia.marco.id, evidencia.marco])).values()]
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
        [evidencias],
    );

    const totalPaginas = Math.max(1, Math.ceil(evidenciasFiltradas.length / ITENS_POR_PAGINA));
    const evidenciasVisiveis = useMemo(() => {
        const inicio = (pagina - 1) * ITENS_POR_PAGINA;
        return evidenciasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
    }, [evidenciasFiltradas, pagina]);

    function aplicarFiltros(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setFiltros(montarFiltros(camposFiltro));
    }

    function limparFiltros() {
        setBusca("");
        setCamposFiltro(FILTROS_VAZIOS);
        setFiltros({});
    }

    function abrirDetalhes(evidencia: Evidencia) {
        setImagemModalComErro(false);
        setSelecionada(evidencia);
    }

    function fecharAoClicarFora(evento: MouseEvent<HTMLDivElement>) {
        if (evento.target === evento.currentTarget) setSelecionada(null);
    }

    return (
        <section className="grid min-w-0 gap-4" aria-busy={carregando}>
            <header className="ds-panel flex min-w-0 items-start justify-between gap-4 px-5 py-4 max-sm:flex-col max-sm:px-4">
                <div className="min-w-0">
                    <h2 className="text-[18px] font-semibold leading-6 text-foreground-strong">Evidências da obra</h2>
                    <p className="mt-1 max-w-3xl text-[13px] leading-5 text-foreground-muted">
                        Consulte fotos técnicas, vistorias fotográficas e registros de execução do empreendimento.
                    </p>
                </div>
                {!carregando && !erro && (
                    <span className="flex-none rounded-md border border-border-control bg-surface-muted px-2.5 py-1 font-code-sm text-[12px] text-foreground-muted">
                        {evidenciasFiltradas.length} evidência{evidenciasFiltradas.length === 1 ? "" : "s"}
                    </span>
                )}
            </header>

            <div className={`grid min-w-0 items-start gap-4${selecionada ? " xl:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
                <main className="ds-panel grid min-w-0 gap-4 p-4 max-sm:p-3">
            <form className="grid grid-cols-[minmax(220px,2fr)_repeat(4,minmax(140px,1fr))_auto] items-end gap-3 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1" onSubmit={aplicarFiltros}>
                <div className="grid gap-1.5">
                    <label className="text-[11px] font-semibold text-foreground-muted" htmlFor="evidencia-busca">Buscar evidências</label>
                    <input
                        className="ds-dark-field bg-surface-muted! text-[12px]! placeholder:text-foreground-muted"
                        id="evidencia-busca"
                        type="search"
                        value={busca}
                        onChange={(evento) => {
                            setBusca(evento.target.value);
                            setPagina(1);
                        }}
                        placeholder="Descrição, local, marco ou responsável"
                    />
                </div>
                <div className="grid gap-1.5">
                    <label className="text-[11px] font-semibold text-foreground-muted" htmlFor="evidencia-local">Local</label>
                    <select
                        className="ds-dark-field bg-surface-muted! text-[12px]!"
                        id="evidencia-local"
                        value={camposFiltro.localObraId}
                        onChange={(evento) => setCamposFiltro({
                            ...camposFiltro,
                            localObraId: evento.target.value,
                        })}
                    >
                        <option value="">Todos os locais</option>
                        {locaisDisponiveis.map((local) => (
                            <option key={local.id} value={local.id}>{local.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-1.5">
                    <label className="text-[11px] font-semibold text-foreground-muted" htmlFor="evidencia-marco">Marco</label>
                    <select
                        className="ds-dark-field bg-surface-muted! text-[12px]!"
                        id="evidencia-marco"
                        value={camposFiltro.marcoId}
                        onChange={(evento) => setCamposFiltro({
                            ...camposFiltro,
                            marcoId: evento.target.value,
                        })}
                    >
                        <option value="">Todos os marcos</option>
                        {marcosDisponiveis.map((marco) => (
                            <option key={marco.id} value={marco.id}>{marco.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-1.5">
                    <label className="text-[11px] font-semibold text-foreground-muted" htmlFor="evidencia-data-inicio">Capturada a partir de</label>
                    <input
                        className="ds-dark-field bg-surface-muted! text-[12px]!"
                        id="evidencia-data-inicio"
                        type="date"
                        value={camposFiltro.dataInicio}
                        max={camposFiltro.dataFim || undefined}
                        onChange={(evento) => setCamposFiltro({
                            ...camposFiltro,
                            dataInicio: evento.target.value,
                        })}
                    />
                </div>
                <div className="grid gap-1.5">
                    <label className="text-[11px] font-semibold text-foreground-muted" htmlFor="evidencia-data-fim">Capturada até</label>
                    <input
                        className="ds-dark-field bg-surface-muted! text-[12px]!"
                        id="evidencia-data-fim"
                        type="date"
                        value={camposFiltro.dataFim}
                        min={camposFiltro.dataInicio || undefined}
                        onChange={(evento) => setCamposFiltro({
                            ...camposFiltro,
                            dataFim: evento.target.value,
                        })}
                    />
                </div>
                <div className="flex flex-wrap justify-end gap-2 max-sm:justify-stretch">
                    <button className="ds-focus-ring-offset min-h-9 rounded-md border border-border-control bg-surface-hover px-3 text-[12px] font-medium text-foreground hover:bg-surface-muted" type="button" onClick={limparFiltros}>
                        Limpar
                    </button>
                    <button className="ds-focus-ring-offset min-h-9 rounded-md bg-action-primary px-3 text-[12px] font-semibold text-white hover:bg-action-primary-hover" type="submit">
                        Aplicar filtros
                    </button>
                </div>
            </form>

            {carregando && <GaleriaSkeleton />}

            {!carregando && erro && (
                <div className="flex min-h-44 items-center justify-between gap-6 rounded-md border border-error/30 bg-error/5 p-6 max-sm:flex-col max-sm:items-start" role="alert">
                    <div>
                        <h2>Não foi possível carregar as evidências</h2>
                        <p>{erro}</p>
                    </div>
                    <button className="ds-focus-ring-offset min-h-9 rounded-md bg-action-primary px-3 text-[12px] font-semibold text-white hover:bg-action-primary-hover" type="button" onClick={() => setTentativa((valor) => valor + 1)}>
                        Tentar novamente
                    </button>
                </div>
            )}

            {!carregando && !erro && evidenciasFiltradas.length === 0 && (
                <EstadoVazio
                    className="ds-panel min-h-56 p-6"
                    titulo={evidencias.length > 0 ? "Nenhuma evidência corresponde à busca" : "Nenhuma evidência encontrada para estes filtros"}
                    descricao={evidencias.length > 0
                        ? "Tente buscar por outra descrição, local, marco ou responsável."
                        : "Ajuste os filtros ou registre uma nova evidência para este empreendimento."}
                />
            )}

            {!carregando && !erro && evidenciasFiltradas.length > 0 && (
                <>
                    <div className="flex items-center justify-between gap-4 text-[12px] font-medium text-foreground-muted" aria-live="polite">
                        <span>{evidenciasFiltradas.length} evidência{evidenciasFiltradas.length === 1 ? "" : "s"}</span>
                        <span>Página {pagina} de {totalPaginas}</span>
                    </div>
                    <div className="grid grid-cols-3 items-stretch gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                        {evidenciasVisiveis.map((evidencia) => (
                            <EvidenceCard
                                key={evidencia.id}
                                evidencia={evidencia}
                                onAbrir={abrirDetalhes}
                            />
                        ))}
                    </div>
                    {totalPaginas > 1 && (
                        <nav className="flex items-center justify-center gap-4" aria-label="Paginação das evidências">
                            <button
                                className="ds-focus-ring-offset min-h-9 rounded-md border border-border-control bg-surface-hover px-3 text-[12px] font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={pagina === 1}
                                onClick={() => setPagina((valor) => valor - 1)}
                            >
                                Anterior
                            </button>
                            <span>{pagina} / {totalPaginas}</span>
                            <button
                                className="ds-focus-ring-offset min-h-9 rounded-md border border-border-control bg-surface-hover px-3 text-[12px] font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={pagina === totalPaginas}
                                onClick={() => setPagina((valor) => valor + 1)}
                            >
                                Próxima
                            </button>
                        </nav>
                    )}
                </>
            )}

                </main>

                {selecionada && (
                    <EvidenceDetails
                        evidencia={selecionada}
                        imagemComErro={imagemModalComErro}
                        onImagemErro={() => setImagemModalComErro(true)}
                        onFechar={() => setSelecionada(null)}
                        onClicarFora={fecharAoClicarFora}
                    />
                )}
            </div>
        </section>
    );
}

type EvidenceDetailsProps = {
    evidencia: Evidencia;
    imagemComErro: boolean;
    onImagemErro: () => void;
    onFechar: () => void;
    onClicarFora: (evento: MouseEvent<HTMLDivElement>) => void;
};

function EvidenceDetails({ evidencia, imagemComErro, onImagemErro, onFechar, onClicarFora }: EvidenceDetailsProps) {
    const urlImagem = obterUrlImagemValida(evidencia.arquivo_url);

    return (
        <div className="fixed inset-0 z-40 bg-black/70 p-3 backdrop-blur-sm xl:static xl:z-auto xl:bg-transparent xl:p-0" role="presentation" onMouseDown={onClicarFora}>
        <section
            className="ds-panel relative grid h-full max-h-[calc(100vh-24px)] min-w-0 overflow-y-auto rounded-lg bg-surface shadow-2xl xl:sticky xl:top-4 xl:h-auto xl:max-h-[calc(100vh-32px)] xl:shadow-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidencia-detalhes-titulo"
        >
                        <header className="flex items-center justify-between border-b border-border-control px-4 py-3">
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground-strong">
                                <i className="bi bi-file-earmark-image text-foreground-muted" aria-hidden="true" />
                                <span>Detalhes da evidência</span>
                            </div>
                        <button
                            className="ds-icon-button absolute right-3 top-3 z-10 h-8 w-8 border border-border-control bg-surface-muted text-foreground hover:bg-surface-hover"
                            type="button"
                            aria-label="Fechar detalhes"
                            onClick={onFechar}
                        >
                            <i className="bi bi-x-lg" aria-hidden="true" />
                        </button>
                        </header>
                        <div className="flex min-h-52 items-center justify-center overflow-hidden bg-canvas p-4">
                            {imagemComErro || !urlImagem ? (
                                <div className="grid min-h-52 place-items-center text-center text-[13px] text-foreground-muted" role="img" aria-label="Imagem indisponível">
                                    <span><i className="bi bi-image text-2xl" aria-hidden="true" /><br />Imagem indisponível</span>
                                </div>
                            ) : (
                                <img
                                    className="max-h-[360px] w-full object-contain"
                                    src={urlImagem ?? undefined}
                                    alt={`Evidência em tamanho ampliado de ${evidencia.local_obra.nome}`}
                                    onError={onImagemErro}
                                />
                            )}
                        </div>
                        {urlImagem && !imagemComErro && (
                            <div className="flex justify-end border-b border-border-control px-4 py-3">
                                <a
                                    className="ds-focus-ring-offset inline-flex min-h-8 items-center gap-2 rounded-md border border-border-control bg-surface-hover px-2.5 text-[12px] font-semibold text-foreground no-underline hover:bg-surface-muted"
                                    href={urlImagem}
                                    download={`evidencia-${evidencia.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <i className="bi bi-download" aria-hidden="true" />
                                    Baixar imagem
                                </a>
                            </div>
                        )}
                        <div className="grid gap-4 p-4">
                            <div className="grid gap-1">
                                <p className="text-[12px] font-medium text-accent">{evidencia.local_obra.nome}</p>
                                <h2 className="pr-10 text-[18px] font-semibold leading-6 text-foreground-strong" id="evidencia-detalhes-titulo">{evidencia.marco.nome}</h2>
                            </div>
                            <p className="text-[13px] leading-5 text-foreground">{evidencia.descricao_tecnica || "Sem descrição técnica."}
                            </p>
                            <dl className="grid gap-3 border-t border-border-control pt-3 text-[13px]">
                                <Detalhe label="ID da evidência" value={String(evidencia.id)} />
                                <Detalhe label="Local" value={evidencia.local_obra.nome} />
                                <Detalhe label="Marco construtivo" value={evidencia.marco.nome} />
                                <Detalhe label="Capturada em" value={formatarDataCaptura(evidencia.capturado_em)} />
                                <Detalhe label="Registrada em" value={formatarDataCaptura(evidencia.criado_em)} />
                                <Detalhe label="Responsável" value={`${evidencia.responsavel.nome} · ${evidencia.responsavel.email}`} />
                            </dl>
                        </div>
                    </section>
        </div>
    );
}

function obterUrlImagemValida(caminho: string): string | null {
    const valor = caminho.trim();
    if (!valor) return null;

    try {
        const url = new URL(
            resolverUrlEvidencia(valor),
            typeof window === "undefined" ? "http://localhost" : window.location.origin,
        );
        return ["http:", "https:", "blob:", "data:"].includes(url.protocol) ? url.toString() : null;
    } catch {
        return null;
    }
}

function Detalhe({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 border-b border-border-control pb-3 last:border-b-0 last:pb-0">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground-muted">{label}</dt>
            <dd className="break-words text-foreground">{value}</dd>
        </div>
    );
}

function GaleriaSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1" role="status" aria-label="Carregando evidências">
            <span className="sr-only">Carregando evidências…</span>
            {Array.from({ length: 6 }, (_, indice) => (
                <div className="ds-panel animate-pulse overflow-hidden" aria-hidden="true" key={indice}>
                    <div className="aspect-[4/3] bg-surface-muted" />
                    <div className="grid gap-3 p-4">
                        <span className="h-3 w-3/4 rounded bg-surface-muted" />
                        <span className="h-3 w-1/2 rounded bg-surface-muted" />
                        <span className="h-3 w-4/5 rounded bg-surface-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}
