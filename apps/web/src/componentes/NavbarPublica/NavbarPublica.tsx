import { useEffect, useState, type SVGProps } from "react";
import { Link } from "react-router-dom";
import LogoConstructo from "../LogoConstructo/LogoConstructo";
import "./NavbarPublica.css";

type IconeProps = SVGProps<SVGSVGElement>;

const linksNavegacao = [
    { rotulo: "Início", destino: "/#inicio" },
    { rotulo: "Recursos", destino: "/#recursos" },
    { rotulo: "Como funciona", destino: "/#como-funciona" },
    { rotulo: "Sobre", destino: "/#sobre" }
];

export default function NavbarPublica() {
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        if (!menuAberto) return;

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape") setMenuAberto(false);
        }

        document.addEventListener("keydown", fecharComEscape);
        return () => document.removeEventListener("keydown", fecharComEscape);
    }, [menuAberto]);

    return (
        <header className="navbar-publica">
            <div className="navbar-publica__conteudo">
                <a
                    className="navbar-publica__marca"
                    href="/#inicio"
                    aria-label="Constructo — ir para o início"
                >
                    <LogoConstructo className="navbar-publica__logo" />
                    <span>Constructo</span>
                </a>

                <button
                    className="navbar-publica__alternar"
                    type="button"
                    aria-label={menuAberto ? "Fechar menu de navegação" : "Abrir menu de navegação"}
                    aria-controls="navegacao-publica"
                    aria-expanded={menuAberto}
                    onClick={() => setMenuAberto((aberto) => !aberto)}
                >
                    {menuAberto ? <IconeFechar aria-hidden="true" /> : <IconeMenu aria-hidden="true" />}
                </button>

                <div
                    className={"navbar-publica__menu" + (menuAberto ? " navbar-publica__menu--aberto" : "")}
                    id="navegacao-publica"
                >
                    <nav aria-label="Navegação da página inicial">
                        <ul className="navbar-publica__links">
                            {linksNavegacao.map(({ rotulo, destino }) => (
                                <li key={destino}>
                                    <a href={destino} onClick={() => setMenuAberto(false)}>
                                        {rotulo}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="navbar-publica__acoes">
                        <Link className="navbar-publica__entrar" to="/login">
                            Entrar
                        </Link>
                        <Link className="navbar-publica__destaque" to="/cadastro">
                            Começar agora
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

function IconeMenu(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function IconeFechar(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="m6 6 12 12M18 6 6 18" />
        </svg>
    );
}
