import type { UserResponse } from "@constructo/shared";

import { apiRequest, type ServiceRequestOptions } from "../../services/api";

type LoginResponse = {
    mensagem: string;
    usuario: UserResponse;
};

export async function loginUser(
    email: string,
    senha: string,
    options?: ServiceRequestOptions,
): Promise<UserResponse> {
    const result = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
        signal: options?.signal,
    });

    return result.usuario;
}

export function getAuthenticatedUser(
    options?: ServiceRequestOptions,
): Promise<UserResponse> {
    return apiRequest<UserResponse>("/sessao", { signal: options?.signal });
}

export function logoutUser(options?: ServiceRequestOptions): Promise<void> {
    return apiRequest<void>("/logout", {
        method: "POST",
        signal: options?.signal,
    });
}
