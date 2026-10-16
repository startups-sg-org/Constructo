import { useFetcher } from "react-router-dom";

import type { ProtocoloEvidenciaDados } from "../../../../features/evidencias/evidencias.service";
import type { ResultadoAcaoProtocolo } from "../../../../features/evidencias/protocolos.action";

type ProtocolFormProps = {
    dados: ProtocoloEvidenciaDados;
    protocoloId?: number;
    onChange: (dados: ProtocoloEvidenciaDados) => void;
};

/** Formulário controlado para os dados gerais do protocolo. */
export function ProtocolForm({ dados, protocoloId, onChange }: ProtocolFormProps) {
    const fetcher = useFetcher<ResultadoAcaoProtocolo>();
    const resultado = fetcher.data;

    const atualizar = (campo: keyof ProtocoloEvidenciaDados, valor: string | number | null) => {
        onChange({ ...dados, [campo]: valor });
    };

    return (
        <fetcher.Form method="post" className="protocol-form">
            <input type="hidden" name="intencao" value={protocoloId ? "editar-protocolo" : "criar-protocolo"} />
            <label>
                Nome
                <input
                    name="nome"
                    value={dados.nome}
                    onChange={(event) => atualizar("nome", event.target.value)}
                    maxLength={200}
                    required
                />
            </label>
            <label>
                Descrição
                <textarea
                    name="descricao"
                    value={dados.descricao ?? ""}
                    onChange={(event) => atualizar("descricao", event.target.value || null)}
                    rows={3}
                />
            </label>
            <label>
                Quantidade mínima de evidências
                <input
                    name="quantidade_minima"
                    type="number"
                    min="0"
                    value={dados.quantidade_minima}
                    onChange={(event) => atualizar("quantidade_minima", Number(event.target.value))}
                    required
                />
            </label>
            {resultado && !resultado.ok && <p className="protocol-editor__error" role="alert">{resultado.erro}</p>}
            <button type="submit" disabled={fetcher.state !== "idle"}>
                {fetcher.state === "idle" ? (protocoloId ? "Salvar protocolo" : "Criar protocolo") : "Salvando…"}
            </button>
        </fetcher.Form>
    );
}
