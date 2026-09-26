import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BadgeStatus from "../BadgeStatus/BadgeStatus";
import CabecalhoSecao from "../CabecalhoSecao/CabecalhoSecao";
import EstadoVazio from "../EstadoVazio/EstadoVazio";

describe("padrões visuais do painel", () => {
    it("renderiza cabeçalho com hierarquia, descrição e complemento", () => {
        render(
            <CabecalhoSecao
                etiqueta="Visão geral"
                titulo="Empreendimentos"
                tituloId="titulo-empreendimentos"
                descricao="Consulte as obras cadastradas."
                complemento={<span>3 obras</span>}
                nivel={3}
                comDivisor
            />,
        );

        const titulo = screen.getByRole("heading", {
            level: 3,
            name: "Empreendimentos",
        });
        expect(titulo).toHaveAttribute("id", "titulo-empreendimentos");
        expect(titulo.closest("header")).toHaveClass(
            "cabecalho-secao",
            "cabecalho-secao--com-divisor",
        );
        expect(screen.getByText("Consulte as obras cadastradas.")).toBeInTheDocument();
        expect(screen.getByText("3 obras")).toBeInTheDocument();
    });

    it("aplica o tom semântico ao badge", () => {
        render(<BadgeStatus tom="sucesso">Concluído</BadgeStatus>);

        expect(screen.getByText("Concluído")).toHaveClass(
            "badge-status",
            "badge-status--sucesso",
        );
    });

    it("renderiza estado vazio com ícone decorativo", () => {
        const { container } = render(
            <EstadoVazio
                titulo="Nenhum empreendimento"
                descricao="Cadastre a primeira obra."
            />,
        );

        expect(screen.getByRole("heading", { name: "Nenhum empreendimento" })).toBeInTheDocument();
        expect(screen.getByText("Cadastre a primeira obra.")).toBeInTheDocument();
        expect(container.querySelector(".estado-vazio__icone")).toHaveAttribute("aria-hidden", "true");
    });
});
