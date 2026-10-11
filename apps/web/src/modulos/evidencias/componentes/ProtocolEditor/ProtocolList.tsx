import { Link, useLoaderData } from "react-router-dom";
import type { carregarProtocoloEditor } from "../../../../features/evidencias/protocolos.loader";

/** Lista os protocolos do marco e oferece acesso à criação e edição. */
export default function ProtocolList() {
    const { empreendimentoId, marcoId, protocolos } = useLoaderData<typeof carregarProtocoloEditor>();
    const base = `/admin/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos`;
    return <section>
        <h2>Protocolos de evidências — Marco #{marcoId}</h2>
        <p><Link to={`/admin/empreendimentos/${empreendimentoId}/taxonomia`}>Voltar à taxonomia</Link></p>
        <Link to={`${base}/novo`}>Criar protocolo</Link>
        {protocolos.length === 0 ? <p>Nenhum protocolo cadastrado neste marco.</p> :
            <ul>{protocolos.map((protocolo) => <li key={protocolo.id}>
                <h3>{protocolo.nome}</h3>
                <p>{protocolo.descricao}</p>
                <p>Mínimo: {protocolo.quantidade_minima} evidência(s) · {protocolo.itens.length} item(ns)</p>
                <Link to={`${base}/${protocolo.id}`}>Editar {protocolo.nome}</Link>
            </li>)}</ul>}
    </section>;
}
