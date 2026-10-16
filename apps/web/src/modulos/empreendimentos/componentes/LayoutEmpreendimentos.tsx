import { Link, NavLink, Outlet, useRouteLoaderData } from "react-router-dom";

import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import {
    formatarDataEmpreendimento,
    obterClassesStatus,
    obterRotuloStatus,
} from "./empreendimentoFormatters";

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
        <section className="layout-empreendimentos grid gap-5 text-foreground" aria-labelledby="empreendimento-titulo">
            <nav className="layout-empreendimentos__breadcrumb text-body-sm font-body-sm" aria-label="breadcrumb">
                <ol className="breadcrumb flex flex-wrap items-center gap-2 text-foreground-muted">
                    <li><Link className="ds-accent-link ds-focus-ring-offset" to="/admin/obras">Empreendimentos</Link></li>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page">{empreendimento.nome}</li>
                </ol>
            </nav>

            <header className="layout-empreendimentos__cabecalho ds-panel p-[clamp(1.25rem,4vw,2rem)]">
                <div>
                    <div className="layout-empreendimentos__titulo flex flex-wrap items-center gap-3">
                        <h1 className="text-headline-xl font-headline-xl text-foreground-strong" id="empreendimento-titulo">{empreendimento.nome}</h1>
                        <span className={obterClassesStatus(empreendimento.status)}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                            {obterRotuloStatus(empreendimento.status)}
                        </span>
                    </div>
                    <p className="layout-empreendimentos__metadados mt-2 flex flex-wrap gap-2 text-body-md font-body-md text-foreground-muted">
                        <span>{empreendimento.endereco || "Localização não informada"}</span>
                        <span aria-hidden="true">•</span>
                        <span>Atualizado em {formatarDataEmpreendimento(empreendimento.atualizado_em)}</span>
                    </p>
                </div>
            </header>

            <nav className="layout-empreendimentos__abas flex flex-nowrap gap-1 overflow-x-auto border-b border-border-muted" aria-label="Áreas do empreendimento">
                {abas.map((aba) => (
                    <NavLink
                        className={({ isActive }) => [
                            "ds-focus-ring-offset flex-none border-b-2 px-3.5 py-2.5 text-label-md font-label-md no-underline transition-colors",
                            isActive
                                ? "border-accent text-accent"
                                : "border-transparent text-foreground-muted hover:text-foreground-strong",
                        ].join(" ")}
                        end={aba.fimExato ?? false}
                        key={aba.rotulo}
                        to={aba.destino ? `${rotaBase}/${aba.destino}` : rotaBase}
                    >
                        {aba.rotulo}
                    </NavLink>
                ))}
            </nav>

            <div className="layout-empreendimentos__conteudo min-w-0">
                <Outlet />
            </div>
        </section>
    );
}
