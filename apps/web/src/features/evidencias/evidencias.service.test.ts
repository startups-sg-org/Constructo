import { afterEach, describe, expect, it, vi } from "vitest";

import { API_URL } from "../../services/api";
import {
    listarEvidencias,
    resolverUrlEvidencia,
} from "./evidencias.service";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("serviço de evidências", () => {
    it("traduz os filtros da galeria para os parâmetros esperados pela API", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }));
        vi.stubGlobal("fetch", fetchMock);

        await listarEvidencias(12, {
            localObraId: 704,
            marcoId: 18,
            dataCapturaInicio: "2026-10-01T00:00:00.000Z",
            dataCapturaFim: "2026-10-31T23:59:59.999Z",
        });

        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.pathname).toBe("/empreendimentos/12/evidencias");
        expect(Object.fromEntries(url.searchParams)).toEqual({
            local_obra_id: "704",
            marco_id: "18",
            data_captura_inicio: "2026-10-01T00:00:00.000Z",
            data_captura_fim: "2026-10-31T23:59:59.999Z",
        });
        expect(fetchMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ credentials: "include" }),
        );
    });

    it("resolve URLs relativas de arquivos contra a API", () => {
        expect(resolverUrlEvidencia("/uploads/foto.jpg"))
            .toBe(`${API_URL}/uploads/foto.jpg`);
        expect(resolverUrlEvidencia("https://cdn.example/foto.jpg"))
            .toBe("https://cdn.example/foto.jpg");
    });
});
