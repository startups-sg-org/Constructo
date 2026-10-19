import { useState, type SVGProps } from "react";
import {
    matchPath,
    NavLink,
    useLocation,
    useRouteLoaderData,
} from "react-router-dom";
import SidebarItem, { type IconeSidebar } from "./SidebarItem";
import { exigirAcessoAoPainel } from "../../features/auth/auth.loader";
import { cn } from "../../utils/classes";

type IconeProps = SVGProps<SVGSVGElement>;

type ItemNavegacao = {
    rotulo: string;
    rota: string;
    icone: IconeSidebar;
    exato?: boolean;
};

type SidebarProps = {
    className?: string;
};

const itensNavegacao: ItemNavegacao[] = [
    { rotulo: "Home", rota: "/admin", icone: IconeHome, exato: true },
    { rotulo: "Usuários", rota: "/admin/usuarios", icone: IconeUsuarios },
    { rotulo: "Empreendimentos", rota: "/admin/obras", icone: IconeObras },
    { rotulo: "Contratos", rota: "/admin/contratos", icone: IconeContratos },
];

const estilos = {
    raiz: "sidebar sticky top-0 z-20 flex h-dvh flex-none flex-col items-start self-stretch border-r border-border-muted bg-surface text-foreground transition-[width] duration-300 max-[760px]:hidden",
    aberta: "w-60",
    fechada: "w-20",
    cabecalho: "sidebar__cabecalho flex w-full items-center gap-3 border-b border-border-muted px-4 py-4",
    cabecalhoFechado: "justify-center px-2",
    marca: "sidebar__marca flex min-w-0 items-center gap-3 overflow-hidden text-foreground-strong no-underline",
    monograma: "grid h-10 w-10 flex-none place-items-center rounded-md border border-warning-700 bg-warning-50 text-[22px] font-semibold leading-none text-warning-700",
    nome: "sidebar__nome overflow-hidden whitespace-nowrap text-[21px] font-semibold leading-7 text-foreground-strong transition-[max-width,opacity] duration-300",
    nomeVisivel: "max-w-36 opacity-100",
    nomeOculto: "max-w-0 opacity-0",
    alternar: "sidebar__alternar ds-icon-button ml-auto h-10 w-10 flex-none border border-border-control bg-surface-muted text-foreground-muted hover:bg-surface-hover hover:text-foreground-strong",
    alternarFechado: "absolute left-[64px] top-4 z-10",
    seta: "h-[22px] w-[22px] transition-transform duration-300",
    navegacao: "sidebar__navegacao flex w-full grow flex-col items-start gap-1 px-2 py-4",
    secao: "sidebar__secao w-full overflow-hidden whitespace-nowrap px-3 pb-2 text-[15px] font-medium uppercase tracking-[0.08em] text-foreground-muted transition-opacity duration-200",
    secaoOculta: "h-0 pb-0 opacity-0",
    lista: "sidebar__lista m-0 grid w-full list-none gap-1 p-0",
    rodape: "sidebar__rodape flex w-full items-center border-t border-border-muted px-4 py-3 text-foreground-muted",
    rodapeAberto: "justify-between",
    rodapeFechado: "justify-center px-2",
    ambiente: "items-center gap-2 overflow-hidden whitespace-nowrap",
    indicador: "h-[11px] w-[11px] flex-none rounded-full bg-success-700",
    versao: "text-[17px] font-code-sm leading-6",
    ajuda: "h-[22px] w-[22px] flex-none",
} as const;

export default function Sidebar({ className = "" }: SidebarProps) {
    const [aberta, setAberta] = useState(true);
    const { pathname } = useLocation();

    const usuario = useRouteLoaderData<typeof exigirAcessoAoPainel>("admin-autenticado");
    const itensVisiveis = itensNavegacao.filter(
        (item) => usuario?.papel === "ADMIN" || item.rota !== "/admin/usuarios",
    );

    return (
        <aside
            className={cn(estilos.raiz, aberta ? estilos.aberta : estilos.fechada, className)}
            aria-label="Navegação principal"
        >
            <div className={cn(estilos.cabecalho, !aberta && estilos.cabecalhoFechado)}>
                <NavLink className={estilos.marca} to="/admin" aria-label="Constructo — início">
                    <span className={estilos.monograma} aria-hidden="true">C</span>
                    <span className={cn(estilos.nome, aberta ? estilos.nomeVisivel : estilos.nomeOculto)}>Constructo</span>
                </NavLink>

                <button
                    className={cn(estilos.alternar, !aberta && estilos.alternarFechado)}
                    type="button"
                    aria-controls="sidebar-navegacao"
                    aria-expanded={aberta}
                    aria-label={aberta ? "Fechar menu lateral" : "Abrir menu lateral"}
                    title={aberta ? "Fechar menu" : "Abrir menu"}
                    onClick={() => setAberta((valorAtual) => !valorAtual)}
                >
                    <IconeSeta className={cn(estilos.seta, !aberta && "rotate-180")} aria-hidden="true" />
                </button>
            </div>

            <nav className={estilos.navegacao} id="sidebar-navegacao">
                <span className={cn(estilos.secao, aberta ? "opacity-100" : estilos.secaoOculta)}>Menu principal</span>

                <ul className={estilos.lista}>
                    {itensVisiveis.map(({ rotulo, rota, icone: IconeItem, exato }) => (
                        <SidebarItem
                            key={rota}
                            texto={rotulo}
                            icone={IconeItem}
                            rota={rota}
                            ativo={Boolean(matchPath({ path: rota, end: exato }, pathname))}
                            recolhido={!aberta}
                        />
                    ))}
                </ul>
            </nav>

            <div className={cn(estilos.rodape, aberta ? estilos.rodapeAberto : estilos.rodapeFechado)} aria-hidden="true">
                <span className={cn(estilos.ambiente, aberta ? "flex" : "hidden")}>
                    <span className={estilos.indicador} />
                    <span className={estilos.versao}>v2.4.8-prod</span>
                </span>
                <IconeAjuda className={estilos.ajuda} />
            </div>
        </aside>
    );
}

function IconeSeta(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function IconeAjuda(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" />
            <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function IconeHome(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
            <path d="M9 21v-8h6v8" />
        </svg>
    );
}

function IconeUsuarios(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function IconeObras(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M3 21h18M5 21V9l7-4v16M12 10h7v11" />
            <path d="M8 12h1M8 16h1M15 13h1M15 17h1" />
            <path d="M10 5V3h4v4" />
        </svg>
    );
}

function IconeContratos(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
    );
}
