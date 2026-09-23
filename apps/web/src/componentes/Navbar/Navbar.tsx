import { useEffect, useRef, useState, type ReactNode, type SVGProps } from "react";
import type { UserReponse } from "@constructo/shared";
import { Link, useNavigate } from "react-router-dom";
import { getAuthenticatedUser, logoutUser } from "../../modulos/usuarios/servicos/userService";
import "./Navbar.css";

type NavbarProps = { acoes?: ReactNode };
type IconeProps = SVGProps<SVGSVGElement>;

export default function Navbar({ acoes }: NavbarProps) {
    const [usuario, setUsuario] = useState<UserReponse | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [menuAberto, setMenuAberto] = useState(false);
    const [saindo, setSaindo] = useState(false);
    const [erro, setErro] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let ativo = true;

        getAuthenticatedUser()
            .then((usuarioAutenticado) => {
                if (ativo) setUsuario(usuarioAutenticado);
            })
            .catch(() => {
                if (ativo) setUsuario(null);
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => {
            ativo = false;
        };
    }, []);

    useEffect(() => {
        if (!menuAberto) return;

        function fecharAoClicarFora(evento: MouseEvent) {
            if (!menuRef.current?.contains(evento.target as Node)) setMenuAberto(false);
        }

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape") setMenuAberto(false);
        }

        document.addEventListener("mousedown", fecharAoClicarFora);
        document.addEventListener("keydown", fecharComEscape);

        return () => {
            document.removeEventListener("mousedown", fecharAoClicarFora);
            document.removeEventListener("keydown", fecharComEscape);
        };
    }, [menuAberto]);

    async function sair() {
        try {
            setSaindo(true);
            setErro("");
            await logoutUser();
            navigate("/login", { replace: true });
        } catch {
            setErro("Não foi possível encerrar a sessão. Tente novamente.");
            setSaindo(false);
        }
    }

    const nomeCompleto = usuario ? `${usuario.nome} ${usuario.sobrenome}`.trim() : "Usuário";
    const iniciais = usuario
        ? [usuario.nome, usuario.sobrenome]
            .filter(Boolean)
            .map((nome) => nome.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "";

    return (
        <header className="navbar">
            <div className="navbar__acoes" aria-label="Ações da aplicação">{acoes}</div>

            <div className="navbar__usuario" ref={menuRef}>
                <button
                    className="navbar__usuario-botao"
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={menuAberto}
                    aria-controls="navbar-menu-usuario"
                    onClick={() => setMenuAberto((aberto) => !aberto)}
                >
                    <span className="navbar__avatar" aria-hidden="true">
                        {iniciais || <IconeUsuario />}
                    </span>
                    <span className="navbar__identificacao">
                        <span className="navbar__nome">
                            {carregando ? "Carregando..." : nomeCompleto}
                        </span>
                        <span className="navbar__funcao">{usuario ? "Minha conta" : "Conta"}</span>
                    </span>
                    <IconeChevron className="navbar__chevron" aria-hidden="true" />
                </button>

                {menuAberto && (
                    <div className="navbar__menu" id="navbar-menu-usuario" role="menu">
                        {usuario && (
                            <div className="navbar__menu-cabecalho">
                                <strong>{nomeCompleto}</strong>
                                <span>{usuario.email}</span>
                            </div>
                        )}
                        <Link
                            className="navbar__menu-item"
                            to="/admin/perfil"
                            role="menuitem"
                            onClick={() => setMenuAberto(false)}
                        >
                            <IconeUsuario aria-hidden="true" />
                            Perfil
                        </Link>
                        <button
                            className="navbar__menu-item navbar__menu-item--sair"
                            type="button"
                            role="menuitem"
                            disabled={saindo}
                            onClick={sair}
                        >
                            <IconeSair aria-hidden="true" />
                            {saindo ? "Saindo..." : "Sair"}
                        </button>
                        {erro && <p className="navbar__erro" role="alert">{erro}</p>}
                    </div>
                )}
            </div>
        </header>
    );
}

function IconeUsuario(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

function IconeChevron(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function IconeSair(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M10 17l5-5-5-5M15 12H3" />
            <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
        </svg>
    );
}
