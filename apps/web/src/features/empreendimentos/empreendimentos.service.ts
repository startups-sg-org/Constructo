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

export type Marco = {
    id: number;
    etapa_id: number;
    nome: string;
    ordem: number;
    descricao_tecnica?: string | null;
    descricao_cliente?: string | null;
};

export type Etapa = {
    id: number;
    taxonomia_id: number;
    parent_id?: number | null;
    nome: string;
    ordem: number;
    descricao_tecnica?: string | null;
    descricao_cliente?: string | null;
    marcos?: Marco[];
    subetapas?: Etapa[];
};

export type Taxonomia = {
    id: number;
    nome: string;
    descricao?: string | null;
    empreendimento_id?: number | null;
    origem_taxonomia_id?: number | null;
    is_padrao: boolean;
    etapas?: Etapa[];
};

export function obterTaxonomia(empreendimentoId: number, options?: ServiceRequestOptions) {
    return apiRequest<Taxonomia>(`/empreendimentos/${empreendimentoId}/taxonomia`, {
        signal: options?.signal,
    });
}

export function listarTaxonomiasDisponiveis(options?: ServiceRequestOptions) {
    return apiRequest<Taxonomia[]>("/empreendimentos/taxonomias/disponiveis", {
        signal: options?.signal,
    });
}

export function configurarTaxonomia(
    empreendimentoId: number,
    dados: { origem_taxonomia_id: number; nome?: string; descricao?: string },
    options?: ServiceRequestOptions,
) {
    return apiRequest<Taxonomia>(`/empreendimentos/${empreendimentoId}/taxonomia/configurar`, {
        method: "POST",
        body: JSON.stringify(dados),
        signal: options?.signal,
    });
}

export function listarEtapasTaxonomia(
    empreendimentoId: number,
    parentId?: number,
    options?: ServiceRequestOptions,
) {
    const query = parentId === undefined ? "" : `?parent_id=${parentId}`;
    return apiRequest<Etapa[]>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas${query}`,
        { signal: options?.signal },
    );
}

export function listarMarcosTaxonomia(
    empreendimentoId: number,
    etapaId: number,
    options?: ServiceRequestOptions,
) {
    return apiRequest<Marco[]>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas/${etapaId}/marcos`,
        { signal: options?.signal },
    );
}

export function criarEtapaTaxonomia(
    empreendimentoId: number,
    dados: Omit<Etapa, "id" | "taxonomia_id" | "marcos" | "subetapas">,
    options?: ServiceRequestOptions,
) {
    return apiRequest<Etapa>(`/empreendimentos/${empreendimentoId}/taxonomia/etapas`, {
        method: "POST",
        body: JSON.stringify(dados),
        signal: options?.signal,
    });
}

export function atualizarEtapaTaxonomia(
    empreendimentoId: number,
    etapaId: number,
    dados: Partial<Omit<Etapa, "id" | "taxonomia_id" | "marcos" | "subetapas">>,
    options?: ServiceRequestOptions,
) {
    return apiRequest<Etapa>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas/${etapaId}`,
        { method: "PATCH", body: JSON.stringify(dados), signal: options?.signal },
    );
}

export function criarMarcoTaxonomia(
    empreendimentoId: number,
    etapaId: number,
    dados: Omit<Marco, "id" | "etapa_id">,
    options?: ServiceRequestOptions,
) {
    return apiRequest<Marco>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas/${etapaId}/marcos`,
        { method: "POST", body: JSON.stringify(dados), signal: options?.signal },
    );
}

export function atualizarMarcoTaxonomia(
    empreendimentoId: number,
    marcoId: number,
    dados: Partial<Omit<Marco, "id" | "etapa_id">>,
    options?: ServiceRequestOptions,
) {
    return apiRequest<Marco>(`/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
        signal: options?.signal,
    });
}

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
