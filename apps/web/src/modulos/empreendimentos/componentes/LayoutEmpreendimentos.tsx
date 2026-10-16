import { Link, NavLink, Outlet, useRouteLoaderData } from "react-router-dom";

import BadgeStatus from "../../../componentes/BadgeStatus/BadgeStatus";
import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import {
    formatarDataEmpreendimento,
    obterRotuloStatus,
    obterTomStatus,
} from "./empreendimentoFormatters";
import "./LayoutEmpreendimentos.css";

type AbaEmpreendimento = {
    rotulo: string;
    destino: string;
    fimExato?: boolean;
};

const abas: readonly AbaEmpreendimento[] = [
    { rotulo: "Visualizar", destino: "", fimExato: true },
    { rotulo: "Editar", destino: "editar" },
    { rotulo: "Estrutura", destino: "estrutura" },
    { rotulo: "Taxonomia", destino: "taxonomia" },
    { rotulo: "Contratos", destino: "contratos" },
    { rotulo: "Medições", destino: "medicoes" },
    { rotulo: "Documentos", destino: "documentos" },
];

export default function LayoutEmpreendimentos() {
    const empreendimento = useRouteLoaderData<typeof carregarEmpreendimento>("empreendimento");

    if (!empreendimento) return null;

    const rotaBase = `/admin/empreendimentos/${empreendimento.id}`;

    return (
        <section className="layout-empreendimentos" aria-labelledby="empreendimento-titulo">
            <nav className="layout-empreendimentos__breadcrumb" aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/admin/obras">Empreendimentos</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">{empreendimento.nome}</li>
                </ol>
            </nav>

            <header className="layout-empreendimentos__cabecalho">
                <div>
                    <div className="layout-empreendimentos__titulo">
                        <h1 id="empreendimento-titulo">{empreendimento.nome}</h1>
                        <BadgeStatus tom={obterTomStatus(empreendimento.status)}>
                            {obterRotuloStatus(empreendimento.status)}
                        </BadgeStatus>
                    </div>
                    <p className="layout-empreendimentos__metadados">
                        <span>{empreendimento.endereco || "Localização não informada"}</span>
                        <span aria-hidden="true">•</span>
                        <span>Atualizado em {formatarDataEmpreendimento(empreendimento.atualizado_em)}</span>
                    </p>
                </div>
            </header>

            <nav className="layout-empreendimentos__abas nav" aria-label="Áreas do empreendimento">
                {abas.map((aba) => (
                    <NavLink
                        className="nav-link"
                        end={aba.fimExato ?? false}
                        key={aba.rotulo}
                        to={aba.destino ? `${rotaBase}/${aba.destino}` : rotaBase}
                    >
                        {aba.rotulo}
                    </NavLink>
                ))}
            </nav>

            <div className="layout-empreendimentos__conteudo">
                <Outlet />
            </div>
        </section>
    );
}
