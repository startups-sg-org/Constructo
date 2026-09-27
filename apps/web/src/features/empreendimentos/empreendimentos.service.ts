import type {
    AtualizacaoEmpreendimentoData,
    AtualizacaoLocalData,
    Empreendimento,
    EmpreendimentoFormData,
    EstruturaLocal,
    LocalObra,
    LocalRaizFormData,
    PavimentoFormData,
    UnidadeFormData,
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

export function obterEstruturaFisica(
    empreendimentoId: number,
    options?: ServiceRequestOptions,
): Promise<EstruturaLocal[]> {
    return apiRequest<EstruturaLocal[]>(
        `/empreendimentos/${empreendimentoId}/estrutura-fisica`,
        { signal: options?.signal },
    );
}

export function atualizarLocal(
    empreendimentoId: number,
    localId: number,
    dados: AtualizacaoLocalData,
    options?: ServiceRequestOptions,
): Promise<LocalObra> {
    return apiRequest<LocalObra>(`/empreendimentos/${empreendimentoId}/locais/${localId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
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

export function listarPavimentos(
    empreendimentoId: number,
    parentId: number,
    options?: ServiceRequestOptions,
): Promise<LocalObra[]> {
    return apiRequest<LocalObra[]>(
        `/empreendimentos/${empreendimentoId}/locais/${parentId}/pavimentos`,
        { signal: options?.signal },
    );
}

export function criarPavimento(
    empreendimentoId: number,
    parentId: number,
    dados: PavimentoFormData,
    options?: ServiceRequestOptions,
): Promise<LocalObra> {
    return apiRequest<LocalObra>(
        `/empreendimentos/${empreendimentoId}/locais/${parentId}/pavimentos`,
        {
            method: "POST",
            body: JSON.stringify(dados),
            signal: options?.signal,
        },
    );
}

export function listarUnidades(
    empreendimentoId: number,
    parentId: number,
    options?: ServiceRequestOptions,
): Promise<LocalObra[]> {
    return apiRequest<LocalObra[]>(
        `/empreendimentos/${empreendimentoId}/locais/${parentId}/unidades`,
        { signal: options?.signal },
    );
}

export function criarUnidade(
    empreendimentoId: number,
    parentId: number,
    dados: UnidadeFormData,
    options?: ServiceRequestOptions,
): Promise<LocalObra> {
    return apiRequest<LocalObra>(
        `/empreendimentos/${empreendimentoId}/locais/${parentId}/unidades`,
        {
            method: "POST",
            body: JSON.stringify(dados),
            signal: options?.signal,
        },
    );
}
