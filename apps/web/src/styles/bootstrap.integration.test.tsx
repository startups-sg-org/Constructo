import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import { Link, MemoryRouter, NavLink } from "react-router-dom";
import { describe, expect, it } from "vitest";

type RouterAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

function RouterLink({ href = "/", ...props }: RouterAnchorProps) {
    return <Link to={href} {...props} />;
}

function RouterNavLink({ href = "/", ...props }: RouterAnchorProps) {
    return <NavLink to={href} {...props} />;
}

describe("integração Bootstrap e React Router", () => {
    it("preserva destinos e estado ativo em componentes React-Bootstrap", () => {
        render(
            <MemoryRouter initialEntries={["/admin/empreendimentos/42"]}>
                <Button
                    as={RouterLink as unknown as "a"}
                    href="/admin/empreendimentos/42"
                    variant="primary"
                >
                    Abrir empreendimento
                </Button>
                <Nav>
                    <Nav.Link
                        as={RouterNavLink as unknown as "a"}
                        href="/admin/empreendimentos/42"
                    >
                        Visão geral
                    </Nav.Link>
                </Nav>
            </MemoryRouter>,
        );

        expect(screen.getByRole("button", { name: "Abrir empreendimento" })).toHaveAttribute(
            "href",
            "/admin/empreendimentos/42",
        );
        expect(screen.getByRole("link", { name: "Visão geral" })).toHaveAttribute(
            "aria-current",
            "page",
        );
    });
});
