import { useLoaderData } from "react-router-dom";

import { carregarEstruturaEmpreendimento } from "../../../features/empreendimentos/empreendimento.loader";
import PaginaPainel from "../../../pages/Painel/PaginaPainel";
import StructureTree from "./StructureTree";

export default function EstruturaEmpreendimento() {
  const locais = useLoaderData<typeof carregarEstruturaEmpreendimento>();

  return (
    <PaginaPainel
      titulo="Estrutura física"
      subtitulo="Visualize a hierarquia de torres, blocos, pavimentos e unidades."
    >
      <article className="card">
        <StructureTree locais={locais} />
      </article>
    </PaginaPainel>
  );
}
