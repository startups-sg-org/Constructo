import type { Etapa, Taxonomia } from "../../../features/empreendimentos/empreendimentos.service";
import type { EstadoRecurso } from "./visaoGeral.types";

type MacroetapasEmpreendimentoProps = {
    estado: EstadoRecurso;
    taxonomia: Taxonomia | null;
};

export default function MacroetapasEmpreendimento({ estado, taxonomia }: MacroetapasEmpreendimentoProps) {
    const etapas = taxonomia?.etapas ?? [];

    return (
        <section className="ds-panel grid gap-4 p-4" aria-labelledby="macroetapas-titulo">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border-muted pb-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-md bg-surface-hover text-[16px] text-foreground" aria-hidden="true">
                        <i className="bi bi-diagram-3" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-[16px] font-semibold leading-6 text-foreground-strong" id="macroetapas-titulo">Macroetapas construtivas</h2>
                        <p className="text-[12px] leading-5 text-foreground-muted">
                            {taxonomia?.nome || "Etapas configuradas na taxonomia do empreendimento"}
                        </p>
                    </div>
                </div>
                <span className="font-overline text-overline uppercase text-foreground-muted">Estrutura de trabalho</span>
            </header>

            <div aria-live="polite">
                {estado === "carregando" && <MensagemEstado>Carregando macroetapas…</MensagemEstado>}
                {estado === "ausente" && <MensagemEstado>Nenhuma taxonomia configurada para este empreendimento.</MensagemEstado>}
                {estado === "erro" && <MensagemEstado>Não foi possível carregar as macroetapas.</MensagemEstado>}
                {estado === "disponivel" && etapas.length === 0 && <MensagemEstado>Nenhuma macroetapa configurada na taxonomia.</MensagemEstado>}
                {estado === "disponivel" && etapas.length > 0 && (
                    <ol className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
                        {etapas.map((etapa, indice) => (
                            <li className="grid gap-3 rounded-md border border-border-control bg-surface-muted px-3 py-3" key={etapa.id}>
                                <div className="flex min-w-0 items-start gap-2">
                                    <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-status-pending-bg font-badge-compact text-badge-compact text-status-pending-fg">
                                        {indice + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="break-words font-code-sm text-[12px] font-medium uppercase leading-4 text-foreground-strong">{etapa.nome}</h3>
                                        <p className="mt-1 text-[12px] leading-4 text-foreground-muted">{formatarQuantidadeMarcos(contarMarcos(etapa))}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 border-t border-border-muted pt-2">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] leading-4 text-status-pending-fg">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                                        Progresso não consolidado
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}

function contarMarcos(etapa: Etapa): number {
    return (etapa.marcos?.length ?? 0)
        + (etapa.subetapas ?? []).reduce((total, subetapa) => total + contarMarcos(subetapa), 0);
}

function formatarQuantidadeMarcos(total: number): string {
    return `${total} ${total === 1 ? "marco configurado" : "marcos configurados"}`;
}

function MensagemEstado({ children }: { children: string }) {
    return <p className="rounded-md bg-surface-muted px-4 py-5 text-[13px] leading-5 text-foreground-muted" role="status">{children}</p>;
}
