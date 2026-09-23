import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";
import "./SidebarItem.css";

export type IconeSidebar = ComponentType<SVGProps<SVGSVGElement>>;

export type SidebarItemProps = {
    texto: string;
    icone: IconeSidebar;
    rota: string;
    ativo: boolean;
    recolhido?: boolean;
};

export default function SidebarItem({
    texto,
    icone: Icone,
    rota,
    ativo,
    recolhido = false
}: SidebarItemProps) {
    const classes = [
        "sidebar__item",
        ativo && "sidebar__item--ativo",
        recolhido && "sidebar__item--recolhido"
    ].filter(Boolean).join(" ");

    return (
        <li>
            <Link
                className={classes}
                to={rota}
                aria-current={ativo ? "page" : undefined}
                title={recolhido ? texto : undefined}
            >
                <Icone aria-hidden="true" />
                <span className="sidebar__item-rotulo">{texto}</span>
            </Link>
        </li>
    );
}
