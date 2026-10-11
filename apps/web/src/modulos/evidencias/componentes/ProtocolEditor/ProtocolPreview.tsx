import type { ItemProtocolo, ProtocoloEvidenciaDados } from "../../../../features/evidencias/evidencias.service";

type ProtocolPreviewProps = {
    dados: ProtocoloEvidenciaDados;
    itens: ItemProtocolo[];
};

/** Exibe a prévia a partir do mesmo estado controlado usado pelos formulários. */
export function ProtocolPreview({ dados, itens }: ProtocolPreviewProps) {
    const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem || a.id - b.id);

    return (
        <aside className="protocol-preview" aria-labelledby="protocol-preview-title">
            <p className="protocol-editor__eyebrow">Prévia do checklist</p>
            <h3 id="protocol-preview-title">{dados.nome || "Protocolo sem nome"}</h3>
            {dados.descricao && <p>{dados.descricao}</p>}
            <p>Mínimo de {dados.quantidade_minima} evidência(s).</p>
            {ordenados.length ? (
                <ol>
                    {ordenados.map((item) => (
                        <li key={item.id}>
                            <strong>{item.nome || "Item sem nome"}</strong>
                            {item.obrigatorio ? " — obrigatório" : " — opcional"}
                            {item.descricao && <span>: {item.descricao}</span>}
                        </li>
                    ))}
                </ol>
            ) : <p className="protocol-editor__hint">Nenhum item configurado.</p>}
        </aside>
    );
}
