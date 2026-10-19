import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";
import type { Etapa, Marco } from "../../../features/empreendimentos/empreendimentos.service";
import type { carregarMedicoesEmpreendimento } from "../../../features/evidencias/medicoes.loader";
import { formatarDataEmpreendimento } from "./empreendimentoFormatters";

type MarcoComEtapa = Marco & { etapa: string };

export default function MedicoesEmpreendimento() {
    const { empreendimento, taxonomia, protocolos } = useLoaderData<typeof carregarMedicoesEmpreendimento>();
    const etapas = taxonomia?.etapas;
    const marcos = useMemo(() => listarMarcos(etapas ?? []), [etapas]);
    const [marcoSelecionado, setMarcoSelecionado] = useState(marcos[0]?.id ?? 0);
    const contextoPorMarco = new Map(marcos.map((marco) => [marco.id, marco]));
    const destinoNovo = marcoSelecionado
        ? `/admin/empreendimentos/${empreendimento.id}/taxonomia/marcos/${marcoSelecionado}/protocolos/novo`
        : undefined;

    return (
        <section className="grid gap-4" aria-labelledby="medicoes-empreendimento-titulo">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border-muted pb-3">
                <div>
                    <h2 className="text-[22px] font-semibold leading-7 text-foreground-strong" id="medicoes-empreendimento-titulo">
                        Medições por protocolo de evidência
                    </h2>
                    <p className="mt-1 text-[13px] leading-5 text-foreground-muted">
                        Cada medição define as evidências exigidas para um marco da obra.
                    </p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <label className="grid gap-1 text-[12px] text-foreground-muted" htmlFor="marco-nova-medicao">
                        Marco da nova medição
                        <select
                            className="ds-focus-ring min-h-10 min-w-56 rounded-md border border-border-control bg-surface-muted px-3 py-2 text-[13px] text-foreground-strong"
                            id="marco-nova-medicao"
                            value={marcoSelecionado}
                            onChange={(evento) => setMarcoSelecionado(Number(evento.target.value))}
                            disabled={marcos.length === 0}
                        >
                            {marcos.length === 0 && <option value={0}>Nenhum marco disponível</option>}
                            {marcos.map((marco) => (
                                <option key={marco.id} value={marco.id}>{marco.etapa} — {marco.nome}</option>
                            ))}
                        </select>
                    </label>
                    {destinoNovo ? (
                        <Link className="ds-focus-ring inline-flex min-h-10 items-center rounded-md bg-action-primary px-4 py-2 text-[13px] font-semibold text-white no-underline hover:bg-action-primary-hover" to={destinoNovo}>+ Nova medição</Link>
                    ) : (
                        <span className="inline-flex min-h-10 cursor-not-allowed items-center rounded-md bg-action-primary px-4 py-2 text-[13px] font-semibold text-white opacity-50" aria-disabled="true">+ Nova medição</span>
                    )}
                </div>
            </header>

            {protocolos.length === 0 ? (
                <EstadoVazio
                    titulo="Nenhuma medição configurada"
                    descricao="Escolha um marco acima para criar o primeiro protocolo de evidência."
                />
            ) : (
                <ul className="grid gap-3 lg:grid-cols-2">
                    {protocolos.map((protocolo) => {
                        const marco = contextoPorMarco.get(protocolo.marco_id);
                        return (
                            <li className="ds-panel grid gap-3 p-4" key={protocolo.id}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="break-words text-[15px] font-semibold leading-6 text-foreground-strong">{protocolo.nome}</h3>
                                        <p className="font-overline text-overline uppercase text-foreground-muted">
                                            {marco ? `${marco.etapa} · ${marco.nome}` : `Marco #${protocolo.marco_id}`}
                                        </p>
                                    </div>
                                    <span className="ds-status ds-status--informativo">Medição</span>
                                </div>
                                <p className="break-words text-[13px] leading-5 text-foreground-muted">
                                    {protocolo.descricao || "Sem orientação adicional."}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-muted pt-3">
                                    <span className="text-[12px] text-foreground-muted">
                                        Mínimo de {protocolo.quantidade_minima} evidência(s) · {formatarDataEmpreendimento(protocolo.criado_em)}
                                    </span>
                                    <Link className="text-[13px] font-medium text-action-primary hover:underline" to={`/admin/empreendimentos/${empreendimento.id}/taxonomia/marcos/${protocolo.marco_id}/protocolos/${protocolo.id}`}>
                                        Editar medição
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

function listarMarcos(etapas: Etapa[], caminho: string[] = []): MarcoComEtapa[] {
    return etapas.flatMap((etapa) => {
        const caminhoAtual = [...caminho, etapa.nome];
        return [
            ...(etapa.marcos ?? []).map((marco) => ({ ...marco, etapa: caminhoAtual.join(" / ") })),
            ...listarMarcos(etapa.subetapas ?? [], caminhoAtual),
        ];
    });
}
