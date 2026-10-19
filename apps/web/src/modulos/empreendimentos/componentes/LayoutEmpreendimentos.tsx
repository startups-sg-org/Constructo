import { Link, NavLink, Outlet, useRouteLoaderData } from "react-router-dom";

import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import { cn } from "../../../utils/classes";
import {
    formatarDataEmpreendimento,
    obterClassesStatus,
    obterRotuloStatus,
} from "./empreendimentoFormatters";

type AbaEmpreendimento = {
    rotulo: string;
    destino: string;
    icone: string;
    fimExato?: boolean;
};

const abas: readonly AbaEmpreendimento[] = [
    { rotulo: "Visualizar", destino: "", icone: "bi-eye", fimExato: true },
    { rotulo: "Editar", destino: "editar", icone: "bi-pencil" },
    { rotulo: "Estrutura", destino: "estrutura", icone: "bi-diagram-3" },
    { rotulo: "Taxonomia", destino: "taxonomia", icone: "bi-tags" },
    { rotulo: "Contratos", destino: "contratos", icone: "bi-file-earmark-text" },
    { rotulo: "Medições", destino: "medicoes", icone: "bi-bar-chart" },
    { rotulo: "Documentos", destino: "documentos", icone: "bi-folder" },
];

const estilos = {
    raiz: "mx-auto grid w-full max-w-[1280px] min-w-0 gap-4 text-foreground [&_.pagina-painel]:mx-auto [&_.pagina-painel]:max-w-none",
    breadcrumb: "flex min-w-0 items-center gap-2 text-[13px] leading-5 text-foreground-muted",
    breadcrumbLink: "ds-focus-ring-offset rounded-sm text-foreground-muted no-underline transition-colors hover:text-accent",
    cabecalho: "ds-panel flex w-full min-w-0 items-center justify-between gap-4 px-5 py-4 max-md:items-start max-sm:px-4",
    identidade: "flex min-w-0 items-center gap-4 max-sm:items-start max-sm:gap-3",
    icone: "grid h-12 w-12 flex-none place-items-center rounded-md border border-border-control bg-surface-hover text-[24px] text-foreground",
    dados: "grid min-w-0 gap-1.5",
    linhaTitulo: "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1",
    titulo: "min-w-0 font-headline-xl text-headline-xl font-semibold tracking-[-0.02em] text-foreground-strong max-md:font-headline-xl-mobile max-md:text-headline-xl-mobile",
    metadados: "flex min-w-0 flex-wrap items-center gap-2 text-[13px] leading-5 text-foreground-muted",
    abas: "ds-panel flex w-full min-w-0 flex-nowrap items-center gap-1 overflow-x-auto p-1 [scrollbar-width:thin]",
    aba: "ds-focus-ring-offset flex h-10 flex-none items-center gap-2 rounded-md px-3.5 text-[13px] font-medium leading-5 no-underline transition-colors",
    abaAtiva: "bg-surface-hover text-foreground-strong",
    abaInativa: "text-foreground-muted hover:bg-surface-muted hover:text-foreground-strong",
    conteudo: "min-w-0",
} as const;

export default function LayoutEmpreendimentos() {
    const empreendimento = useRouteLoaderData<typeof carregarEmpreendimento>("empreendimento");

    if (!empreendimento) return null;

    const rotaBase = `/admin/empreendimentos/${empreendimento.id}`;

    return (
        <section className={estilos.raiz} aria-labelledby="empreendimento-titulo">
            <nav aria-label="Breadcrumb">
                <ol className={estilos.breadcrumb}>
                    <li className="flex-none" aria-hidden="true">
                        <i className="bi bi-building" />
                    </li>
                    <li className="flex-none">
                        <Link className={estilos.breadcrumbLink} to="/admin/obras">Empreendimentos</Link>
                    </li>
                    <li className="flex-none" aria-hidden="true">/</li>
                    <li className="truncate font-medium text-foreground-strong" aria-current="page">{empreendimento.nome}</li>
                </ol>
            </nav>

            <header className={estilos.cabecalho}>
                <div className={estilos.identidade}>
                    <span className={estilos.icone} aria-hidden="true">
                        <i className="bi bi-building" />
                    </span>
                    <div className={estilos.dados}>
                        <div className={estilos.linhaTitulo}>
                            <h1 className={estilos.titulo} id="empreendimento-titulo">{empreendimento.nome}</h1>
                            <span className={obterClassesStatus(empreendimento.status)}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                                {obterRotuloStatus(empreendimento.status)}
                            </span>
                        </div>
                        <p className={estilos.metadados}>
                            <i className="bi bi-geo-alt" aria-hidden="true" />
                            <span className="min-w-0 truncate text-foreground">{empreendimento.endereco || "Localização não informada"}</span>
                            <span className="h-1 w-1 rounded-full bg-foreground-muted" aria-hidden="true" />
                            <span>Atualizado em {formatarDataEmpreendimento(empreendimento.atualizado_em)}</span>
                        </p>
                    </div>
                </div>
            </header>

            <nav className={estilos.abas} aria-label="Áreas do empreendimento">
                {abas.map((aba) => (
                    <NavLink
                        className={({ isActive }) => cn(
                            estilos.aba,
                            isActive ? estilos.abaAtiva : estilos.abaInativa,
                        )}
                        end={aba.fimExato ?? false}
                        key={aba.rotulo}
                        to={aba.destino ? `${rotaBase}/${aba.destino}` : rotaBase}
                    >
                        <i className={cn("bi", aba.icone)} aria-hidden="true" />
                        {aba.rotulo}
                    </NavLink>
                ))}
            </nav>

            <div className={estilos.conteudo}>
                <Outlet />
            </div>
        </section>
    );
}
