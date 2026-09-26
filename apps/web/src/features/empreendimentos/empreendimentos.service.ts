import type { Empreendimento, EmpreendimentoFormData } from "@constructo/shared";

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
