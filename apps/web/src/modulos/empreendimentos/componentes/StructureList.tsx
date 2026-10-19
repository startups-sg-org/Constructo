import type { EstruturaLocal } from "@constructo/shared";
import type { ReactNode } from "react";

const rotulos = { TORRE: "Torre", BLOCO: "Bloco", PAVIMENTO: "Pavimento", UNIDADE: "Unidade" } as const;
const rotulosContagem = {
    TORRE: ["torre", "torres"],
    BLOCO: ["bloco", "blocos"],
    PAVIMENTO: ["pavimento", "pavimentos"],
    UNIDADE: ["unidade", "unidades"],
} as const;

const estilos = {
    cabecalho: "flex min-w-0 flex-wrap items-center justify-between gap-2",
    quantidade: "flex-none font-body-sm text-body-sm text-foreground-muted",
    estado: "m-0 rounded-md border border-dashed border-border-muted px-3 py-5 text-center font-body-sm text-body-sm text-foreground-muted",
    tabelaContainer: "min-w-0 overflow-x-auto rounded-md border border-border-muted",
    tabela: "w-full min-w-[30rem] border-collapse text-left",
    cabecalhoTabela: "bg-surface-muted",
    tituloColuna: "ds-table-heading border-b border-border-muted text-left",
    tituloColunaAcoes: "ds-table-heading w-14 border-b border-border-muted text-right",
    linha: "border-b border-border-muted transition-colors last:border-b-0 hover:bg-surface-hover",
    celula: "px-3 py-2.5 font-body-sm text-body-sm text-foreground-muted",
    nome: "ds-focus-ring rounded-sm border-0 bg-transparent p-0 text-left font-label-md text-label-md text-accent hover:underline",
    ordem: "px-3 py-2.5 text-code-sm font-code-sm text-default-font tabular-nums",
    acao: "ds-icon-button ml-auto h-7 w-7 border-0 bg-transparent text-foreground-muted hover:bg-surface-hover hover:text-accent",
} as const;

type StructureListProps = {
    items: EstruturaLocal[];
    busca: string;
    contexto: string;
    breadcrumb: ReactNode;
    onSelect: (item: EstruturaLocal) => void;
};

function obterRotuloQuantidade(items: EstruturaLocal[], quantidade: number): string {
    const tipos = new Set(items.map((item) => item.tipo));
    if (tipos.size !== 1) return quantidade === 1 ? "local" : "locais";

    const tipo = items[0]?.tipo;
    if (!tipo) return quantidade === 1 ? "local" : "locais";
    return rotulosContagem[tipo][quantidade === 1 ? 0 : 1];
}

export default function StructureList({ items, busca, contexto, breadcrumb, onSelect }: StructureListProps) {
    const filtro = busca.trim().toLocaleLowerCase();
    const visiveis = filtro ? items.filter((item) => item.nome.toLocaleLowerCase().includes(filtro)) : items;
    const quantidade = filtro && visiveis.length !== items.length
        ? `${visiveis.length} de ${items.length} ${obterRotuloQuantidade(items, items.length)}`
        : `${items.length} ${obterRotuloQuantidade(items, items.length)}`;

    return (
        <div className="grid min-w-0 gap-3">
            <div className={estilos.cabecalho}>
                {breadcrumb}
                <span className={estilos.quantidade}>{quantidade}</span>
            </div>

            {!items.length && (
                <p className={estilos.estado} role="status">{contexto} não possui locais filhos.</p>
            )}
            {items.length > 0 && !visiveis.length && (
                <p className={estilos.estado} role="status">Nenhum local deste nível corresponde à busca.</p>
            )}
            {visiveis.length > 0 && (
                <div className={estilos.tabelaContainer}>
                    <table className={estilos.tabela}>
                        <caption className="sr-only">Locais filhos de {contexto}</caption>
                        <thead className={estilos.cabecalhoTabela}>
                            <tr>
                                <th className={estilos.tituloColuna} scope="col">Nome</th>
                                <th className={estilos.tituloColuna} scope="col">Tipo</th>
                                <th className={estilos.tituloColuna} scope="col">Ordem</th>
                                <th className={estilos.tituloColunaAcoes} scope="col">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visiveis.map((item) => (
                                <tr className={estilos.linha} key={item.id}>
                                    <td className={estilos.celula}>
                                        <button className={estilos.nome} type="button" onClick={() => onSelect(item)}>
                                            {item.nome}
                                        </button>
                                    </td>
                                    <td className={estilos.celula}>{rotulos[item.tipo]}</td>
                                    <td className={estilos.ordem}>{item.ordem}</td>
                                    <td className={estilos.celula}>
                                        <button
                                            className={estilos.acao}
                                            type="button"
                                            aria-label={`Ver detalhes de ${item.nome}`}
                                            title="Ver detalhes"
                                            onClick={() => onSelect(item)}
                                        >
                                            <i className="bi bi-arrow-up-right" aria-hidden="true" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
