import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { Link, MemoryRouter, NavLink } from "react-router-dom";
import { describe, expect, it } from "vitest";

type RouterAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

function RouterLink({ href = "/", ...props }: RouterAnchorProps) {
    return <Link to={href} {...props} />;
}

function RouterNavLink({ href = "/", ...props }: RouterAnchorProps) {
    return <NavLink to={href} {...props} />;
}

describe("integração Tailwind e React Router", () => {
    it("preserva destinos e estado ativo na navegação", () => {
        render(
            <MemoryRouter initialEntries={["/admin/empreendimentos/42"]}>
                <RouterLink href="/admin/empreendimentos/42" className="btn btn-primary">
                    Abrir empreendimento
                </RouterLink>
                <nav>
                    <RouterNavLink href="/admin/empreendimentos/42" className="nav-link">
                        Visão geral
                    </RouterNavLink>
                </nav>
            </MemoryRouter>,
        );

        expect(screen.getByRole("link", { name: "Abrir empreendimento" })).toHaveAttribute(
            "href",
            "/admin/empreendimentos/42",
        );
        expect(screen.getByRole("link", { name: "Visão geral" })).toHaveAttribute(
            "aria-current",
            "page",
        );
    });
});
