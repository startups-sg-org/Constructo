import { useState, type KeyboardEvent, type MouseEvent } from "react";

import BadgeStatus, {
    type TomBadgeStatus,
} from "../../../componentes/BadgeStatus/BadgeStatus";
import { resolverUrlEvidencia } from "../../../features/evidencias/evidencias.service";
import type {
    Evidencia,
    StatusValidacaoEvidencia,
} from "../types";
import { formatarDataCaptura } from "../evidenciaFormatters";

type EvidenceCardProps = {
    evidencia: Evidencia;
    onAbrir: (evidencia: Evidencia) => void;
};

const LIMITE_DESCRICAO = 130;

const STATUS: Record<
    StatusValidacaoEvidencia,
    { rotulo: string; tom: TomBadgeStatus }
> = {
    PENDENTE: { rotulo: "Pendente", tom: "alerta" },
    APROVADA: { rotulo: "Aprovada", tom: "sucesso" },
    REJEITADA: { rotulo: "Rejeitada", tom: "erro" },
};

export default function EvidenceCard({ evidencia, onAbrir }: EvidenceCardProps) {
    const [imagemComErro, setImagemComErro] = useState(false);
    const [descricaoExpandida, setDescricaoExpandida] = useState(false);
    const descricao = evidencia.descricao_tecnica?.trim();
    const descricaoLonga = Boolean(descricao && descricao.length > LIMITE_DESCRICAO);
    const descricaoVisivel = descricaoLonga && !descricaoExpandida
        ? `${descricao?.slice(0, LIMITE_DESCRICAO).trimEnd()}…`
        : descricao;
    const status = evidencia.status_validacao
        ? STATUS[evidencia.status_validacao]
        : null;

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
            className="evidence-card"
            role="button"
            tabIndex={0}
            aria-label={`Abrir evidência de ${evidencia.local_obra.nome}`}
            onClick={abrir}
            onKeyDown={aoPressionar}
        >
            <div className="evidence-card__imagem">
                {imagemComErro ? (
                    <div className="evidence-card__placeholder" role="img" aria-label="Imagem indisponível">
                        <IconeImagem />
                        <span>Imagem indisponível</span>
                    </div>
                ) : (
                    <img
                        src={resolverUrlEvidencia(evidencia.arquivo_url)}
                        alt={`Evidência registrada em ${evidencia.local_obra.nome}`}
                        loading="lazy"
                        onError={() => setImagemComErro(true)}
                    />
                )}
                {status && (
                    <BadgeStatus tom={status.tom} className="evidence-card__status">
                        {status.rotulo}
                    </BadgeStatus>
                )}
            </div>

            <div className="evidence-card__conteudo">
                <div className="evidence-card__contexto">
                    <span>{evidencia.local_obra.nome}</span>
                    <strong>{evidencia.marco.nome}</strong>
                </div>

                <dl className="evidence-card__metadados">
                    <div>
                        <dt>Capturada em</dt>
                        <dd>{formatarDataCaptura(evidencia.capturado_em)}</dd>
                    </div>
                    <div>
                        <dt>Responsável</dt>
                        <dd>{evidencia.responsavel.nome}</dd>
                    </div>
                </dl>

                <div className="evidence-card__descricao">
                    <p>{descricaoVisivel || "Sem descrição técnica."}</p>
                    {descricaoLonga && (
                        <button
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
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="m4 17 4-4 3 3 3-3 6 6" />
        </svg>
    );
}
