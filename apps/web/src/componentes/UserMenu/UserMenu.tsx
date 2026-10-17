import { useEffect, useRef, useState, type SVGProps } from "react";
import { Link, useFetcher, useRouteLoaderData } from "react-router-dom";
import { exigirAcessoAoPainel } from "../../features/auth/auth.loader";
import type { AdminActionData } from "../../features/auth/logout.action";
import { cn } from "../../utils/classes";

type IconeProps = SVGProps<SVGSVGElement>;

const estilos = {
    raiz: "user-menu relative flex-none",
    botao: "user-menu__botao ds-focus-ring-offset flex items-center gap-3 rounded-md border-0 bg-transparent p-0 text-left text-foreground transition-colors hover:text-foreground-strong",
    avatar: "user-menu__avatar grid h-11 w-11 flex-none place-items-center rounded-full bg-[#1f6feb] text-[17px] font-medium leading-none text-white",
    identificacao: "user-menu__identificacao grid min-w-0 text-left max-[640px]:hidden",
    nome: "user-menu__nome max-w-64 truncate text-[18px] font-medium leading-6 text-foreground",
    funcao: "user-menu__funcao text-[17px] font-normal leading-6 text-foreground-muted",
    chevron: "user-menu__chevron h-5 w-5 text-foreground-muted transition-transform",
    opcoes: "user-menu__opcoes absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(340px,calc(100vw-2rem))] rounded-lg border border-border-muted bg-surface-muted p-2 shadow-[0_8px_24px_rgb(1_4_9_/_75%)]",
    cabecalho: "user-menu__cabecalho mb-2 grid gap-0.5 border-b border-border-muted px-2 pb-3 pt-1",
    nomeCabecalho: "truncate text-[18px] font-medium leading-6 text-foreground-strong",
    email: "truncate text-[17px] leading-6 text-foreground-muted",
    item: "user-menu__item ds-menu-item ds-focus-ring gap-3 text-foreground no-underline hover:bg-surface-hover hover:text-foreground-strong",
    sair: "user-menu__item user-menu__item--sair ds-menu-item ds-focus-ring gap-3 border-0 bg-transparent text-left text-error hover:bg-[#93000a]/20 disabled:cursor-wait disabled:opacity-60",
    iconeItem: "h-[22px] w-[22px]",
    erro: "user-menu__erro px-2 py-1 text-body-sm text-error",
} as const;

export default function UserMenu() {
    const usuario = useRouteLoaderData<typeof exigirAcessoAoPainel>("admin-autenticado");
    const [menuAberto, setMenuAberto] = useState(false);
    const fetcher = useFetcher<AdminActionData>();
    const saindo = fetcher.state !== "idle";
    const menuRef = useRef<HTMLDivElement>(null);

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
        <div className={estilos.raiz} ref={menuRef}>
            <button
                className={estilos.botao}
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuAberto}
                aria-controls={menuAberto ? "user-menu-opcoes" : undefined}
                onClick={() => setMenuAberto((aberto) => !aberto)}
            >
                <span className={estilos.avatar} aria-hidden="true">
                    {iniciais || <IconeUsuario />}
                </span>
                <span className={estilos.identificacao}>
                    <span className={estilos.nome}>{nomeCompleto}</span>
                    <span className={estilos.funcao}>{usuario ? "Minha conta" : "Conta"}</span>
                </span>
                <IconeChevron className={cn(estilos.chevron, menuAberto && "rotate-180")} aria-hidden="true" />
            </button>

            {menuAberto && (
                <div className={estilos.opcoes} id="user-menu-opcoes" role="menu">
                    {usuario && (
                        <div className={estilos.cabecalho}>
                            <strong className={estilos.nomeCabecalho}>{nomeCompleto}</strong>
                            <span className={estilos.email}>{usuario.email}</span>
                        </div>
                    )}
                    <Link
                        className={estilos.item}
                        to="/admin/perfil"
                        role="menuitem"
                        onClick={() => setMenuAberto(false)}
                    >
                        <IconeUsuario className={estilos.iconeItem} aria-hidden="true" />
                        Perfil
                    </Link>
                    <fetcher.Form method="post" action="/admin">
                        <input name="intent" type="hidden" value="logout" />
                        <button
                            className={estilos.sair}
                            type="submit"
                            role="menuitem"
                            disabled={saindo}
                        >
                            <IconeSair className={estilos.iconeItem} aria-hidden="true" />
                            {saindo ? "Saindo..." : "Sair"}
                        </button>
                    </fetcher.Form>
                    {fetcher.data?.erro && (
                        <p className={estilos.erro} role="alert">{fetcher.data.erro}</p>
                    )}
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
