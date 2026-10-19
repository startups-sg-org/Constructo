import type { EstruturaLocal } from "@constructo/shared";
import type { KeyboardEvent, ReactNode } from "react";

import StructureTreeItem from "./StructureTreeItem";

type StructureTreeProps = {
    items: EstruturaLocal[];
    selectedId: number | null;
    onSelect: (item: EstruturaLocal) => void;
    expandedIds: ReadonlySet<number>;
    onToggle: (item: EstruturaLocal) => void;
    renderActions?: (item: EstruturaLocal) => ReactNode;
};

export default function StructureTree({
    items,
    selectedId,
    onSelect,
    expandedIds,
    onToggle,
    renderActions,
}: StructureTreeProps) {
    function navegarPeloTeclado(event: KeyboardEvent<HTMLUListElement>) {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

        const itensVisiveis = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-tree-select="true"]'),
        );
        if (!itensVisiveis.length) return;

        const itemAtual = (event.target as HTMLElement).closest('[role="treeitem"]');
        const botaoAtual = itemAtual?.querySelector<HTMLButtonElement>(':scope > [data-tree-row="true"] [data-tree-select="true"]');
        const indiceAtual = botaoAtual ? itensVisiveis.indexOf(botaoAtual) : -1;
        let proximoIndice = indiceAtual;

        if (event.key === "ArrowDown") proximoIndice = Math.min(indiceAtual + 1, itensVisiveis.length - 1);
        if (event.key === "ArrowUp") proximoIndice = Math.max(indiceAtual - 1, 0);
        if (event.key === "Home") proximoIndice = 0;
        if (event.key === "End") proximoIndice = itensVisiveis.length - 1;

        if (proximoIndice < 0) return;
        event.preventDefault();
        itensVisiveis[proximoIndice]?.focus();
    }

    return (
        <ul
            className="m-0 grid min-w-0 list-none gap-0.5 p-0"
            role="tree"
            aria-label="Estrutura física"
            onKeyDown={navegarPeloTeclado}
        >
            {items.map((item) => (
                <StructureTreeItem
                    key={item.id}
                    item={item}
                    level={1}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    expandedIds={expandedIds}
                    onToggle={onToggle}
                    renderActions={renderActions}
                />
            ))}
        </ul>
    );
}
