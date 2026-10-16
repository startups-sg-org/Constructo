import { useMemo, useState } from "react";
import { useLoaderData, Link } from "react-router-dom";
import type { Empreendimento } from "@constructo/shared";

import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";
import { carregarEmpreendimentos } from "../../../features/empreendimentos/empreendimentos.loader";
import { formatarDataEmpreendimento, obterClassesStatus, obterRotuloStatus } from "./empreendimentoFormatters";

type Ordenacao = "atualizado-desc" | "atualizado-asc" | "nome-asc" | "nome-desc";

export default function ListaEmpreendimentos() {
    const empreendimentos = useLoaderData<typeof carregarEmpreendimentos>();
    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState<Empreendimento["status"] | "TODOS">("TODOS");
    const [ordenacao, setOrdenacao] = useState<Ordenacao>("atualizado-desc");

    const empreendimentosVisiveis = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        const filtrados = empreendimentos.filter((empreendimento) => {
            const correspondeStatus = status === "TODOS" || empreendimento.status === status;
            const texto = [empreendimento.nome, empreendimento.descricao, empreendimento.endereco]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("pt-BR");
            return correspondeStatus && (!termo || texto.includes(termo));
        });

        return [...filtrados].sort((a, b) => compararEmpreendimentos(a, b, ordenacao));
    }, [busca, empreendimentos, ordenacao, status]);

    const filtrosAtivos = Boolean(busca.trim()) || status !== "TODOS";
    const limparFiltros = () => {
        setBusca("");
        setStatus("TODOS");
    };

    return (
        <section className="lista-empreendimentos mt-6 text-foreground" aria-labelledby="lista-empreendimentos-titulo">
            <h2 id="lista-empreendimentos-titulo" className="sr-only">
                Lista de empreendimentos
            </h2>

            <div className="w-full">
              <div className="lista-empreendimentos__ferramentas ds-panel p-4">
                <div className="grid grid-cols-1 items-end gap-2 md:grid-cols-[minmax(16rem,1fr)_minmax(10rem,0.45fr)_minmax(13rem,0.55fr)_auto]">
                    <div>
                        <label htmlFor="busca-empreendimento" className="sr-only">
                            Buscar empreendimento
                        </label>
                        <input
                            className="ds-dark-field bg-canvas! text-body-md! placeholder:text-foreground-muted"
                            id="busca-empreendimento"
                            type="search"
                            value={busca}
                            placeholder="Buscar empreendimento..."
                            onChange={(evento) => setBusca(evento.target.value)}
                        />
                    </div>
                    <div>
                            <label htmlFor="filtro-status" className="sr-only">
                                Filtrar por status
                            </label>
                            <select
                                className="ds-dark-field bg-surface-hover! text-label-sm!"
                                id="filtro-status"
                                value={status}
                                aria-describedby="filtro-status-ajuda"
                                onChange={(evento) => setStatus(evento.target.value as typeof status)}
                            >
                                <option value="TODOS">Todos os status</option>
                                <option value="PLANEJADO">Planejado</option>
                                <option value="EM_ANDAMENTO">Em andamento</option>
                                <option value="CONCLUIDO">Concluído</option>
                                <option value="INATIVO">Inativo</option>
                            </select>
                            <small id="filtro-status-ajuda" className="sr-only">
                                Filtre os empreendimentos pelo status atual.
                            </small>
                    </div>
                    <div>
                            <label htmlFor="ordenacao-empreendimentos" className="sr-only">
                                Ordenar empreendimentos
                            </label>
                            <select
                                className="ds-dark-field bg-surface-hover! text-label-sm!"
                                id="ordenacao-empreendimentos"
                                value={ordenacao}
                                aria-describedby="ordenacao-empreendimentos-ajuda"
                                onChange={(evento) => setOrdenacao(evento.target.value as Ordenacao)}
                            >
                                <option value="atualizado-desc">Atualizado mais recentemente</option>
                                <option value="atualizado-asc">Atualizado há mais tempo</option>
                                <option value="nome-asc">Nome: A–Z</option>
                                <option value="nome-desc">Nome: Z–A</option>
                            </select>
                            <small id="ordenacao-empreendimentos-ajuda" className="sr-only">
                                Escolha como ordenar a lista de empreendimentos.
                            </small>
                    </div>
                    <div>
                        <a
                            className="ds-focus-ring-offset inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-md bg-[#1f6feb] px-3 py-1.5 text-label-sm font-label-sm text-white no-underline transition-colors hover:bg-[#388bfd] md:w-auto"
                            href="#novo-empreendimento"
                            role="button"
                            aria-controls="novo-empreendimento"
                            onClick={() => {
                                document.getElementById("novo-empreendimento")?.scrollIntoView({ behavior: "smooth" });
                                window.setTimeout(() => document.getElementById("nome")?.focus(), 0);
                            }}
                        >
                            <i className="bi bi-plus-lg" aria-hidden="true" />
                            Criar empreendimento
                        </a>
                    </div>
                </div>
              </div>

              <div className="lista-empreendimentos__resumo my-3 flex flex-wrap items-center justify-between gap-3 text-body-sm font-body-sm text-foreground-muted" aria-live="polite">
                <span>
                    {empreendimentosVisiveis.length} {empreendimentosVisiveis.length === 1 ? "empreendimento" : "empreendimentos"}
                </span>
                {filtrosAtivos && (
                    <button className="ds-focus-ring-offset rounded-sm p-0 text-label-sm font-label-sm text-accent hover:underline" type="button" onClick={limparFiltros}>
                        Limpar filtros
                    </button>
                )}
              </div>

              {empreendimentos.length === 0 ? (
                <EstadoVazio
                    className="lista-empreendimentos__vazia"
                    titulo="Nenhum empreendimento cadastrado"
                    descricao="Use o botão acima ou o formulário abaixo para adicionar a primeira obra."
                />
            ) : empreendimentosVisiveis.length === 0 ? (
                <EstadoVazio
                    className="lista-empreendimentos__vazia"
                    titulo="Nenhum resultado encontrado"
                    descricao="Ajuste a busca ou os filtros para encontrar um empreendimento."
                />
            ) : (
                <div className="lista-empreendimentos__tabela-container ds-panel overflow-x-auto">
                    <table className="lista-empreendimentos__tabela w-full min-w-[900px] border-collapse text-left" aria-label="Lista de empreendimentos">
                        <thead className="border-b border-border-muted bg-surface-muted">
                            <tr>
                                <th className="ds-table-heading" scope="col">Empreendimento</th>
                                <th className="ds-table-heading" scope="col">Descrição</th>
                                <th className="ds-table-heading" scope="col">Localização</th>
                                <th className="ds-table-heading" scope="col">Status</th>
                                <th className="ds-table-heading" scope="col">Atualizado em</th>
                                <th className="px-3 py-2.5" scope="col"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {empreendimentosVisiveis.map((empreendimento) => (
                                <tr className="border-b border-border-muted transition-colors last:border-b-0 hover:bg-surface-hover" key={empreendimento.id}>
                                    <th className="px-3 py-3" scope="row" data-label="Empreendimento">
                                        <Link
                                            className="lista-empreendimentos__nome ds-focus-ring-offset inline-flex items-center gap-3 text-title-project font-title-project text-foreground-strong no-underline hover:text-accent hover:underline"
                                            to={`/admin/empreendimentos/${empreendimento.id}`}
                                        >
                                            <span className="lista-empreendimentos__icone grid h-7 w-7 flex-none place-items-center rounded-md border border-border-control bg-surface-muted text-foreground-muted" aria-hidden="true">
                                                <i className="bi bi-building" />
                                            </span>
                                            <span>{empreendimento.nome}</span>
                                        </Link>
                                    </th>
                                    <td className="max-w-xs px-3 py-3 text-body-sm font-body-sm text-foreground-muted" data-label="Descrição">{empreendimento.descricao || "Descrição não informada"}</td>
                                    <td className="px-3 py-3 text-body-sm font-body-sm text-foreground-muted" data-label="Localização">{empreendimento.endereco || "Localização não informada"}</td>
                                    <td className="px-3 py-3" data-label="Status">
                                        <span className={obterClassesStatus(empreendimento.status)}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                                            {obterRotuloStatus(empreendimento.status)}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-code-sm font-code-sm text-foreground-muted" data-label="Atualizado em">{formatarDataEmpreendimento(empreendimento.atualizado_em)}</td>
                                    <td className="px-3 py-3 text-right" data-label="Ação">
                                        <Link
                                            className="lista-empreendimentos__abrir ds-accent-link ds-focus-ring-offset text-label-sm font-label-sm"
                                            to={`/admin/empreendimentos/${empreendimento.id}`}
                                        >
                                            Abrir
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              )}
            </div>
        </section>
    );
}
function compararEmpreendimentos(a: Empreendimento, b: Empreendimento, ordenacao: Ordenacao): number {
    if (ordenacao === "nome-asc" || ordenacao === "nome-desc") {
        const resultado = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
        if (resultado !== 0) return ordenacao === "nome-desc" ? -resultado : resultado;
        return a.id - b.id;
    }

    const dataA = new Date(a.atualizado_em).getTime();
    const dataB = new Date(b.atualizado_em).getTime();
    const resultado = (Number.isNaN(dataA) ? 0 : dataA) - (Number.isNaN(dataB) ? 0 : dataB);
    if (resultado !== 0) return ordenacao === "atualizado-desc" ? -resultado : resultado;

    const desempatePorNome = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    if (desempatePorNome !== 0) return desempatePorNome;
    return a.id - b.id;
}
