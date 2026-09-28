import type {
    EditUserData,
    PapelUsuario,
    User,
    UserResponse,
} from "@constructo/shared";

import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export function createUser(
    user: User,
    options?: ServiceRequestOptions,
): Promise<UserResponse> {
    return apiRequest<UserResponse>("/usuarios/", {
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

export function getUsers(options?: ServiceRequestOptions): Promise<UserResponse[]> {
    return apiRequest<UserResponse[]>("/usuarios/", { signal: options?.signal });
}

export function updateUser(
    userId: number,
    user: EditUserData,
    options?: ServiceRequestOptions,
): Promise<UserResponse> {
    return apiRequest<UserResponse>(`/usuarios/${userId}`, {
        method: "PUT",
        body: JSON.stringify(user),
        signal: options?.signal,
    });
}
export function updateUserRole(
    userId: number,
    papel: PapelUsuario,
    options?: ServiceRequestOptions,
): Promise<UserResponse> {
    return apiRequest<UserResponse>(
        `/usuarios/${userId}/papel`,
        {
            method: "PATCH",
            body: JSON.stringify({ papel }),
            signal: options?.signal,
        },
    );
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
