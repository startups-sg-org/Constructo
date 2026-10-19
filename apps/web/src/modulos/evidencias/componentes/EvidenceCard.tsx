import { useState, type KeyboardEvent, type MouseEvent } from "react";

import { resolverUrlEvidencia } from "../../../features/evidencias/evidencias.service";
import type { Evidencia } from "../types";
import { formatarDataCaptura } from "../evidenciaFormatters";

type EvidenceCardProps = {
    evidencia: Evidencia;
    onAbrir: (evidencia: Evidencia) => void;
};

const LIMITE_DESCRICAO = 130;

export default function EvidenceCard({ evidencia, onAbrir }: EvidenceCardProps) {
    const [imagemComErro, setImagemComErro] = useState(false);
    const [descricaoExpandida, setDescricaoExpandida] = useState(false);
    const descricao = evidencia.descricao_tecnica?.trim();
    const descricaoLonga = Boolean(descricao && descricao.length > LIMITE_DESCRICAO);
    const descricaoVisivel = descricaoLonga && !descricaoExpandida
        ? `${descricao?.slice(0, LIMITE_DESCRICAO).trimEnd()}…`
        : descricao;

    function abrir() {
        onAbrir(evidencia);
    }

    function aoPressionar(evento: KeyboardEvent<HTMLElement>) {
        if (evento.target !== evento.currentTarget) return;
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrir();
        }
    }

    function alternarDescricao(evento: MouseEvent<HTMLButtonElement>) {
        evento.stopPropagation();
        setDescricaoExpandida((valor) => !valor);
    }

    return (
        <article
            className="group grid min-w-0 cursor-pointer overflow-hidden rounded-md border border-border-control bg-surface transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            role="button"
            tabIndex={0}
            aria-label={`Abrir evidência de ${evidencia.local_obra.nome}`}
            onClick={abrir}
            onKeyDown={aoPressionar}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
                {imagemComErro ? (
                    <div className="grid h-full place-items-center content-center gap-2 text-center text-[12px] text-foreground-muted" role="img" aria-label="Imagem indisponível">
                        <IconeImagem />
                        <span>Imagem indisponível</span>
                    </div>
                ) : (
                    <img
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                        src={resolverUrlEvidencia(evidencia.arquivo_url)}
                        alt={`Evidência registrada em ${evidencia.local_obra.nome}`}
                        loading="lazy"
                        onError={() => setImagemComErro(true)}
                    />
                )}
            </div>

            <div className="grid gap-3 p-4">
                <div className="grid min-w-0 gap-1">
                    <span className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-accent">
                        {evidencia.local_obra.nome}
                    </span>
                    <strong className="truncate text-[14px] font-semibold leading-5 text-foreground-strong">
                        {evidencia.marco.nome}
                    </strong>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-[12px]">
                    <div className="grid min-w-0 gap-1">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted">Data</dt>
                        <dd className="truncate text-foreground">{formatarDataCaptura(evidencia.capturado_em)}</dd>
                    </div>
                    <div className="grid min-w-0 gap-1">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted">Por</dt>
                        <dd className="truncate text-foreground" title={evidencia.responsavel.nome}>{evidencia.responsavel.nome}</dd>
                    </div>
                </dl>

                <div className="text-[12px] leading-5 text-foreground-muted">
                    <p>{descricaoVisivel || "Sem descrição técnica."}</p>
                    {descricaoLonga && (
                        <button
                            className="ds-focus-ring-offset mt-1 rounded-sm border-0 bg-transparent p-0 text-[12px] font-semibold text-accent hover:text-foreground-strong"
                            type="button"
                            aria-expanded={descricaoExpandida}
                            onClick={alternarDescricao}
                        >
                            {descricaoExpandida ? "Mostrar menos" : "Ler mais"}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

function IconeImagem() {
    return (
        <svg className="h-9 w-9 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="m4 17 4-4 3 3 3-3 6 6" />
        </svg>
    );
}
