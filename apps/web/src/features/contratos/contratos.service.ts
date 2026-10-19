import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export type ContratoResumo = {
    id: string;
    empreendimento_id: number;
    contratante: { id: string; nome_fantasia: string };
    contratado: { id: string; nome_fantasia: string };
    descricao: string;
    objeto: string;
    valor_total: string;
    status: "ativo" | "inativo" | "finalizado";
    iniciado_em: string;
    finalizado_em: string | null;
};

export function listarContratosEmpreendimento(
    empreendimentoId: number,
    options?: ServiceRequestOptions,
): Promise<ContratoResumo[]> {
    return apiRequest<ContratoResumo[]>(
        `/contratos/?empreendimento_id=${empreendimentoId}`,
        { signal: options?.signal },
    );
}
