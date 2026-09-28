import type { CreateObraDTO, ObraResponse } from "@constructo/shared";

import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export function createObra(
    obra: CreateObraDTO,
    options?: ServiceRequestOptions,
): Promise<ObraResponse> {
    return apiRequest<ObraResponse>("/obras/", {
        method: "POST",
        body: JSON.stringify(obra),
        signal: options?.signal,
    });
}

export function getObras(options?: ServiceRequestOptions): Promise<ObraResponse[]> {
    return apiRequest<ObraResponse[]>("/obras/", { signal: options?.signal });
}
