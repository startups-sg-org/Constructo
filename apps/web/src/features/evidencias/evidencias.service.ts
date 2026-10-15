import { apiRequest, type ServiceRequestOptions } from "../../services/api";
import { API_URL } from "../../services/api";
import type {
    Evidencia,
    FiltrosEvidencia,
} from "../../modulos/evidencias/types";

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

export function listarEvidencias(
    empreendimentoId: number,
    filtros: FiltrosEvidencia = {},
    options?: ServiceRequestOptions,
): Promise<Evidencia[]> {
    const parametros = new URLSearchParams();

    if (filtros.localObraId) {
        parametros.set("local_obra_id", String(filtros.localObraId));
    }
    if (filtros.marcoId) {
        parametros.set("marco_id", String(filtros.marcoId));
    }
    if (filtros.dataCapturaInicio) {
        parametros.set("data_captura_inicio", filtros.dataCapturaInicio);
    }
    if (filtros.dataCapturaFim) {
        parametros.set("data_captura_fim", filtros.dataCapturaFim);
    }

    const query = parametros.toString();
    return apiRequest<Evidencia[]>(
        `/empreendimentos/${empreendimentoId}/evidencias${query ? `?${query}` : ""}`,
        { signal: options?.signal },
    );
}

export function resolverUrlEvidencia(caminho: string): string {
    if (/^(https?:|data:|blob:)/.test(caminho)) return caminho;
    return `${API_URL}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}
