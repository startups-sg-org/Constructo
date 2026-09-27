import type { EstruturaLocal } from "@constructo/shared";
import type { ReactNode } from "react";

import StructureTreeItem from "./StructureTreeItem";
import "./StructureTree.css";

type StructureTreeProps = {
    items: EstruturaLocal[];
    selectedId: number | null;
    onSelect: (item: EstruturaLocal) => void;
    renderActions?: (item: EstruturaLocal) => ReactNode;
};

export default function StructureTree({
    items,
    selectedId,
    onSelect,
    renderActions,
}: StructureTreeProps) {
    return (
        <ul className="structure-tree" role="tree" aria-label="Estrutura física">
            {items.map((item) => (
                <StructureTreeItem
                    key={item.id}
                    item={item}
                    level={1}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    renderActions={renderActions}
                />
            ))}
        </ul>
    );
}
