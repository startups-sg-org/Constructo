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
import "./EvidenceGallery.css";

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

export default function EvidenceGallery({ empreendimentoId }: EvidenceGalleryProps) {
    const parametros = useParams<{ empreendimentoId: string }>();
    const idEmpreendimento = empreendimentoId ?? Number(parametros.empreendimentoId);
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

    const totalPaginas = Math.max(1, Math.ceil(evidencias.length / ITENS_POR_PAGINA));
    const evidenciasVisiveis = useMemo(() => {
        const inicio = (pagina - 1) * ITENS_POR_PAGINA;
        return evidencias.slice(inicio, inicio + ITENS_POR_PAGINA);
    }, [evidencias, pagina]);

    function aplicarFiltros(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setFiltros(montarFiltros(camposFiltro));
    }

    function limparFiltros() {
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
        <section className="evidence-gallery" aria-busy={carregando}>
            <form className="evidence-gallery__filtros superficie-painel" onSubmit={aplicarFiltros}>
                <div className="evidence-gallery__filtro">
                    <label htmlFor="evidencia-local">ID do local</label>
                    <input
                        id="evidencia-local"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={camposFiltro.localObraId}
                        onChange={(evento) => setCamposFiltro({
                            ...camposFiltro,
                            localObraId: evento.target.value,
                        })}
                        placeholder="Ex.: 704"
                    />
                </div>
                <div className="evidence-gallery__filtro">
                    <label htmlFor="evidencia-marco">ID do marco</label>
                    <input
                        id="evidencia-marco"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={camposFiltro.marcoId}
                        onChange={(evento) => setCamposFiltro({
                            ...camposFiltro,
                            marcoId: evento.target.value,
                        })}
                        placeholder="Ex.: 18"
                    />
                </div>
                <div className="evidence-gallery__filtro">
                    <label htmlFor="evidencia-data-inicio">Capturada a partir de</label>
                    <input
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
                <div className="evidence-gallery__filtro">
                    <label htmlFor="evidencia-data-fim">Capturada até</label>
                    <input
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
                <div className="evidence-gallery__acoes-filtro">
                    <button className="botao secundario" type="button" onClick={limparFiltros}>
                        Limpar
                    </button>
                    <button className="botao primario" type="submit">
                        Aplicar filtros
                    </button>
                </div>
            </form>

            {carregando && <GaleriaSkeleton />}

            {!carregando && erro && (
                <div className="evidence-gallery__erro superficie-painel" role="alert">
                    <div>
                        <h2>Não foi possível carregar as evidências</h2>
                        <p>{erro}</p>
                    </div>
                    <button className="botao primario" type="button" onClick={() => setTentativa((valor) => valor + 1)}>
                        Tentar novamente
                    </button>
                </div>
            )}

            {!carregando && !erro && evidencias.length === 0 && (
                <EstadoVazio
                    className="evidence-gallery__vazio superficie-painel"
                    titulo="Nenhuma evidência encontrada para estes filtros"
                    descricao="Ajuste os filtros ou registre uma nova evidência para este empreendimento."
                />
            )}

            {!carregando && !erro && evidencias.length > 0 && (
                <>
                    <div className="evidence-gallery__resumo" aria-live="polite">
                        <span>{evidencias.length} evidência{evidencias.length === 1 ? "" : "s"}</span>
                        <span>Página {pagina} de {totalPaginas}</span>
                    </div>
                    <div className="evidence-gallery__grid">
                        {evidenciasVisiveis.map((evidencia) => (
                            <EvidenceCard
                                key={evidencia.id}
                                evidencia={evidencia}
                                onAbrir={abrirDetalhes}
                            />
                        ))}
                    </div>
                    {totalPaginas > 1 && (
                        <nav className="evidence-gallery__paginacao" aria-label="Paginação das evidências">
                            <button
                                className="botao secundario"
                                type="button"
                                disabled={pagina === 1}
                                onClick={() => setPagina((valor) => valor - 1)}
                            >
                                Anterior
                            </button>
                            <span>{pagina} / {totalPaginas}</span>
                            <button
                                className="botao secundario"
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

            {selecionada && (
                <div className="evidence-gallery__overlay" role="presentation" onMouseDown={fecharAoClicarFora}>
                    <section
                        className="evidence-gallery__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="evidencia-modal-titulo"
                    >
                        <button
                            className="evidence-gallery__fechar"
                            type="button"
                            aria-label="Fechar detalhes"
                            onClick={() => setSelecionada(null)}
                        >
                            ×
                        </button>
                        <div className="evidence-gallery__modal-imagem">
                            {imagemModalComErro ? (
                                <div role="img" aria-label="Imagem indisponível">Imagem indisponível</div>
                            ) : (
                                <img
                                    src={resolverUrlEvidencia(selecionada.arquivo_url)}
                                    alt={`Evidência em tamanho ampliado de ${selecionada.local_obra.nome}`}
                                    onError={() => setImagemModalComErro(true)}
                                />
                            )}
                        </div>
                        <div className="evidence-gallery__modal-conteudo">
                            <p className="subtitulo">{selecionada.local_obra.nome}</p>
                            <h2 id="evidencia-modal-titulo">{selecionada.marco.nome}</h2>
                            <p className="evidence-gallery__modal-descricao">
                                {selecionada.descricao_tecnica || "Sem descrição técnica."}
                            </p>
                            <dl className="evidence-gallery__modal-dados">
                                <div>
                                    <dt>Capturada em</dt>
                                    <dd>{formatarDataCaptura(selecionada.capturado_em)}</dd>
                                </div>
                                <div>
                                    <dt>Registrada em</dt>
                                    <dd>{formatarDataCaptura(selecionada.criado_em)}</dd>
                                </div>
                                <div>
                                    <dt>Responsável</dt>
                                    <dd>{selecionada.responsavel.nome} · {selecionada.responsavel.email}</dd>
                                </div>
                            </dl>
                        </div>
                    </section>
                </div>
            )}
        </section>
    );
}

function GaleriaSkeleton() {
    return (
        <div className="evidence-gallery__grid" role="status" aria-label="Carregando evidências">
            <span className="sr-only">Carregando evidências…</span>
            {Array.from({ length: 6 }, (_, indice) => (
                <div className="evidence-gallery__skeleton" aria-hidden="true" key={indice}>
                    <span />
                    <i />
                    <i />
                    <i />
                </div>
            ))}
        </div>
    );
}
