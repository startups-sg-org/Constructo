import type { EstadoRecurso, ResumoEstrutura } from "./visaoGeral.types";

type ResumoAvancoFisicoProps = {
    estadoEstrutura: EstadoRecurso;
    resumoEstrutura: ResumoEstrutura | null;
};

const metricas = [
    { chave: "torres", rotulo: "Torres", icone: "bi-buildings" },
    { chave: "pavimentos", rotulo: "Pavimentos", icone: "bi-layers" },
    { chave: "unidades", rotulo: "Unidades", icone: "bi-door-open" },
] as const;

export default function ResumoAvancoFisico({
    estadoEstrutura,
    resumoEstrutura,
}: ResumoAvancoFisicoProps) {
    return (
        <section className="ds-panel grid gap-3 p-4" aria-labelledby="resumo-obra-titulo">
            <header className="flex items-center justify-between gap-3 border-b border-border-muted pb-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold leading-5 text-foreground-strong" id="resumo-obra-titulo">
                    <i className="bi bi-building" aria-hidden="true" />
                    Resumo da obra
                </h2>
                <span className="font-overline text-overline uppercase text-foreground-muted">Estrutura</span>
            </header>

            <div aria-live="polite">
                {estadoEstrutura === "carregando" && <MensagemEstado>Carregando estrutura…</MensagemEstado>}
                {estadoEstrutura === "erro" && <MensagemEstado>Não foi possível carregar o resumo da estrutura.</MensagemEstado>}
                {estadoEstrutura === "disponivel" && resumoEstrutura && (
                    <dl className="grid grid-cols-3 gap-2">
                        {metricas.map(({ chave, rotulo, icone }) => (
                            <div className="grid min-w-0 place-items-center gap-1 rounded-md bg-surface-muted px-2 py-3 text-center" key={chave}>
                                <i className={`bi ${icone} text-[16px] text-foreground-muted`} aria-hidden="true" />
                                <dd className="font-headline-lg text-headline-lg font-semibold text-foreground-strong">{resumoEstrutura[chave]}</dd>
                                <dt className="text-[12px] leading-4 text-foreground-muted">{rotulo}</dt>
                            </div>
                        ))}
                    </dl>
                )}
            </div>

            <div className="grid gap-3 rounded-md border border-border-control bg-surface-muted px-4 py-4" aria-labelledby="avanco-global-titulo">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[13px] font-medium leading-5 text-foreground-muted" id="avanco-global-titulo">Avanço físico global</h3>
                        <p className="mt-1 text-[20px] font-semibold leading-7 text-foreground-strong">Indisponível</p>
                    </div>
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-status-pending-fg/40 bg-status-pending-bg text-status-pending-fg" aria-hidden="true">
                        <i className="bi bi-graph-up-arrow" />
                    </span>
                </div>
                <p className="text-[12px] leading-5 text-foreground-muted">
                    A API ainda não fornece o percentual consolidado do empreendimento.
                </p>
            </div>
        </section>
    );
}

function MensagemEstado({ children }: { children: string }) {
    return <p className="rounded-md bg-surface-muted px-3 py-4 text-[13px] leading-5 text-foreground-muted" role="status">{children}</p>;
}
