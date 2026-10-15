type ProtocolHeaderProps = {
    protocoloId?: number;
    marcoId: number;
};

/** Identifica se o editor está criando um protocolo ou alterando um existente. */
export function ProtocolHeader({ protocoloId, marcoId }: ProtocolHeaderProps) {
    return (
        <header className="protocol-editor__header">
            <div>
                <p className="protocol-editor__eyebrow">Marco #{marcoId}</p>
                <h2 id="protocol-editor-title">{protocoloId ? "Editar protocolo de evidências" : "Novo protocolo de evidências"}</h2>
                <p>Defina os registros obrigatórios para comprovar a execução deste marco.</p>
            </div>
        </header>
    );
}
