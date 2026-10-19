import type { EstruturaLocal } from "@constructo/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import StructureList from "./StructureList";

const base = {
    empreendimento_id: 12,
    parent_id: null,
    criado_em: "2026-10-19T12:00:00Z",
    atualizado_em: "2026-10-19T12:00:00Z",
    filhos: [],
};

const locais: EstruturaLocal[] = [
    { ...base, id: 1, nome: "Bloco Norte", tipo: "BLOCO", ordem: 2 },
    { ...base, id: 2, nome: "Torre Sul", tipo: "TORRE", ordem: 4 },
];

describe("StructureList", () => {
    it("exibe somente dados sustentados pela API e permite selecionar o local", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <StructureList
                items={locais}
                busca=""
                contexto="Raiz da estrutura"
                breadcrumb={<span>Raiz da estrutura</span>}
                onSelect={onSelect}
            />,
        );

        expect(screen.getByText("2 locais")).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Nome" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Tipo" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: "Ordem" })).toBeInTheDocument();
        expect(screen.queryByRole("columnheader", { name: "Unidades" })).not.toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Torre Sul" }));
        expect(onSelect).toHaveBeenCalledWith(locais[1]);

        await user.click(screen.getByRole("button", { name: "Ver detalhes de Bloco Norte" }));
        expect(onSelect).toHaveBeenCalledWith(locais[0]);
    });

    it("filtra os filhos diretos por nome e informa a quantidade visível", () => {
        render(
            <StructureList
                items={locais}
                busca="sul"
                contexto="Raiz da estrutura"
                breadcrumb={<span>Raiz da estrutura</span>}
                onSelect={vi.fn()}
            />,
        );

        expect(screen.getByText("1 de 2 locais")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Torre Sul" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Bloco Norte" })).not.toBeInTheDocument();
    });

    it("apresenta estados vazios para o nível e para a busca", () => {
        const { rerender } = render(
            <StructureList
                items={[]}
                busca=""
                contexto="Torre A"
                breadcrumb={<span>Torre A</span>}
                onSelect={vi.fn()}
            />,
        );
        expect(screen.getByRole("status")).toHaveTextContent("Torre A não possui locais filhos.");

        rerender(
            <StructureList
                items={locais}
                busca="inexistente"
                contexto="Raiz da estrutura"
                breadcrumb={<span>Raiz da estrutura</span>}
                onSelect={vi.fn()}
            />,
        );
        expect(screen.getByRole("status")).toHaveTextContent("Nenhum local deste nível corresponde à busca.");
    });
});
