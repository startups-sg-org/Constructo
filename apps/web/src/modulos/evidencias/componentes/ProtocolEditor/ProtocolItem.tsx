import { useFetcher } from "react-router-dom";

import type { ItemProtocolo } from "../../../../features/evidencias/evidencias.service";
import type { ResultadoAcaoProtocolo } from "../../../../features/evidencias/protocolos.action";

type ProtocolItemProps = { item: ItemProtocolo; indice: number; onChange: (item: ItemProtocolo) => void };
const controle = "ds-dark-field bg-surface! text-[13px]!";

/** Edita, ordena e remove um item persistido do checklist. */
export function ProtocolItem({ item, indice, onChange }: ProtocolItemProps) {
    const fetcher = useFetcher<ResultadoAcaoProtocolo>();
    const resultado = fetcher.data;
    const erro = resultado && !resultado.ok ? resultado : undefined;
    const atualizar = <Campo extends keyof ItemProtocolo>(nome: Campo, valor: ItemProtocolo[Campo]) => onChange({ ...item, [nome]: valor });

    return (
        <li className="rounded-md border border-border-control bg-surface-muted p-3">
            <fetcher.Form method="post" className="grid gap-3" noValidate>
                <input type="hidden" name="item_id" value={item.id} />
                <div className="flex items-center justify-between gap-3">
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-md bg-surface-hover text-[12px] font-semibold text-foreground-muted">{indice}</span>
                    <span className={item.obrigatorio ? "ds-status ds-status--alerta" : "ds-status ds-status--neutro"}>{item.obrigatorio ? "Obrigatório" : "Opcional"}</span>
                </div>
                <label className="grid gap-1 text-[12px] font-medium text-foreground">Item
                    <input className={controle} name="nome" value={item.nome} onChange={(event) => atualizar("nome", event.target.value)} required aria-invalid={Boolean(erro?.campos?.nome)} />
                    {erro?.campos?.nome && <span className="text-error">{erro.campos.nome}</span>}
                </label>
                <label className="grid gap-1 text-[12px] font-medium text-foreground">Orientação
                    <input className={controle} name="descricao" value={item.descricao ?? ""} onChange={(event) => atualizar("descricao", event.target.value || null)} />
                </label>
                <div className="grid gap-3 sm:grid-cols-[110px_1fr] sm:items-end">
                    <label className="grid gap-1 text-[12px] font-medium text-foreground">Ordem
                        <input className={controle} name="ordem" type="number" min="0" step="1" value={item.ordem} onChange={(event) => atualizar("ordem", Number(event.target.value))} required aria-invalid={Boolean(erro?.campos?.ordem)} />
                    </label>
                    <label className="flex min-h-10 items-center gap-2 text-[12px] font-medium text-foreground">
                        <input className="h-4! min-h-0! w-4! accent-action-primary" name="obrigatorio" type="checkbox" value="true" checked={item.obrigatorio} onChange={(event) => atualizar("obrigatorio", event.target.checked)} /> Obrigatório
                    </label>
                </div>
                {erro?.erro && <p className="text-[12px] text-error" role="alert">{erro.erro}</p>}
                <div className="flex flex-wrap justify-end gap-2">
                    <button className="ds-focus-ring min-h-9 rounded-md border border-error/40 px-3 py-1.5 text-[12px] font-medium text-error hover:bg-error/10" type="submit" name="intencao" value="remover-item" disabled={fetcher.state !== "idle"}><i className="bi bi-trash" aria-hidden="true" /> Remover</button>
                    <button className="ds-focus-ring min-h-9 rounded-md border border-border-control bg-surface-hover px-3 py-1.5 text-[12px] font-semibold text-foreground hover:border-accent" type="submit" name="intencao" value="editar-item" disabled={fetcher.state !== "idle"}>{fetcher.state === "idle" ? "Salvar item" : "Salvando…"}</button>
                </div>
            </fetcher.Form>
        </li>
    );
}
