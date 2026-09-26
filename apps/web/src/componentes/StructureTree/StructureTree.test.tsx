import type { EstruturaLocal } from "@constructo/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import StructureTree from "./StructureTree";

const base = {
    empreendimento_id: 12,
    ordem: 0,
    criado_em: "2026-09-26T12:00:00Z",
    atualizado_em: "2026-09-26T12:00:00Z",
};

const estrutura: EstruturaLocal[] = [{
    ...base,
    id: 1,
    parent_id: null,
    nome: "Torre A",
    tipo: "TORRE",
    filhos: [{
        ...base,
        id: 2,
        parent_id: 1,
        nome: "1º Pavimento",
        tipo: "PAVIMENTO",
        filhos: [{
            ...base,
            id: 3,
            parent_id: 2,
            nome: "Unidade 101",
            tipo: "UNIDADE",
            filhos: [],
        }],
    }],
}];

function ArvoreTestavel() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    return (
        <StructureTree
            items={estrutura}
            selectedId={selectedId}
            onSelect={(item) => setSelectedId(item.id)}
        />
    );
}

describe("StructureTree", () => {
    it("respeita a hierarquia e expande ou recolhe os descendentes", async () => {
        const user = userEvent.setup();
        render(<ArvoreTestavel />);

        expect(screen.getByRole("tree")).toBeInTheDocument();
        expect(screen.getByText("Torre")).toBeInTheDocument();
        expect(screen.getByText("Pavimento")).toBeInTheDocument();
        expect(screen.getByText("Unidade")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Recolher Torre A" }));
        expect(screen.queryByText("1º Pavimento")).not.toBeInTheDocument();
        expect(screen.queryByText("Unidade 101")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Expandir Torre A" }));
        expect(screen.getByText("1º Pavimento")).toBeInTheDocument();
        expect(screen.getByText("Unidade 101")).toBeInTheDocument();
    });

    it("permite selecionar um item com mouse e teclado", async () => {
        const user = userEvent.setup();
        render(<ArvoreTestavel />);
        const unidade = screen.getByRole("treeitem", { name: /Unidade 101/ });

        await user.click(unidade);
        expect(unidade).toHaveAttribute("aria-selected", "true");

        const pavimento = screen.getByRole("treeitem", { name: /1º Pavimento/ });
        pavimento.focus();
        await user.keyboard("{Enter}");
        expect(pavimento).toHaveAttribute("aria-selected", "true");
        expect(unidade).toHaveAttribute("aria-selected", "false");
    });
});
