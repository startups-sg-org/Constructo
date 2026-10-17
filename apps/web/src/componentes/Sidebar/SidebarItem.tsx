import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/classes";

export type IconeSidebar = ComponentType<SVGProps<SVGSVGElement>>;

export type SidebarItemProps = {
    texto: string;
    icone: IconeSidebar;
    rota: string;
    ativo: boolean;
    recolhido?: boolean;
};

const estilos = {
    item: "sidebar__item ds-menu-item ds-focus-ring-offset group relative gap-4 text-foreground no-underline hover:bg-surface-hover",
    ativo: "sidebar__item--ativo bg-surface-selected text-foreground-strong before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-accent",
    recolhido: "sidebar__item--recolhido justify-center px-2",
    icone: "h-[22px] w-[22px] flex-none",
    iconeAtivo: "text-foreground",
    iconeInativo: "text-foreground-muted group-hover:text-foreground",
    rotulo: "sidebar__item-rotulo overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300",
    rotuloVisivel: "max-w-40 opacity-100",
    rotuloOculto: "max-w-0 opacity-0",
} as const;

export default function SidebarItem({
    texto,
    icone: Icone,
    rota,
    ativo,
    recolhido = false
}: SidebarItemProps) {
    return (
        <li>
            <Link
                className={cn(estilos.item, ativo && estilos.ativo, recolhido && estilos.recolhido)}
                to={rota}
                aria-current={ativo ? "page" : undefined}
                title={recolhido ? texto : undefined}
            >
                <Icone
                    className={cn(estilos.icone, ativo ? estilos.iconeAtivo : estilos.iconeInativo)}
                    aria-hidden="true"
                />
                <span className={cn(estilos.rotulo, recolhido ? estilos.rotuloOculto : estilos.rotuloVisivel)}>
                    {texto}
                </span>
            </Link>
        </li>
    );
}
