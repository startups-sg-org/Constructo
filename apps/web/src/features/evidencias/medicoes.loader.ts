import type { LoaderFunctionArgs } from "react-router-dom";

import { carregarTaxonomia } from "../empreendimentos/taxonomia.loader";
import { listarProtocolosRecentes } from "./evidencias.service";

export async function carregarMedicoesEmpreendimento(args: LoaderFunctionArgs) {
    const empreendimentoId = Number(args.params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        throw new Response("Empreendimento não encontrado", { status: 404 });
    }

    const [dadosTaxonomia, protocolos] = await Promise.all([
        carregarTaxonomia(args),
        listarProtocolosRecentes(empreendimentoId, { signal: args.request.signal }, 100),
    ]);
    return { ...dadosTaxonomia, protocolos };
}
