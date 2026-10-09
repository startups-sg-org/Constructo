import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export const TAMANHO_MAXIMO_EVIDENCIA = 5 * 1024 * 1024;
export const TIPOS_EVIDENCIA_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

export type EvidenciaUpload = {
    id: number;
    empreendimento_id: number;
    nome: string;
    caminho: string;
    url: string;
    tamanho: number;
    tipo_mime: string;
    criado_em: string;
};

export function enviarEvidencia(
    empreendimentoId: number,
    arquivo: File,
    options?: ServiceRequestOptions,
): Promise<EvidenciaUpload> {
    const dados = new FormData();
    dados.append("empreendimento_id", String(empreendimentoId));
    dados.append("file", arquivo);

    return apiRequest<EvidenciaUpload>("/api/evidences/upload", {
        method: "POST",
        body: dados,
        signal: options?.signal,
    });
}
