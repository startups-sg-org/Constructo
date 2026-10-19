import type { ProtocoloEvidenciaResumo } from "../../../features/evidencias/evidencias.service";
import type { EstadoRecurso } from "./visaoGeral.types";

type AtividadeRecenteEmpreendimentoProps = {
    estado: EstadoRecurso;
    protocolos: ProtocoloEvidenciaResumo[];
};

export default function AtividadeRecenteEmpreendimento({
    estado,
    protocolos,
}: AtividadeRecenteEmpreendimentoProps) {
    return (
        <section className="ds-panel grid gap-4 p-4" aria-labelledby="atividade-recente-titulo">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted pb-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold leading-5 text-foreground-strong" id="atividade-recente-titulo">
                    <i className="bi bi-clock-history text-success-700" aria-hidden="true" />
                    Atividade recente
                </h2>
                <span className="rounded-sm bg-surface-muted px-2 py-1 font-code-sm text-[11px] leading-4 text-foreground-muted">Protocolos recentes</span>
            </header>

            <div aria-live="polite">
                {estado === "carregando" && <MensagemEstado>Carregando atividade recente…</MensagemEstado>}
                {estado === "erro" && <MensagemEstado>Não foi possível carregar os protocolos recentes.</MensagemEstado>}
                {estado === "disponivel" && protocolos.length === 0 && <MensagemEstado>Nenhum protocolo criado recentemente.</MensagemEstado>}
                {estado === "disponivel" && protocolos.length > 0 && (
                    <ul className="grid gap-2">
                        {protocolos.map((protocolo) => (
                            <li className="flex min-w-0 items-start gap-3 rounded-md border border-border-control bg-surface-muted px-3 py-3 transition-colors hover:bg-surface-hover max-sm:flex-wrap" key={protocolo.id}>
                                <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-status-progress-fg" aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <strong className="block break-words text-[13px] font-medium leading-5 text-foreground-strong">Protocolo {protocolo.nome} criado</strong>
                                    {protocolo.descricao && <p className="mt-0.5 break-words text-[12px] leading-5 text-foreground-muted">{protocolo.descricao}</p>}
                                    <span className="mt-1 block font-overline text-overline uppercase text-foreground-muted">Protocolo de evidências</span>
                                </div>
                                <time className="flex-none font-code-sm text-[11px] leading-4 text-foreground-muted max-sm:w-full max-sm:pl-5" dateTime={protocolo.criado_em}>
                                    {formatarDataHora(protocolo.criado_em)}
                                </time>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

function formatarDataHora(data: string): string {
    const valor = new Date(data);
    if (Number.isNaN(valor.getTime())) return "Data indisponível";

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
    }).format(valor);
}

function MensagemEstado({ children }: { children: string }) {
    return <p className="rounded-md bg-surface-muted px-4 py-5 text-[13px] leading-5 text-foreground-muted" role="status">{children}</p>;
}
