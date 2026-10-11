import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarEvidencias } from "../../../features/evidencias/evidencias.service";
import type { Evidencia } from "../types";
import EvidenceGallery from "./EvidenceGallery";

vi.mock("../../../features/evidencias/evidencias.service", () => ({
    listarEvidencias: vi.fn(),
    resolverUrlEvidencia: (caminho: string) => caminho,
}));

const listarEvidenciasMock = vi.mocked(listarEvidencias);

function criarEvidencia(id = 1): Evidencia {
    return {
        id,
        arquivo_url: `/uploads/evidencia-${id}.jpg`,
        descricao_tecnica: id === 1
            ? "Tubulação de água fria concluída no banheiro social da unidade 704. ".repeat(3)
            : null,
        local_obra_id: 700 + id,
        marco_id: 18,
        item_protocolo_id: null,
        capturado_por: 9,
        capturado_em: "2026-10-10T14:30:00Z",
        criado_em: "2026-10-10T15:00:00Z",
        atualizado_em: "2026-10-10T15:00:00Z",
        local_obra: {
            id: 700 + id,
            nome: `Unidade ${703 + id}`,
            tipo: "UNIDADE",
            parent_id: 70,
        },
        marco: {
            id: 18,
            nome: "Tubulação hidráulica instalada",
            descricao_tecnica: null,
        },
        responsavel: {
            id: 9,
            nome: "Marina Costa",
            email: "marina@constructo.dev",
            papel: "GESTOR",
        },
        status_validacao: "APROVADA",
    };
}

function renderizarGaleria() {
    return render(
        <MemoryRouter initialEntries={["/admin/empreendimentos/12/evidencias"]}>
            <Routes>
                <Route
                    path="/admin/empreendimentos/:empreendimentoId/evidencias"
                    element={<EvidenceGallery />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

describe("EvidenceGallery", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("exibe skeleton durante o carregamento", () => {
        listarEvidenciasMock.mockReturnValue(new Promise(() => undefined));
        renderizarGaleria();

        expect(screen.getByRole("status", { name: "Carregando evidências" }))
            .toBeInTheDocument();
    });

    it("exibe estado vazio quando a API não retorna evidências", async () => {
        listarEvidenciasMock.mockResolvedValue([]);
        renderizarGaleria();

        expect(await screen.findByRole("heading", {
            name: "Nenhuma evidência encontrada para estes filtros",
        })).toBeInTheDocument();
    });

    it("exibe erro e permite tentar novamente", async () => {
        const user = userEvent.setup();
        listarEvidenciasMock
            .mockRejectedValueOnce(new Error("falha"))
            .mockResolvedValueOnce([]);
        renderizarGaleria();

        expect(await screen.findByRole("heading", {
            name: "Não foi possível carregar as evidências",
        })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(await screen.findByRole("heading", {
            name: "Nenhuma evidência encontrada para estes filtros",
        })).toBeInTheDocument();
        expect(listarEvidenciasMock).toHaveBeenCalledTimes(2);
    });

    it("renderiza contexto, fallback, descrição expansível e modal de detalhes", async () => {
        const user = userEvent.setup();
        listarEvidenciasMock.mockResolvedValue([criarEvidencia()]);
        renderizarGaleria();

        const card = await screen.findByRole("button", {
            name: "Abrir evidência de Unidade 704",
        });
        expect(within(card).getByText("Tubulação hidráulica instalada")).toBeInTheDocument();
        expect(within(card).getByText("Marina Costa")).toBeInTheDocument();
        expect(within(card).getByText("Aprovada")).toBeInTheDocument();

        await user.click(within(card).getByRole("button", { name: "Ler mais" }));
        expect(within(card).getByRole("button", { name: "Mostrar menos" }))
            .toBeInTheDocument();

        fireEvent.error(within(card).getByRole("img", {
            name: "Evidência registrada em Unidade 704",
        }));
        expect(within(card).getByRole("img", { name: "Imagem indisponível" }))
            .toBeInTheDocument();

        await user.click(card);
        const modal = screen.getByRole("dialog");
        expect(within(modal).getByText(/Tubulação de água fria concluída/)).toBeInTheDocument();
        expect(within(modal).getByText(/marina@constructo.dev/)).toBeInTheDocument();
        await user.click(within(modal).getByRole("button", { name: "Fechar detalhes" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("envia local, marco e período como filtros da API", async () => {
        const user = userEvent.setup();
        listarEvidenciasMock.mockResolvedValue([]);
        renderizarGaleria();
        await screen.findByRole("heading", {
            name: "Nenhuma evidência encontrada para estes filtros",
        });

        await user.type(screen.getByLabelText("ID do local"), "704");
        await user.type(screen.getByLabelText("ID do marco"), "18");
        await user.type(screen.getByLabelText("Capturada a partir de"), "2026-10-01");
        await user.type(screen.getByLabelText("Capturada até"), "2026-10-31");
        await user.click(screen.getByRole("button", { name: "Aplicar filtros" }));

        const inicio = new Date("2026-10-01T00:00:00").toISOString();
        const fim = new Date("2026-10-31T23:59:59.999").toISOString();
        await waitFor(() => {
            expect(listarEvidenciasMock).toHaveBeenLastCalledWith(
                12,
                {
                    localObraId: 704,
                    marcoId: 18,
                    dataCapturaInicio: inicio,
                    dataCapturaFim: fim,
                },
                expect.objectContaining({ signal: expect.any(AbortSignal) }),
            );
        });
    });

    it("pagina os cards sem montar todas as imagens ao mesmo tempo", async () => {
        const user = userEvent.setup();
        listarEvidenciasMock.mockResolvedValue(
            Array.from({ length: 13 }, (_, indice) => criarEvidencia(indice + 1)),
        );
        renderizarGaleria();

        expect(await screen.findByText("Página 1 de 2")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /Abrir evidência/ })).toHaveLength(12);
        await user.click(screen.getByRole("button", { name: "Próxima" }));

        expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /Abrir evidência/ })).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Abrir evidência de Unidade 716" }))
            .toBeInTheDocument();
    });
});
