import type { LoaderFunctionArgs } from "react-router-dom";

import { listarContratosEmpreendimento } from "./contratos.service";

export async function carregarContratosEmpreendimento({ params, request }: LoaderFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        throw new Response("Empreendimento não encontrado", { status: 404 });
    }

    const contratos = await listarContratosEmpreendimento(empreendimentoId, {
        signal: request.signal,
    });
    return { empreendimentoId, contratos };
}
