import { useMemo, useState, type ReactNode } from "react";
import { Link, useLoaderData } from "react-router-dom";

import type { Etapa, Marco } from "../../../features/empreendimentos/empreendimentos.service";
import type { carregarMedicoesEmpreendimento } from "../../../features/evidencias/medicoes.loader";
import { formatarDataEmpreendimento } from "./empreendimentoFormatters";

type MarcoComEtapa = Marco & { etapa: string };

export default function MedicoesEmpreendimento() {
    const { empreendimento, taxonomia, protocolos, erroProtocolos, erroTaxonomia } = useLoaderData<typeof carregarMedicoesEmpreendimento>();
    const etapas = taxonomia?.etapas;
    const marcos = useMemo(() => listarMarcos(etapas ?? []), [etapas]);
    const [marcoSelecionado, setMarcoSelecionado] = useState(marcos[0]?.id ?? 0);
    const contextoPorMarco = new Map(marcos.map((marco) => [marco.id, marco]));
    const destinoNovo = marcoSelecionado
        ? `/admin/empreendimentos/${empreendimento.id}/taxonomia/marcos/${marcoSelecionado}/protocolos/novo`
        : undefined;
    const destinoGerenciar = marcoSelecionado
        ? `/admin/empreendimentos/${empreendimento.id}/taxonomia/marcos/${marcoSelecionado}/protocolos`
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
                    {destinoGerenciar && (
                        <Link className="ds-focus-ring inline-flex min-h-10 items-center rounded-md border border-border-control px-4 py-2 text-[13px] font-medium text-foreground no-underline hover:bg-surface-hover" to={destinoGerenciar}>Gerenciar protocolos</Link>
                    )}
                    {destinoNovo ? (
                        <Link className="ds-focus-ring inline-flex min-h-10 items-center rounded-md bg-action-primary px-4 py-2 text-[13px] font-semibold text-white no-underline hover:bg-action-primary-hover" to={destinoNovo}>+ Criar protocolo</Link>
                    ) : (
                        <span className="inline-flex min-h-10 cursor-not-allowed items-center rounded-md bg-action-primary px-4 py-2 text-[13px] font-semibold text-white opacity-50" aria-disabled="true">+ Criar protocolo</span>
                    )}
                </div>
            </header>

            {erroProtocolos && (
                <div className="flex items-start gap-3 rounded-md border border-warning-700/40 bg-warning-700/10 px-4 py-3 text-[12px] leading-5 text-foreground" role="status">
                    <i className="bi bi-exclamation-triangle mt-0.5 text-warning-700" aria-hidden="true" />
                    <div><strong className="text-foreground-strong">A listagem pode estar incompleta.</strong><p className="text-foreground-muted">{erroProtocolos}</p></div>
                </div>
            )}

            {erroTaxonomia ? (
                <EstadoMedicoesVazio
                    icone="bi-exclamation-triangle"
                    titulo="Não foi possível carregar a taxonomia"
                    descricao="A área de medições continua disponível, mas os marcos não puderam ser consultados agora."
                    acao={<Link className="ds-accent-link text-[13px] font-semibold" to={`/admin/empreendimentos/${empreendimento.id}/taxonomia`}>Abrir taxonomia</Link>}
                />
            ) : !taxonomia ? (
                <EstadoMedicoesVazio
                    icone="bi-tags"
                    titulo="Configure a taxonomia primeiro"
                    descricao="Os protocolos de medição precisam estar associados a um marco da taxonomia."
                    acao={<Link className="ds-accent-link text-[13px] font-semibold" to={`/admin/empreendimentos/${empreendimento.id}/taxonomia`}>Configurar taxonomia</Link>}
                />
            ) : marcos.length === 0 ? (
                <EstadoMedicoesVazio
                    icone="bi-flag"
                    titulo="Nenhum marco disponível"
                    descricao="Cadastre ao menos um marco na taxonomia para configurar protocolos de medição."
                    acao={<Link className="ds-accent-link text-[13px] font-semibold" to={`/admin/empreendimentos/${empreendimento.id}/taxonomia`}>Cadastrar marco</Link>}
                />
            ) : protocolos.length === 0 ? (
                <EstadoMedicoesVazio
                    icone="bi-ui-checks-grid"
                    titulo="Nenhum protocolo configurado"
                    descricao="Escolha um marco acima para criar o primeiro checklist de evidências."
                    acao={destinoNovo ? <Link className="ds-accent-link text-[13px] font-semibold" to={destinoNovo}>Criar primeiro protocolo</Link> : undefined}
                />
            ) : (
                <div className="grid gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-[14px] font-semibold text-foreground-strong">Protocolos cadastrados</h3>
                        <span className="text-[12px] text-foreground-muted">
                            {protocolos.length} {protocolos.length === 1 ? "protocolo" : "protocolos"}
                        </span>
                    </div>
                    <ul className="grid gap-3 lg:grid-cols-2">
                        {protocolos.map((protocolo) => {
                            const marco = contextoPorMarco.get(protocolo.marco_id);
                            return (
                                <li className="ds-panel grid gap-3 p-4" key={protocolo.id}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4 className="break-words text-[15px] font-semibold leading-6 text-foreground-strong">{protocolo.nome}</h4>
                                            <p className="font-overline text-overline uppercase text-foreground-muted">
                                                {marco ? `${marco.etapa} · ${marco.nome}` : `Marco #${protocolo.marco_id}`}
                                            </p>
                                        </div>
                                        <span className="ds-status ds-status--informativo">Protocolo</span>
                                    </div>
                                    <p className="break-words text-[13px] leading-5 text-foreground-muted">
                                        {protocolo.descricao || "Sem orientação adicional."}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-muted pt-3">
                                        <span className="text-[12px] text-foreground-muted">
                                            Mínimo de {protocolo.quantidade_minima} evidência(s) · {formatarDataEmpreendimento(protocolo.criado_em)}
                                        </span>
                                        <Link className="text-[13px] font-medium text-action-primary hover:underline" to={`/admin/empreendimentos/${empreendimento.id}/taxonomia/marcos/${protocolo.marco_id}/protocolos/${protocolo.id}`}>
                                            Abrir protocolo
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </section>
    );
}

function EstadoMedicoesVazio({ icone, titulo, descricao, acao }: { icone: string; titulo: string; descricao: string; acao?: ReactNode }) {
    return (
        <div className="ds-panel grid min-h-56 place-items-center p-8 text-center">
            <div className="max-w-md">
                <i className={`bi ${icone} text-[32px] text-accent`} aria-hidden="true" />
                <h3 className="mt-3 text-[16px] font-semibold text-foreground-strong">{titulo}</h3>
                <p className="mt-1 text-[13px] leading-5 text-foreground-muted">{descricao}</p>
                {acao && <div className="mt-3">{acao}</div>}
            </div>
        </div>
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
