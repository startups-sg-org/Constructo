import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import MedicoesEmpreendimento from "../../modulos/empreendimentos/componentes/MedicoesEmpreendimento";

const empreendimento = { id: 1, nome: "Obra teste" };
const caminho = "/admin/empreendimentos/1/medicoes";
const routers: ReturnType<typeof createMemoryRouter>[] = [];

function montar(dados: object) {
    const router = createMemoryRouter([{
        path: caminho,
        loader: () => dados,
        element: <MedicoesEmpreendimento />,
    }], { initialEntries: [caminho] });
    routers.push(router);
    render(<RouterProvider router={router} />);
}

afterEach(() => {
    cleanup();
    routers.splice(0).forEach((router) => router.dispose());
});

describe("Entrada de protocolos pela área de medições", () => {
    it("orienta a configurar uma taxonomia quando ela não existe", async () => {
        montar({ empreendimento, taxonomia: null, protocolos: [] });
        expect(await screen.findByRole("heading", { name: "Configure a taxonomia primeiro" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Configurar taxonomia" })).toHaveAttribute("href", "/admin/empreendimentos/1/taxonomia");
    });

    it("orienta a cadastrar um marco quando a taxonomia está vazia", async () => {
        montar({ empreendimento, taxonomia: { id: 2, etapas: [] }, protocolos: [] });
        expect(await screen.findByRole("heading", { name: "Nenhum marco disponível" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Cadastrar marco" })).toBeInTheDocument();
    });

    it("oferece criação e gerenciamento para o marco disponível", async () => {
        montar({
            empreendimento,
            taxonomia: {
                id: 2,
                etapas: [{ id: 3, taxonomia_id: 2, nome: "Fundação", ordem: 0, marcos: [{ id: 4, etapa_id: 3, nome: "Concretagem", ordem: 0 }] }],
            },
            protocolos: [],
        });
        expect(await screen.findByRole("heading", { name: "Nenhum protocolo configurado" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Gerenciar protocolos" })).toHaveAttribute("href", "/admin/empreendimentos/1/taxonomia/marcos/4/protocolos");
        expect(screen.getByRole("link", { name: /Criar protocolo$/ })).toHaveAttribute("href", "/admin/empreendimentos/1/taxonomia/marcos/4/protocolos/novo");
    });

    it("mantém o gerenciador acessível quando os protocolos recentes falham", async () => {
        montar({
            empreendimento,
            taxonomia: {
                id: 2,
                etapas: [{ id: 3, taxonomia_id: 2, nome: "Fundação", ordem: 0, marcos: [{ id: 4, etapa_id: 3, nome: "Concretagem", ordem: 0 }] }],
            },
            protocolos: [],
            erroProtocolos: "A requisição falhou (500)",
        });

        expect(await screen.findByText("A listagem pode estar incompleta.")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Gerenciar protocolos" })).toBeInTheDocument();
    });

    it("exibe na listagem um protocolo criado para qualquer marco da taxonomia", async () => {
        montar({
            empreendimento,
            taxonomia: {
                id: 2,
                etapas: [{ id: 3, taxonomia_id: 2, nome: "Fundação", ordem: 0, marcos: [{ id: 4, etapa_id: 3, nome: "Concretagem", ordem: 0 }] }],
            },
            protocolos: [{
                id: 7,
                marco_id: 4,
                nome: "Inspeção da concretagem",
                descricao: "Checklist antes da liberação.",
                quantidade_minima: 2,
                criado_em: "2026-10-19T12:00:00Z",
                atualizado_em: "2026-10-19T12:00:00Z",
            }],
            erroProtocolos: null,
        });

        expect(await screen.findByRole("heading", { name: "Inspeção da concretagem" })).toBeInTheDocument();
        expect(screen.getByText("Fundação · Concretagem")).toBeInTheDocument();
        expect(screen.getByText("1 protocolo")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Abrir protocolo" })).toHaveAttribute(
            "href",
            "/admin/empreendimentos/1/taxonomia/marcos/4/protocolos/7",
        );
    });

    it("mostra a falha da taxonomia dentro da página em vez de acionar a rota de erro", async () => {
        montar({
            empreendimento,
            taxonomia: null,
            protocolos: [],
            erroTaxonomia: "Falha ao buscar taxonomia",
            erroProtocolos: null,
        });

        expect(await screen.findByRole("heading", { name: "Não foi possível carregar a taxonomia" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Abrir taxonomia" })).toHaveAttribute("href", "/admin/empreendimentos/1/taxonomia");
    });
});

