import type { LocalObra } from "../../../features/empreendimentos/empreendimentos.service";

const ROTULOS: Record<LocalObra["tipo"], string> = {
  TORRE: "Torre",
  BLOCO: "Bloco",
  PAVIMENTO: "Pavimento",
  UNIDADE: "Unidade",
};

type StructureTreeItemProps = {
  local: LocalObra;
  filhos: LocalObra[];
  filhosPorPai: Map<string | null, LocalObra[]>;
  expandidos: Set<string>;
  selecionadoId: string | null;
  onToggle: (id: string) => void;
  onSelect: (local: LocalObra) => void;
};

export default function StructureTreeItem({
  local,
  filhos,
  filhosPorPai,
  expandidos,
  selecionadoId,
  onToggle,
  onSelect,
}: StructureTreeItemProps) {
  const expandido = expandidos.has(local.id);
  const temFilhos = filhos.length > 0;

  return (
    <li className="structure-tree__item">
      <div className="structure-tree__linha">
        {temFilhos ? (
          <button
            type="button"
            className="structure-tree__toggle"
            aria-label={`${expandido ? "Recolher" : "Expandir"} ${local.nome}`}
            aria-expanded={expandido}
            onClick={() => onToggle(local.id)}
          >
            {expandido ? "▾" : "▸"}
          </button>
        ) : (
          <span className="structure-tree__toggle-placeholder" aria-hidden="true" />
        )}
        <button
          type="button"
          className={`structure-tree__select${selecionadoId === local.id ? " selecionado" : ""}`}
          aria-current={selecionadoId === local.id ? "true" : undefined}
          onClick={() => onSelect(local)}
        >
          <span className={`structure-tree__tipo structure-tree__tipo--${local.tipo.toLowerCase()}`}>
            {ROTULOS[local.tipo]}
          </span>
          <span>{local.nome}</span>
        </button>
      </div>
      {temFilhos && expandido && (
        <ul className="structure-tree__filhos">
          {filhos.map((filho) => (
            <StructureTreeItem
              key={filho.id}
              local={filho}
              filhos={filhosPorPai.get(filho.id) ?? []}
              filhosPorPai={filhosPorPai}
              expandidos={expandidos}
              selecionadoId={selecionadoId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
