import { Breadcrumb, Nav } from "react-bootstrap";
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
            <Breadcrumb className="layout-empreendimentos__breadcrumb">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/admin/obras" }}>
                    Empreendimentos
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{empreendimento.nome}</Breadcrumb.Item>
            </Breadcrumb>

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

            <Nav className="layout-empreendimentos__abas" aria-label="Áreas do empreendimento">
                {abas.map((aba) => (
                    <Nav.Link
                        as={NavLink}
                        end={aba.fimExato ?? false}
                        key={aba.rotulo}
                        to={aba.destino ? `${rotaBase}/${aba.destino}` : rotaBase}
                    >
                        {aba.rotulo}
                    </Nav.Link>
                ))}
            </Nav>

            <div className="layout-empreendimentos__conteudo">
                <Outlet />
            </div>
        </section>
    );
}
