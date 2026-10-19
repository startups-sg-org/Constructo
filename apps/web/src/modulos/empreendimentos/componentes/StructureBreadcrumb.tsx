import type { LocalSelecionado } from "../../../features/empreendimentos/localSelecionado";

type StructureBreadcrumbProps = {
    selecao: LocalSelecionado | null;
    onSelect: (id: number | null) => void;
};

export default function StructureBreadcrumb({ selecao, onSelect }: StructureBreadcrumbProps) {
    const caminho = selecao?.caminho ?? [];

    return (
        <nav className="min-w-0" aria-label="Caminho do local">
            <ol className="m-0 flex min-w-0 list-none flex-wrap items-center gap-1.5 p-0 font-label-sm text-label-sm">
                <li className="min-w-0" aria-current={!selecao ? "page" : undefined}>
                    {selecao ? (
                        <button
                            className="ds-focus-ring rounded-sm border-0 bg-transparent p-0 text-default-font hover:text-accent"
                            type="button"
                            onClick={() => onSelect(null)}
                        >
                            Raiz da estrutura
                        </button>
                    ) : (
                        <span className="text-accent">Raiz da estrutura</span>
                    )}
                </li>
                {caminho.map((local, indice) => {
                    const atual = indice === caminho.length - 1;
                    return (
                        <li className="flex min-w-0 items-center gap-1.5" key={local.id} aria-current={atual ? "page" : undefined}>
                            <span className="text-foreground-muted" aria-hidden="true">/</span>
                            {atual ? (
                                <span className="max-w-48 truncate text-accent">{local.nome}</span>
                            ) : (
                                <button
                                    className="ds-focus-ring max-w-48 truncate rounded-sm border-0 bg-transparent p-0 text-default-font hover:text-accent"
                                    type="button"
                                    onClick={() => onSelect(local.id)}
                                >
                                    {local.nome}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
