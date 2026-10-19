import { useState } from "react";
import { useFetcher } from "react-router-dom";

import type { ItemProtocolo } from "../../../../features/evidencias/evidencias.service";
import type { ResultadoAcaoProtocolo } from "../../../../features/evidencias/protocolos.action";
import { ProtocolItem } from "./ProtocolItem";

type ProtocolItemListProps = { protocoloId?: number; itens: ItemProtocolo[]; onChange: (itens: ItemProtocolo[]) => void };
const controle = "ds-dark-field bg-surface! text-[13px]!";

/** Lista os itens e fornece o formulário de inclusão na próxima ordem disponível. */
export function ProtocolItemList({ protocoloId, itens, onChange }: ProtocolItemListProps) {
    const fetcher = useFetcher<ResultadoAcaoProtocolo>();
    const [adicionando, setAdicionando] = useState(false);
    const [novoItem, setNovoItem] = useState({ nome: "", descricao: "", obrigatorio: true });
    const resultado = fetcher.data;
    const erro = resultado && !resultado.ok ? resultado : undefined;
    const proximaOrdem = itens.length ? Math.max(...itens.map((item) => item.ordem)) + 1 : 0;
    const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem || a.id - b.id);

    return (
        <section className="grid gap-4" aria-labelledby="protocol-items-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-semibold text-foreground-strong" id="protocol-items-title">Itens do checklist</h3>
                    <p className="mt-0.5 text-[12px] text-foreground-muted">{itens.length} {itens.length === 1 ? "item configurado" : "itens configurados"}</p>
                </div>
                {protocoloId && <button className="ds-focus-ring inline-flex min-h-9 items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-semibold text-accent hover:bg-surface-hover" type="button" onClick={() => setAdicionando((valor) => !valor)}><i className="bi bi-plus-lg" aria-hidden="true" /> Adicionar item</button>}
            </div>
            {!protocoloId ? (
                <p className="rounded-md border border-dashed border-border-control px-4 py-5 text-[12px] leading-5 text-foreground-muted">Salve o protocolo antes de adicionar itens ao checklist.</p>
            ) : (
                <>
                    {adicionando && (
                        <fetcher.Form method="post" className="grid gap-3 rounded-md border border-accent/50 bg-surface-selected p-3" noValidate>
                            <input type="hidden" name="intencao" value="criar-item" />
                            <input type="hidden" name="ordem" value={proximaOrdem} />
                            <p className="text-[13px] font-semibold text-foreground-strong">Novo item</p>
                            <label className="grid gap-1 text-[12px] font-medium text-foreground">Nome
                                <input className={controle} name="nome" value={novoItem.nome} onChange={(event) => setNovoItem({ ...novoItem, nome: event.target.value })} required aria-invalid={Boolean(erro?.campos?.nome)} />
                            </label>
                            <label className="grid gap-1 text-[12px] font-medium text-foreground">Orientação
                                <input className={controle} name="descricao" value={novoItem.descricao} onChange={(event) => setNovoItem({ ...novoItem, descricao: event.target.value })} />
                            </label>
                            <label className="flex min-h-9 items-center gap-2 text-[12px] font-medium text-foreground"><input className="h-4! min-h-0! w-4! accent-action-primary" name="obrigatorio" type="checkbox" value="true" checked={novoItem.obrigatorio} onChange={(event) => setNovoItem({ ...novoItem, obrigatorio: event.target.checked })} /> Obrigatório</label>
                            {erro?.erro && <p className="text-[12px] text-error" role="alert">{erro.erro}</p>}
                            <div className="flex justify-end gap-2">
                                <button className="min-h-9 rounded-md border border-border-control px-3 text-[12px] text-foreground" type="button" onClick={() => setAdicionando(false)}>Cancelar</button>
                                <button className="min-h-9 rounded-md bg-action-primary px-3 text-[12px] font-semibold text-white disabled:opacity-60" type="submit" disabled={fetcher.state !== "idle"}>{fetcher.state === "idle" ? "Adicionar item" : "Adicionando…"}</button>
                            </div>
                        </fetcher.Form>
                    )}
                    {ordenados.length === 0 ? <p className="rounded-md border border-dashed border-border-control px-4 py-5 text-center text-[12px] text-foreground-muted">Nenhum item configurado.</p> : (
                        <ol className="grid list-none gap-2 p-0">{ordenados.map((item, indice) => <ProtocolItem key={item.id} item={item} indice={indice + 1} onChange={(atualizado) => onChange(itens.map((existente) => existente.id === atualizado.id ? atualizado : existente))} />)}</ol>
                    )}
                </>
            )}
        </section>
    );
}
