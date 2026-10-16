import { useRef, useState, type ChangeEvent } from "react";

import {
    enviarEvidenciaParaItem,
    type ProtocoloEvidencia,
    type ProtocoloEvidenciaStatus,
} from "../../features/evidencias/evidencias.service";
import { ApiError } from "../../services/api";
import EvidenceChecklist from "./EvidenceChecklist";

type EvidenceChecklistUploaderProps = {
    empreendimentoId: number;
    marcoId: number;
    progressoMarcoId: number;
    protocolo: ProtocoloEvidencia;
    status: ProtocoloEvidenciaStatus;
    onAtualizar: () => void | Promise<void>;
};

export default function EvidenceChecklistUploader({
    empreendimentoId,
    marcoId,
    progressoMarcoId,
    protocolo,
    status,
    onAtualizar,
}: EvidenceChecklistUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [itemSelecionadoId, setItemSelecionadoId] = useState<number | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    function selecionarArquivo(evento: ChangeEvent<HTMLInputElement>) {
        const arquivo = evento.target.files?.[0];
        evento.target.value = "";
        if (!arquivo || itemSelecionadoId === null) return;

        setEnviando(true);
        setErro(null);
        void enviarEvidenciaParaItem(
            empreendimentoId,
            marcoId,
            protocolo.id,
            itemSelecionadoId,
            progressoMarcoId,
            arquivo,
        )
            .then(onAtualizar)
            .catch((error: unknown) => {
                setErro(error instanceof ApiError ? error.message : "Não foi possível registrar a evidência.");
            })
            .finally(() => setEnviando(false));
    }

    return (
        <div>
            <EvidenceChecklist
                protocolo={protocolo}
                status={status}
                itemSelecionadoId={itemSelecionadoId}
                onSelecionarItem={setItemSelecionadoId}
            />
            {itemSelecionadoId !== null && (
                <div className="barra-acoes">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={selecionarArquivo}
                        disabled={enviando}
                        hidden
                    />
                    <button
                        className="botao primario"
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={enviando}
                    >
                        {enviando ? "Registrando..." : "Adicionar evidência ao item"}
                    </button>
                </div>
            )}
            {erro && <p className="feedback-painel feedback-painel--erro" role="alert">{erro}</p>}
        </div>
    );
}
