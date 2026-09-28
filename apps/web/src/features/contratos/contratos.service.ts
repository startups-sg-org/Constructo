import type { ContratoResponse } from "@constructo/shared";

import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export function getContratosDisponiveis(
    options?: ServiceRequestOptions,
): Promise<ContratoResponse[]> {
    return apiRequest<ContratoResponse[]>("/contratos/?sem_obra=true", {
        signal: options?.signal,
    });
}
