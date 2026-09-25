import type { UserReponse } from "@constructo/shared";

import { apiRequest, type ServiceRequestOptions } from "./api";

type LoginResponse = {
    mensagem: string;
    usuario: UserReponse;
};

export async function loginUser(
    email: string,
    senha: string,
    options?: ServiceRequestOptions,
): Promise<UserReponse> {
    const result = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
        signal: options?.signal,
    });

    return result.usuario;
}

export function getAuthenticatedUser(
    options?: ServiceRequestOptions,
): Promise<UserReponse> {
    return apiRequest<UserReponse>("/sessao", { signal: options?.signal });
}

export function logoutUser(options?: ServiceRequestOptions): Promise<void> {
    return apiRequest<void>("/logout", {
        method: "POST",
        signal: options?.signal,
    });
}
