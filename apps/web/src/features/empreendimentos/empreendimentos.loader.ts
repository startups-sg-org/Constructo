import type { LoaderFunctionArgs } from "react-router-dom";

import { ApiError } from "../../services/api";
import {
    listarEmpreendimentos,
    obterEstruturaFisica,
    obterEmpreendimento,
} from "./empreendimentos.service";

export function carregarEmpreendimentos({ request }: LoaderFunctionArgs) {
    return listarEmpreendimentos({ signal: request.signal });
}

export async function carregarEmpreendimento({ params, request }: LoaderFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);

    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        throw new Response("Empreendimento não encontrado", { status: 404 });
    }

    try {
        return await obterEmpreendimento(empreendimentoId, { signal: request.signal });
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            throw new Response("Empreendimento não encontrado", { status: 404 });
        }
        throw error;
    }
}


export async function carregarEstruturaFisica({ params, request }: LoaderFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);

    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        throw new Response("Empreendimento não encontrado", { status: 404 });
    }

    try {
        const [empreendimento, estrutura] = await Promise.all([
            obterEmpreendimento(empreendimentoId, { signal: request.signal }),
            obterEstruturaFisica(empreendimentoId, { signal: request.signal }),
        ]);
        return { empreendimento, estrutura };
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            throw new Response("Empreendimento não encontrado", { status: 404 });
        }
        throw error;
    }
}
