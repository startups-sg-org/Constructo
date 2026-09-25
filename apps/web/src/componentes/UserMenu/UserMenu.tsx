import { useEffect, useRef, useState, type SVGProps } from "react";
import { Link, useNavigate, useRouteLoaderData } from "react-router-dom";
import { exigirAutenticacao } from "../../router/loaders/autenticacaoLoader";
import { logoutUser } from "../../services/auth.service";
import "./UserMenu.css";

type IconeProps = SVGProps<SVGSVGElement>;

export default function UserMenu() {
    const usuario = useRouteLoaderData<typeof exigirAutenticacao>("admin-autenticado");
    const [menuAberto, setMenuAberto] = useState(false);
    const [saindo, setSaindo] = useState(false);
    const [erro, setErro] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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
        <div className="user-menu" ref={menuRef}>
            <button
                className="user-menu__botao"
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuAberto}
                aria-controls={menuAberto ? "user-menu-opcoes" : undefined}
                onClick={() => setMenuAberto((aberto) => !aberto)}
            >
                <span className="user-menu__avatar" aria-hidden="true">
                    {iniciais || <IconeUsuario />}
                </span>
                <span className="user-menu__identificacao">
                    <span className="user-menu__nome">{nomeCompleto}</span>
                    <span className="user-menu__funcao">{usuario ? "Minha conta" : "Conta"}</span>
                </span>
                <IconeChevron className="user-menu__chevron" aria-hidden="true" />
            </button>

            {menuAberto && (
                <div className="user-menu__opcoes" id="user-menu-opcoes" role="menu">
                    {usuario && (
                        <div className="user-menu__cabecalho">
                            <strong>{nomeCompleto}</strong>
                            <span>{usuario.email}</span>
                        </div>
                    )}
                    <Link
                        className="user-menu__item"
                        to="/admin/perfil"
                        role="menuitem"
                        onClick={() => setMenuAberto(false)}
                    >
                        <IconeUsuario aria-hidden="true" />
                        Perfil
                    </Link>
                    <button
                        className="user-menu__item user-menu__item--sair"
                        type="button"
                        role="menuitem"
                        disabled={saindo}
                        onClick={sair}
                    >
                        <IconeSair aria-hidden="true" />
                        {saindo ? "Saindo..." : "Sair"}
                    </button>
                    {erro && <p className="user-menu__erro" role="alert">{erro}</p>}
                </div>
            )}
        </div>
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
