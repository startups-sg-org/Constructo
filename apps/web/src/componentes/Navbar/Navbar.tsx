import type { ReactNode } from "react";
import UserMenu from "../UserMenu/UserMenu";
import "./Navbar.css";

type NavbarProps = {
    acoes?: ReactNode;
};

export default function Navbar({ acoes }: NavbarProps) {
    return (
        <header className="navbar">
            <div className="navbar__acoes" aria-label="Ações da aplicação">
                {acoes}
            </div>
            <UserMenu />
        </header>
    );
}
