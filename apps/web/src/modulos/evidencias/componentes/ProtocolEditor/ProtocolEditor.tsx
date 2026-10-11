import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

import type { ItemProtocolo, ProtocoloEvidenciaDados } from "../../../../features/evidencias/evidencias.service";
import type { carregarProtocoloEditor } from "../../../../features/evidencias/protocolos.loader";
import { ProtocolForm } from "./ProtocolForm";
import { ProtocolHeader } from "./ProtocolHeader";
import { ProtocolItemList } from "./ProtocolItemList";
import { ProtocolPreview } from "./ProtocolPreview";
import "./ProtocolEditor.css";

const DADOS_INICIAIS: ProtocoloEvidenciaDados = {
    nome: "",
    descricao: null,
    quantidade_minima: 0,
};

/**
 * Coordena edição e prévia do protocolo com um único estado de rascunho.
 * Usa os dados revalidados pelo loader após as alterações.
 */
export default function ProtocolEditor() {
    const { empreendimentoId, marcoId, protocolo } = useLoaderData<typeof carregarProtocoloEditor>();
    const [dados, setDados] = useState<ProtocoloEvidenciaDados>(protocolo ?? DADOS_INICIAIS);
    const [itens, setItens] = useState<ItemProtocolo[]>(protocolo?.itens ?? []);
    const protocoloId = protocolo?.id;
    const versaoPersistida = JSON.stringify(protocolo);
    const [anterior, setAnterior] = useState(versaoPersistida);

    if (anterior !== versaoPersistida) {
        setAnterior(versaoPersistida);
        setDados(protocolo ?? DADOS_INICIAIS);
        setItens(protocolo?.itens ?? []);
    }

    return (
        <section className="protocol-editor" aria-labelledby="protocol-editor-title">
            <Link to={`/admin/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos`}>Voltar aos protocolos</Link>
            <ProtocolHeader protocoloId={protocoloId} marcoId={marcoId} />
            <div className="protocol-editor__content">
                <div className="protocol-editor__forms">
                    <ProtocolForm dados={dados} protocoloId={protocoloId} onChange={setDados} />
                    <ProtocolItemList protocoloId={protocoloId} itens={itens} onChange={setItens} />
                </div>
                <ProtocolPreview dados={dados} itens={itens} />
            </div>
        </section>
    );
}
