import { useState } from "react";
import { useFetcher } from "react-router-dom";

import type { ItemProtocolo } from "../../../../features/evidencias/evidencias.service";
import type { ResultadoAcaoProtocolo } from "../../../../features/evidencias/protocolos.action";
import { ProtocolItem } from "./ProtocolItem";

type ProtocolItemListProps = {
    protocoloId?: number;
    itens: ItemProtocolo[];
    onChange: (itens: ItemProtocolo[]) => void;
};

/** Lista os itens do protocolo, permite alterar sua ordem e incluir novos registros. */
export function ProtocolItemList({ protocoloId, itens, onChange }: ProtocolItemListProps) {
    const fetcher = useFetcher<ResultadoAcaoProtocolo>();
    const [novoItem, setNovoItem] = useState({ nome: "", descricao: "", obrigatorio: true });
    const proximaOrdem = itens.length ? Math.max(...itens.map((item) => item.ordem)) + 1 : 0;
    const resultado = fetcher.data;

    const [ultimoResultado, setUltimoResultado] = useState(resultado);
    if (fetcher.state === "idle" && resultado !== ultimoResultado) {
        setUltimoResultado(resultado);
        if (resultado?.ok) setNovoItem({ nome: "", descricao: "", obrigatorio: true });
    }

    const alterarItem = (itemAtualizado: ItemProtocolo) => {
        onChange(itens.map((item) => item.id === itemAtualizado.id ? itemAtualizado : item));
    };

    return (
        <section className="protocol-items" aria-labelledby="protocol-items-title">
            <h3 id="protocol-items-title">Itens do checklist</h3>
            {!protocoloId ? (
                <p className="protocol-editor__hint">Salve o protocolo antes de adicionar itens ao checklist.</p>
            ) : (
                <>
                    <fetcher.Form method="post" className="protocol-items__new">
                        <input type="hidden" name="intencao" value="criar-item" />
                        <input type="hidden" name="ordem" value={proximaOrdem} />
                        <label>
                            Novo item
                            <input name="nome" value={novoItem.nome} onChange={(event) => setNovoItem({ ...novoItem, nome: event.target.value })} required />
                        </label>
                        <label>
                            Orientação
                            <input name="descricao" value={novoItem.descricao} onChange={(event) => setNovoItem({ ...novoItem, descricao: event.target.value })} />
                        </label>
                        <label className="protocol-item__required">
                            <input name="obrigatorio" type="checkbox" value="true" checked={novoItem.obrigatorio} onChange={(event) => setNovoItem({ ...novoItem, obrigatorio: event.target.checked })} />
                            Obrigatório
                        </label>
                        <button type="submit" disabled={fetcher.state !== "idle"}>{fetcher.state === "idle" ? "Adicionar item" : "Adicionando…"}</button>
                    </fetcher.Form>
                    {resultado && !resultado.ok && <p className="protocol-editor__error" role="alert">{resultado.erro}</p>}
                    <ol className="protocol-items__list">
                        {[...itens].sort((a, b) => a.ordem - b.ordem || a.id - b.id).map((item) => (
                            <ProtocolItem
                                key={item.id}
                                item={item}
                                onChange={alterarItem}
                            />
                        ))}
                    </ol>
                </>
            )}
        </section>
    );
}
