const URL_API_PADRAO = "http://localhost:8000";

function obterUrlBase(): string {
    const urlConfigurada = import.meta.env.VITE_API_URL?.trim();

    if (urlConfigurada) {
        return urlConfigurada.replace(/\/+$/, "");
    }

    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:8000`;
    }

    return URL_API_PADRAO;
}

export const API_URL = obterUrlBase();

type DadosErro = {
    detail?: unknown;
    message?: unknown;
};

export class ApiError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly data: unknown;

    constructor(message: string, status: number, statusText: string, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}

export type ServiceRequestOptions = Pick<RequestInit, "signal">;

function construirUrl(caminho: string): string {
    if (/^https?:\/\//.test(caminho)) return caminho;

    return `${API_URL}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

function extrairMensagem(data: unknown, fallback: string): string {
    if (typeof data === "string" && data.trim()) return data;

    if (data && typeof data === "object") {
        const { detail, message } = data as DadosErro;

        if (typeof detail === "string" && detail.trim()) return detail;
        if (typeof message === "string" && message.trim()) return message;
    }

    return fallback;
}

async function lerResposta(response: Response): Promise<unknown> {
    if (response.status === 204) return undefined;

    const texto = await response.text();
    if (!texto) return undefined;

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) return texto;

    try {
        return JSON.parse(texto) as unknown;
    } catch {
        return texto;
    }
}

export async function apiRequest<T>(
    caminho: string,
    init: RequestInit = {},
): Promise<T> {
    const headers = new Headers(init.headers);

    if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    let response: Response;

    try {
        response = await fetch(construirUrl(caminho), {
            ...init,
            credentials: init.credentials ?? "include",
            headers,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;

        throw new ApiError(
            "Não foi possível conectar à API",
            0,
            "Network Error",
            error,
        );
    }

    const data = await lerResposta(response);

    if (!response.ok) {
        throw new ApiError(
            extrairMensagem(data, `A requisição falhou (${response.status})`),
            response.status,
            response.statusText,
            data,
        );
    }

    return data as T;
}
