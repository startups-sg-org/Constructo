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
        <section className="layout-empreendimentos grid gap-4 text-foreground" aria-labelledby="empreendimento-titulo">
            <nav className="layout-empreendimentos__breadcrumb font-code-sm text-code-sm" aria-label="breadcrumb">
                <ol className="breadcrumb flex flex-wrap items-center gap-2">
                    <li className="text-foreground-muted">constructo /</li>
                    <li><Link className="ds-accent-link ds-focus-ring-offset" to="/admin/obras">empreendimentos</Link></li>
                    <li className="text-foreground-muted" aria-hidden="true">/</li>
                    <li className="text-foreground" aria-current="page">{empreendimento.nome}</li>
                    <li className="rounded-sm border border-border-control bg-surface-muted px-1.5 text-foreground-muted">live-sync</li>
                </ol>
            </nav>

            <header className="layout-empreendimentos__cabecalho ds-panel p-4">
                <div className="flex w-full items-start gap-3">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-md border border-border-control bg-surface-muted text-xl text-foreground" aria-hidden="true">
                        <i className="bi bi-building" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="layout-empreendimentos__titulo flex flex-wrap items-center gap-2">
                            <h1 className="font-headline-md text-headline-md font-semibold text-foreground-strong" id="empreendimento-titulo">{empreendimento.nome}</h1>
                            <span className="rounded-sm border border-border-control bg-surface-muted px-1 font-code-sm text-code-sm text-foreground">ATIVO</span>
                        </div>
                        <p className="layout-empreendimentos__metadados mt-1 flex flex-wrap items-center gap-2 text-body-sm font-body-sm text-foreground-muted">
                            <i className="bi bi-geo-alt" aria-hidden="true" />
                            <span className="text-foreground">{empreendimento.endereco || "Localização não informada"}</span>
                            <span className="h-1 w-1 rounded-full bg-foreground-muted" aria-hidden="true" />
                            <span>Atualizado em {formatarDataEmpreendimento(empreendimento.atualizado_em)}</span>
                        </p>
                    </div>
                    <span className={obterClassesStatus(empreendimento.status)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                        {obterRotuloStatus(empreendimento.status)}
                    </span>
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
