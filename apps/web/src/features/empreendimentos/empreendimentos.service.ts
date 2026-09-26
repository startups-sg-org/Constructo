import type {
    AtualizacaoEmpreendimentoData,
    Empreendimento,
    EmpreendimentoFormData,
} from "@constructo/shared";

import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export function criarEmpreendimento(
    dados: EmpreendimentoFormData,
    options?: ServiceRequestOptions,
): Promise<Empreendimento> {
    return apiRequest<Empreendimento>("/empreendimentos/", {
        method: "POST",
        body: JSON.stringify(dados),
        signal: options?.signal,
    });
}

export function listarEmpreendimentos(
    options?: ServiceRequestOptions,
): Promise<Empreendimento[]> {
    return apiRequest<Empreendimento[]>("/empreendimentos/", {
        signal: options?.signal,
    });
}

export function obterEmpreendimento(
    empreendimentoId: number,
    options?: ServiceRequestOptions,
): Promise<Empreendimento> {
    return apiRequest<Empreendimento>(`/empreendimentos/${empreendimentoId}`, {
        signal: options?.signal,
    });
}

export function atualizarEmpreendimento(
    empreendimentoId: number,
    dados: AtualizacaoEmpreendimentoData,
    options?: ServiceRequestOptions,
): Promise<Empreendimento> {
    return apiRequest<Empreendimento>(`/empreendimentos/${empreendimentoId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
        signal: options?.signal,
    });
}
