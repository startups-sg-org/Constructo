import type { EstruturaLocal } from "@constructo/shared";
import type { ReactNode } from "react";

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

    return (
        <li
            className={`structure-tree__item structure-tree__item--${item.tipo.toLowerCase()}`}
        >
            <div className="structure-tree__row">
                {hasChildren ? (
                    <button
                        className="structure-tree__toggle"
                        type="button"
                        aria-label={`${expanded ? "Recolher" : "Expandir"} ${item.nome}`}
                        aria-expanded={expanded}
                        onClick={() => onToggle(item)}
                    >
                        <span aria-hidden="true">{expanded ? "⌄" : "›"}</span>
                    </button>
                ) : (
                    <span className="structure-tree__leaf" aria-hidden="true" />
                )}
                <span className="structure-tree__icon" aria-hidden="true" />
                <button
                    className="structure-tree__select"
                    type="button"
                    aria-current={selectedId === item.id ? "true" : undefined}
                    onClick={() => onSelect(item)}
                >{item.nome}</button>
                <span className="structure-tree__type">{rotulos[item.tipo]}</span>
                {renderActions && <span className="structure-tree__actions">{renderActions(item)}</span>}
            </div>

            {hasChildren && expanded && (
                <ul className="structure-tree__group">
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
