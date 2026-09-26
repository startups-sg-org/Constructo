import { Link, useLoaderData } from "react-router-dom";

import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimento.loader";
import type { StatusEmpreendimento } from "../../../features/empreendimentos/empreendimentos.service";
import PaginaPainel from "../../../pages/Painel/PaginaPainel";
import "./DetalhesEmpreendimento.css";

const ROTULOS_STATUS: Record<StatusEmpreendimento, string> = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  INATIVO: "Inativo",
};

export default function DetalhesEmpreendimento() {
  const empreendimento = useLoaderData<typeof carregarEmpreendimento>();
  const rotaBase = `/admin/empreendimentos/${empreendimento.id}`;

  return (
    <PaginaPainel
      titulo={empreendimento.nome}
      subtitulo="Detalhes e acessos para a gestão deste empreendimento."
      acao={
        <Link className="botao secundario" to={`${rotaBase}/editar`}>
          Editar empreendimento
        </Link>
      }
    >
      <article className="detalhes-empreendimento card">
        <div className="detalhes-empreendimento__cabecalho">
          <h2>Informações do empreendimento</h2>
          <span
            className={`detalhes-empreendimento__status detalhes-empreendimento__status--${empreendimento.status.toLowerCase()}`}
          >
            {ROTULOS_STATUS[empreendimento.status]}
          </span>
        </div>

        <dl className="detalhes-empreendimento__lista">
          <div className="detalhes-empreendimento__campo detalhes-empreendimento__campo--largo">
            <dt>Descrição</dt>
            <dd>{empreendimento.descricao}</dd>
          </div>
          <div className="detalhes-empreendimento__campo detalhes-empreendimento__campo--largo">
            <dt>Endereço</dt>
            <dd>{empreendimento.endereco}</dd>
          </div>
          <div className="detalhes-empreendimento__campo">
            <dt>Data de criação</dt>
            <dd>{formatarData(empreendimento.criado_em)}</dd>
          </div>
          <div className="detalhes-empreendimento__campo">
            <dt>Última atualização</dt>
            <dd>{formatarData(empreendimento.atualizado_em)}</dd>
          </div>
        </dl>

        <div className="detalhes-empreendimento__estrutura">
          <div>
            <h2>Estrutura física</h2>
            <p>Gerencie torres, blocos, pavimentos e unidades da obra.</p>
          </div>
          <Link className="botao primario" to={`${rotaBase}/estrutura`}>
            Acessar estrutura física
          </Link>
        </div>
      </article>
    </PaginaPainel>
  );
}

function formatarData(valor: string): string {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "Data indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(data);
}
