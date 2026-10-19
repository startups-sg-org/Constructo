import type { ItemProtocolo, ProtocoloEvidenciaDados } from "../../../../features/evidencias/evidencias.service";

type ProtocolPreviewProps = { dados: ProtocoloEvidenciaDados; itens: ItemProtocolo[] };

/** Prévia fiel ao rascunho, sem inventar um estado de conclusão operacional. */
export function ProtocolPreview({ dados, itens }: ProtocolPreviewProps) {
    const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem || a.id - b.id);
    const obrigatorios = ordenados.filter((item) => item.obrigatorio).length;

    return (
        <aside className="ds-panel grid min-w-0 gap-4 p-4 lg:sticky lg:top-4" aria-labelledby="protocol-preview-title">
            <div className="border-b border-border-muted pb-3">
                <p className="text-overline font-medium uppercase tracking-[0.08em] text-foreground-muted"><i className="bi bi-eye mr-1" aria-hidden="true" /> Pré-visualização</p>
                <h3 className="mt-2 break-words text-[16px] font-semibold text-foreground-strong" id="protocol-preview-title">{dados.nome || "Protocolo sem nome"}</h3>
                <p className="mt-1 break-words text-[12px] leading-5 text-foreground-muted">{dados.descricao || "Sem descrição informada."}</p>
            </div>
            <div className="grid gap-2">
                {ordenados.length ? ordenados.map((item, indice) => (
                    <div className="flex items-start gap-2 rounded-md border border-border-muted bg-surface-muted px-3 py-2.5" key={item.id}>
                        <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-sm border border-border-control text-[9px] text-foreground-muted">{indice + 1}</span>
                        <div className="min-w-0">
                            <p className="break-words text-[12px] font-medium text-foreground">{item.nome || "Item sem nome"}</p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-foreground-muted">{item.obrigatorio ? "Obrigatório" : "Opcional"}</p>
                        </div>
                    </div>
                )) : <p className="rounded-md border border-dashed border-border-control px-3 py-5 text-center text-[12px] text-foreground-muted">Nenhum item configurado.</p>}
            </div>
            <dl className="grid gap-2 border-t border-border-muted pt-3 text-[12px]">
                <div className="flex justify-between gap-3"><dt className="text-foreground-muted">Itens</dt><dd className="font-medium text-foreground">{itens.length}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-foreground-muted">Obrigatórios</dt><dd className="font-medium text-foreground">{obrigatorios}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-foreground-muted">Mínimo de evidências</dt><dd className="font-medium text-foreground">{dados.quantidade_minima}</dd></div>
            </dl>
            <p className="rounded-md bg-surface-hover px-3 py-2 text-[11px] leading-4 text-foreground-muted"><i className="bi bi-info-circle mr-1 text-accent" aria-hidden="true" /> O atendimento será calculado ao registrar evidências no progresso do marco.</p>
        </aside>
    );
}
