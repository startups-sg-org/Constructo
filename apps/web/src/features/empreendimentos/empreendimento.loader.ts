import type { LoaderFunctionArgs } from "react-router-dom";

import { getEmpreendimentoPorId, getLocaisObra } from "./empreendimentos.service";

export function carregarEmpreendimento({ request, params }: LoaderFunctionArgs) {
  const empreendimentoId = params.empreendimentoId;

  if (!empreendimentoId) {
    throw new Response("Identificador do empreendimento não informado", {
      status: 400,
    });
  }

  return getEmpreendimentoPorId(empreendimentoId, { signal: request.signal });
}

export function carregarEstruturaEmpreendimento({ request, params }: LoaderFunctionArgs) {
  const empreendimentoId = params.empreendimentoId;

  if (!empreendimentoId) {
    throw new Response("Identificador do empreendimento não informado", {
      status: 400,
    });
  }

  return getLocaisObra(empreendimentoId, { signal: request.signal });
}
