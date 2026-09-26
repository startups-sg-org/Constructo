import { useMemo, useState } from "react";

import type { LocalObra } from "../../../features/empreendimentos/empreendimentos.service";
import StructureTreeItem from "./StructureTreeItem";
import "./StructureTree.css";

type StructureTreeProps = {
  locais: LocalObra[];
  onSelect?: (local: LocalObra) => void;
  selecionadoId?: string | null;
};

export default function StructureTree({ locais, onSelect, selecionadoId: selecionadoIdControlado }: StructureTreeProps) {
  const [selecionadoIdInterno, setSelecionadoIdInterno] = useState<string | null>(null);
  const selecionadoId = selecionadoIdControlado === undefined ? selecionadoIdInterno : selecionadoIdControlado;
  const [expandidos, setExpandidos] = useState<Set<string>>(
    () => new Set(locais.filter((local) => local.parent_id === null).map((local) => local.id)),
  );

  const filhosPorPai = useMemo(() => {
    const grupos = new Map<string | null, LocalObra[]>();
    for (const local of locais) {
      const grupo = grupos.get(local.parent_id) ?? [];
      grupo.push(local);
      grupos.set(local.parent_id, grupo);
    }
    for (const grupo of grupos.values()) {
      grupo.sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"));
    }
    return grupos;
  }, [locais]);

  const alternar = (id: string) => {
    setExpandidos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  const selecionar = (local: LocalObra) => {
    setSelecionadoIdInterno(local.id);
    onSelect?.(local);
  };

  const raizes = filhosPorPai.get(null) ?? [];
  if (raizes.length === 0) {
    return <p className="structure-tree__vazio">Nenhum local cadastrado.</p>;
  }

  return (
    <ul className="structure-tree" aria-label="Estrutura física do empreendimento">
      {raizes.map((local) => (
        <StructureTreeItem
          key={local.id}
          local={local}
          filhos={filhosPorPai.get(local.id) ?? []}
          filhosPorPai={filhosPorPai}
          expandidos={expandidos}
          selecionadoId={selecionadoId}
          onToggle={alternar}
          onSelect={selecionar}
        />
      ))}
    </ul>
  );
}
