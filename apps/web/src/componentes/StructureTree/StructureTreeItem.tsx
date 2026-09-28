import type { EstruturaLocal } from "@constructo/shared";
import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

const rotulos = {
    TORRE: "Torre",
    BLOCO: "Bloco",
    PAVIMENTO: "Pavimento",
    UNIDADE: "Unidade",
} as const;

type StructureTreeItemProps = {
    item: EstruturaLocal;
    level: number;
    selectedId: number | null;
    onSelect: (item: EstruturaLocal) => void;
    renderActions?: (item: EstruturaLocal) => ReactNode;
};

export default function StructureTreeItem({
    item,
    level,
    selectedId,
    onSelect,
    renderActions,
}: StructureTreeItemProps) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = item.filhos.length > 0;

    function selecionar(event: KeyboardEvent<HTMLLIElement>) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        onSelect(item);
    }

    function alternar(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        setExpanded((value) => !value);
    }

    return (
        <li
            className={`structure-tree__item structure-tree__item--${item.tipo.toLowerCase()}`}
            role="treeitem"
            aria-label={`${item.nome}, ${rotulos[item.tipo]}`}
            aria-level={level}
            aria-selected={selectedId === item.id}
            aria-expanded={hasChildren ? expanded : undefined}
            tabIndex={0}
            onClick={(event) => {
                event.stopPropagation();
                onSelect(item);
            }}
            onKeyDown={selecionar}
        >
            <div className="structure-tree__row">
                {hasChildren ? (
                    <button
                        className="structure-tree__toggle"
                        type="button"
                        aria-label={`${expanded ? "Recolher" : "Expandir"} ${item.nome}`}
                        onClick={alternar}
                    >
                        <span aria-hidden="true">{expanded ? "⌄" : "›"}</span>
                    </button>
                ) : (
                    <span className="structure-tree__leaf" aria-hidden="true" />
                )}
                <span className="structure-tree__icon" aria-hidden="true" />
                <span className="structure-tree__name">{item.nome}</span>
                <span className="structure-tree__type">{rotulos[item.tipo]}</span>
                {renderActions && (
                    <span className="structure-tree__actions" onClick={(event) => event.stopPropagation()}>
                        {renderActions(item)}
                    </span>
                )}
            </div>

            {hasChildren && expanded && (
                <ul className="structure-tree__group" role="group">
                    {item.filhos.map((filho) => (
                        <StructureTreeItem
                            key={filho.id}
                            item={filho}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            renderActions={renderActions}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
