import type { ReactNode, SVGProps } from "react";
import UserMenu from "../UserMenu/UserMenu";

type NavbarProps = {
    acoes?: ReactNode;
};

const estilos = {
    raiz: "navbar sticky top-0 z-10 flex w-full items-center justify-between border-b border-border-muted bg-surface px-4 py-3 text-foreground",
    contexto: "navbar__acoes flex min-w-0 flex-1 items-center gap-2",
    iconeEmpresa: "h-3.5 w-3.5 flex-none text-foreground-muted",
    empresa: "truncate text-body-sm font-body-sm text-foreground max-[520px]:hidden",
    acoes: "flex items-center gap-5",
    notificacoes: "ds-icon-button h-8 w-8 text-foreground hover:bg-surface-hover",
    iconeNotificacoes: "h-4 w-4",
    divisor: "h-6 w-px flex-none bg-border-muted",
} as const;

export default function Navbar({ acoes }: NavbarProps) {
    return (
        <header className={estilos.raiz}>
            <div className={estilos.contexto} aria-label="Contexto e ações da aplicação">
                <IconeEdificio className={estilos.iconeEmpresa} aria-hidden="true" />
                <span className={estilos.empresa}>
                    Construtora Alpha S.A.
                </span>
                {acoes}
            </div>
            <div className={estilos.acoes}>
                <button
                    className={estilos.notificacoes}
                    type="button"
                    aria-label="Notificações"
                >
                    <IconeSino className={estilos.iconeNotificacoes} aria-hidden="true" />
                </button>
                <span className={estilos.divisor} aria-hidden="true" />
                <UserMenu />
            </div>
        </header>
    );
}

function IconeEdificio(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M4 21V3h10v18m0-12h6v12M2 21h20M7 7h4m-4 4h4m-4 4h4" />
        </svg>
    );
}

function IconeSino(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2Zm4 5h4" />
        </svg>
    );
}
