import type { EstruturaLocal } from "@constructo/shared";
import type { KeyboardEvent, ReactNode } from "react";

import { cn } from "../../utils/classes";

const rotulos = {
    TORRE: "Torre",
    BLOCO: "Bloco",
    PAVIMENTO: "Pavimento",
    UNIDADE: "Unidade",
} as const;

const icones = {
    TORRE: "bi-building",
    BLOCO: "bi-building",
    PAVIMENTO: "bi-layers",
    UNIDADE: "bi-square",
} as const;

const estilos = {
    item: "relative min-w-0",
    itemFilho: "before:pointer-events-none before:absolute before:-left-2 before:top-4 before:h-px before:w-2 before:bg-border-muted",
    linha: "group relative flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-1 py-1 transition-colors hover:bg-surface-hover focus-within:bg-surface-hover",
    linhaSelecionada: "bg-surface-selected before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-accent",
    alternar: "ds-focus-ring grid h-6 w-6 flex-none cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-body-sm text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground-strong",
    folha: "h-6 w-6 flex-none",
    icone: "grid h-6 w-6 flex-none place-items-center rounded-sm text-body-sm text-foreground-muted",
    iconeSelecionado: "text-accent",
    selecionar: "ds-focus-ring min-w-0 flex-1 cursor-pointer truncate rounded-sm border-0 bg-transparent px-1 py-0.5 text-left font-label-sm text-label-sm text-default-font transition-colors hover:text-foreground-strong",
    selecionarAtivo: "font-medium text-accent",
    acoes: "ml-auto flex-none opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100",
    grupo: "relative ml-3 mt-0.5 grid min-w-0 list-none gap-0.5 border-l border-border-muted p-0 pl-2",
} as const;

type StructureTreeItemProps = {
    item: EstruturaLocal;
    level: number;
    selectedId: number | null;
    onSelect: (item: EstruturaLocal) => void;
    expandedIds: ReadonlySet<number>;
    onToggle: (item: EstruturaLocal) => void;
    renderActions?: (item: EstruturaLocal) => ReactNode;
};

export default function StructureTreeItem({
    item,
    level,
    selectedId, onSelect, expandedIds, onToggle,
    renderActions,
}: StructureTreeItemProps) {
    const hasChildren = item.filhos.length > 0;
    const expanded = expandedIds.has(item.id);
    const selected = selectedId === item.id;

    function tratarTeclasDoItem(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === "ArrowRight" && hasChildren) {
            event.preventDefault();
            if (!expanded) {
                onToggle(item);
                return;
            }

            const itemAtual = event.currentTarget.closest('[role="treeitem"]');
            itemAtual
                ?.querySelector<HTMLButtonElement>(':scope > [role="group"] [data-tree-select="true"]')
                ?.focus();
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            if (hasChildren && expanded) {
                onToggle(item);
                return;
            }

            const grupoPai = event.currentTarget.closest('[role="group"]');
            grupoPai
                ?.closest<HTMLLIElement>('[role="treeitem"]')
                ?.querySelector<HTMLButtonElement>(':scope > [data-tree-row="true"] [data-tree-select="true"]')
                ?.focus();
        }
    }

    return (
        <li
            className={cn(estilos.item, level > 1 && estilos.itemFilho)}
            role="treeitem"
            aria-level={level}
            aria-selected={selected}
            aria-expanded={hasChildren ? expanded : undefined}
        >
            <div
                className={cn(estilos.linha, selected && estilos.linhaSelecionada)}
                data-tree-row="true"
            >
                {hasChildren ? (
                    <button
                        className={estilos.alternar}
                        type="button"
                        aria-label={`${expanded ? "Recolher" : "Expandir"} ${item.nome}`}
                        aria-expanded={expanded}
                        onClick={() => onToggle(item)}
                    >
                        <i className={cn("bi", expanded ? "bi-chevron-down" : "bi-chevron-right")} aria-hidden="true" />
                    </button>
                ) : (
                    <span className={estilos.folha} aria-hidden="true" />
                )}
                <span
                    className={cn(estilos.icone, selected && estilos.iconeSelecionado)}
                    role="img"
                    aria-label={rotulos[item.tipo]}
                >
                    <i className={cn("bi", icones[item.tipo])} aria-hidden="true" />
                </span>
                <button
                    className={cn(estilos.selecionar, selected && estilos.selecionarAtivo)}
                    type="button"
                    data-tree-select="true"
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onSelect(item)}
                    onKeyDown={tratarTeclasDoItem}
                >{item.nome}</button>
                {renderActions && <span className={estilos.acoes}>{renderActions(item)}</span>}
            </div>

            {hasChildren && expanded && (
                <ul className={estilos.grupo} role="group">
                    {item.filhos.map((filho) => (
                        <StructureTreeItem
                            key={filho.id}
                            item={filho}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            renderActions={renderActions}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
