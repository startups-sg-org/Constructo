import type {
    ProtocoloEvidencia,
    ProtocoloEvidenciaStatus,
} from "../../features/evidencias/evidencias.service";
import "./EvidenceChecklist.css";

type EvidenceChecklistProps = {
    protocolo: ProtocoloEvidencia;
    status: ProtocoloEvidenciaStatus;
    itemSelecionadoId?: number | null;
    onSelecionarItem?: (itemId: number) => void;
};

export default function EvidenceChecklist({
    protocolo,
    status,
    itemSelecionadoId = null,
    onSelecionarItem,
}: EvidenceChecklistProps) {
    const pendentes = new Set(status.itens_pendentes.map((item) => item.id));
    const percentual = status.quantidade_minima > 0
        ? Math.min(100, Math.round((status.evidencias_registradas / status.quantidade_minima) * 100))
        : 100;

    return (
        <section className="evidence-checklist" aria-labelledby={`protocolo-${protocolo.id}`}>
            <header className="evidence-checklist__cabecalho">
                <div>
                    <p className="evidence-checklist__etiqueta">Protocolo de evidências</p>
                    <h2 id={`protocolo-${protocolo.id}`}>{protocolo.nome}</h2>
                </div>
                <strong className="evidence-checklist__quantidade">
                    {status.evidencias_registradas} / {status.quantidade_minima}
                </strong>
            </header>
            <div className="evidence-checklist__progresso" aria-label={`${percentual}% do mínimo registrado`}>
                <div className="evidence-checklist__barra"><span style={{ width: `${percentual}%` }} /></div>
                <span>{percentual}% do mínimo registrado</span>
            </div>
            <ul className="evidence-checklist__itens">
                {protocolo.itens.map((item) => {
                    const pendente = pendentes.has(item.id);
                    const selecionado = itemSelecionadoId === item.id;
                    const conteudo = (
                        <>
                            <span className="evidence-checklist__icone" aria-hidden="true">
                                {pendente ? "□" : "✓"}
                            </span>
                            <span className="evidence-checklist__nome">{item.nome}</span>
                            {item.obrigatorio && <span className="evidence-checklist__obrigatorio">Obrigatório</span>}
                        </>
                    );
                    return (
                        <li
                            className={`evidence-checklist__item${pendente ? " evidence-checklist__item--pendente" : ""}${selecionado ? " evidence-checklist__item--selecionado" : ""}`}
                            key={item.id}
                        >
                            {onSelecionarItem ? (
                                <button type="button" onClick={() => onSelecionarItem(item.id)}>{conteudo}</button>
                            ) : <div>{conteudo}</div>}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
