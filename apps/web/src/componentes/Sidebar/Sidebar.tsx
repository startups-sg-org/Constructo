import { useState, type SVGProps } from "react";
import { matchPath, NavLink, useLocation } from "react-router-dom";
import SidebarItem, { type IconeSidebar } from "./SidebarItem";
import "./Sidebar.css";

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
    { rotulo: "Obras", rota: "/admin/obras", icone: IconeObras },
    { rotulo: "Contratos", rota: "/admin/contratos", icone: IconeContratos },
    { rotulo: "Medições", rota: "/admin/medicoes", icone: IconeMedicoes }
];

export default function Sidebar({ className = "" }: SidebarProps) {
    const [aberta, setAberta] = useState(true);
    const { pathname } = useLocation();

    return (
        <aside
            className={`sidebar${aberta ? "" : " sidebar--fechada"} ${className}`.trim()}
            aria-label="Navegação principal"
        >
            <div className="sidebar__cabecalho">
                <NavLink className="sidebar__marca" to="/admin" aria-label="Constructo — início">
                    <LogoConstructo />
                    <span className="sidebar__nome">Constructo</span>
                </NavLink>

                <button
                    className="sidebar__alternar"
                    type="button"
                    aria-controls="sidebar-navegacao"
                    aria-expanded={aberta}
                    aria-label={aberta ? "Fechar menu lateral" : "Abrir menu lateral"}
                    title={aberta ? "Fechar menu" : "Abrir menu"}
                    onClick={() => setAberta((valorAtual) => !valorAtual)}
                >
                    <IconeSeta aria-hidden="true" />
                </button>
            </div>

            <nav className="sidebar__navegacao" id="sidebar-navegacao">
                <span className="sidebar__secao">Menu principal</span>

                <ul className="sidebar__lista">
                    {itensNavegacao.map(({ rotulo, rota, icone: IconeItem, exato }) => (
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

            <div className="sidebar__rodape" aria-hidden="true">
                <span className="sidebar__rodape-marca">C</span>
                <span className="sidebar__rodape-texto">
                    <strong>Constructo</strong>
                    <small>Gestão inteligente</small>
                </span>
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

function LogoConstructo() {
    return (
        <svg className="sidebar__logo" viewBox="0 0 44 44" aria-hidden="true">
            <path d="M22 2 39.3 12v20L22 42 4.7 32V12L22 2Z" fill="currentColor" />
            <path
                d="M29.7 14.8a10 10 0 1 0 .2 14.2l-4-3.2a5 5 0 1 1-.1-7.7l3.9-3.3Z"
                fill="white"
            />
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

function IconeMedicoes(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M4 19V9M10 19V5M16 19v-7M22 19V2" />
            <path d="M2 19h20" />
        </svg>
    );
}
