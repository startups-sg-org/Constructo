import type { EditUserData, User, UserReponse } from "@constructo/shared";

import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export function createUser(
    user: User,
    options?: ServiceRequestOptions,
): Promise<UserReponse> {
    return apiRequest<UserReponse>("/usuarios/", {
        method: "POST",
        body: JSON.stringify(user),
        signal: options?.signal,
    });
}

export async function getUsersCount(options?: ServiceRequestOptions): Promise<number> {
    const result = await apiRequest<{ total: number }>("/usuarios/quantidade", {
        signal: options?.signal,
    });

    return result.total;
}

export function getUsers(options?: ServiceRequestOptions): Promise<UserReponse[]> {
    return apiRequest<UserReponse[]>("/usuarios/", { signal: options?.signal });
}

export function updateUser(
    userId: number,
    user: EditUserData,
    options?: ServiceRequestOptions,
): Promise<UserReponse> {
    return apiRequest<UserReponse>(`/usuarios/${userId}`, {
        method: "PUT",
        body: JSON.stringify(user),
        signal: options?.signal,
    });
}

export function deleteUser(
    userId: number,
    options?: ServiceRequestOptions,
): Promise<void> {
    return apiRequest<void>(`/usuarios/${userId}`, {
        method: "DELETE",
        signal: options?.signal,
    });
}
