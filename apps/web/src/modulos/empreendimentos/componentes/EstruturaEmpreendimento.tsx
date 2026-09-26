import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";

import { carregarEstruturaEmpreendimento } from "../../../features/empreendimentos/empreendimento.loader";
import PaginaPainel from "../../../pages/Painel/PaginaPainel";
import StructureTree from "./StructureTree";

export default function EstruturaEmpreendimento() {
  const locais = useLoaderData<typeof carregarEstruturaEmpreendimento>();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const selecionado = locais.find((local) => local.id === selecionadoId) ?? null;
  const caminho = useMemo(() => {
    if (!selecionado) return [];
    const porId = new Map(locais.map((local) => [local.id, local]));
    const resultado = [];
    const visitados = new Set<string>();
    let atual: typeof selecionado | undefined = selecionado;
    while (atual && !visitados.has(atual.id)) {
      resultado.unshift(atual.nome);
      visitados.add(atual.id);
      atual = atual.parent_id ? porId.get(atual.parent_id) : undefined;
    }
    return resultado;
  }, [locais, selecionado]);

  return (
    <PaginaPainel
      titulo="Estrutura física"
      subtitulo="Visualize a hierarquia de torres, blocos, pavimentos e unidades."
    >
      <article className="card">
        <div className="structure-layout">
          <StructureTree locais={locais} onSelect={(local) => setSelecionadoId(local.id)} />
          <aside className="structure-selection" aria-live="polite">
            <h2>Local selecionado</h2>
            {selecionado ? (
              <dl>
                <dt>ID</dt>
                <dd>{selecionado.id}</dd>
                <dt>Nome</dt>
                <dd>{selecionado.nome}</dd>
                <dt>Tipo</dt>
                <dd>{selecionado.tipo}</dd>
                <dt>Empreendimento</dt>
                <dd>{selecionado.empreendimento_id}</dd>
                <dt>Caminho</dt>
                <dd>{[selecionado.empreendimento_id, ...caminho].join(" > ")}</dd>
              </dl>
            ) : (
              <p>Nenhum local selecionado.</p>
            )}
          </aside>
        </div>
      </article>
    </PaginaPainel>
  );
}
