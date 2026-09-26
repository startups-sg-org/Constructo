import type {
    AtualizacaoEmpreendimentoData,
    Empreendimento,
    EmpreendimentoFormData,
    LocalObra,
    LocalRaizFormData,
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

export function listarLocaisRaiz(
    empreendimentoId: number,
    options?: ServiceRequestOptions,
): Promise<LocalObra[]> {
    return apiRequest<LocalObra[]>(`/empreendimentos/${empreendimentoId}/locais`, {
        signal: options?.signal,
    });
}

export function criarLocalRaiz(
    empreendimentoId: number,
    dados: LocalRaizFormData,
    options?: ServiceRequestOptions,
): Promise<LocalObra> {
    return apiRequest<LocalObra>(`/empreendimentos/${empreendimentoId}/locais`, {
        method: "POST",
        body: JSON.stringify(dados),
        signal: options?.signal,
    });
}
