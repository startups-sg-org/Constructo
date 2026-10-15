import { useFetcher } from "react-router-dom";

import type { ItemProtocolo } from "../../../../features/evidencias/evidencias.service";
import type { ResultadoAcaoProtocolo } from "../../../../features/evidencias/protocolos.action";

type ProtocolItemProps = {
    item: ItemProtocolo;
    onChange: (item: ItemProtocolo) => void;
};

/** Edita ou remove um item; o loader revalida a lista após persistir. */
export function ProtocolItem({ item, onChange }: ProtocolItemProps) {
    const fetcher = useFetcher<ResultadoAcaoProtocolo>();
    const resultado = fetcher.data;

    const atualizar = <Campo extends keyof ItemProtocolo>(campo: Campo, valor: ItemProtocolo[Campo]) => {
        onChange({ ...item, [campo]: valor });
    };

    return (
        <li className="protocol-item">
            <fetcher.Form method="post" className="protocol-item__form">
                <input type="hidden" name="intencao" value="editar-item" />
                <input type="hidden" name="item_id" value={item.id} />
                <label>
                    Item
                    <input name="nome" value={item.nome} onChange={(event) => atualizar("nome", event.target.value)} required />
                </label>
                <label>
                    Orientação
                    <input name="descricao" value={item.descricao ?? ""} onChange={(event) => atualizar("descricao", event.target.value || null)} />
                </label>
                <label>
                    Ordem
                    <input name="ordem" type="number" min="0" value={item.ordem} onChange={(event) => atualizar("ordem", Number(event.target.value))} required />
                </label>
                <label className="protocol-item__required">
                    <input name="obrigatorio" type="checkbox" value="true" checked={item.obrigatorio} onChange={(event) => atualizar("obrigatorio", event.target.checked)} />
                    Obrigatório
                </label>
                <button type="submit" disabled={fetcher.state !== "idle"}>Salvar item</button>
                {resultado && !resultado.ok && <p className="protocol-editor__error" role="alert">{resultado.erro}</p>}
            </fetcher.Form>
            <fetcher.Form method="post" className="protocol-item__remove">
                <input type="hidden" name="intencao" value="remover-item" />
                <input type="hidden" name="item_id" value={item.id} />
                <button type="submit" disabled={fetcher.state !== "idle"}>Remover</button>
            </fetcher.Form>
        </li>
    );
}
