import { Link } from "react-router-dom";

type ProtocolHeaderProps = { baseProtocolos: string; empreendimentoId: number; marcoId: number };

/** Cabeçalho do gerenciador, com contexto do marco e ação primária. */
export function ProtocolHeader({ baseProtocolos, empreendimentoId, marcoId }: ProtocolHeaderProps) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border-muted pb-4">
            <div className="min-w-0">
                <Link className="ds-focus-ring-offset inline-flex items-center gap-1 rounded-sm text-[12px] text-foreground-muted no-underline hover:text-accent" to={`/admin/empreendimentos/${empreendimentoId}/medicoes`}>
                    <i className="bi bi-arrow-left" aria-hidden="true" /> Voltar às medições
                </Link>
                <h2 className="mt-2 text-[22px] font-semibold leading-7 text-foreground-strong" id="protocol-editor-title">Protocolos de medição</h2>
                <p className="mt-1 text-[13px] leading-5 text-foreground-muted">Configure os checklists de evidências do marco #{marcoId}.</p>
            </div>
            <Link className="ds-focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-action-primary px-4 py-2 text-[13px] font-semibold text-white no-underline hover:bg-action-primary-hover" to={`${baseProtocolos}/novo`}>
                <i className="bi bi-plus-lg" aria-hidden="true" /> Criar protocolo
            </Link>
        </header>
    );
}
