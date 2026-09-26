import type { LoaderFunctionArgs } from "react-router-dom";

import { ApiError } from "../../services/api";
import {
    listarEmpreendimentos,
    listarLocaisRaiz,
    listarPavimentos,
    listarUnidades,
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
        const [empreendimento, locais] = await Promise.all([
            obterEmpreendimento(empreendimentoId, { signal: request.signal }),
            listarLocaisRaiz(empreendimentoId, { signal: request.signal }),
        ]);
        const pavimentosPorPai = Object.fromEntries(
            await Promise.all(
                locais.map(async (local) => [
                    local.id,
                    await listarPavimentos(empreendimentoId, local.id, { signal: request.signal }),
                ] as const),
            ),
        );
        const pavimentos = Object.values(pavimentosPorPai).flat();
        const unidadesPorPavimento = Object.fromEntries(
            await Promise.all(
                pavimentos.map(async (pavimento) => [
                    pavimento.id,
                    await listarUnidades(empreendimentoId, pavimento.id, {
                        signal: request.signal,
                    }),
                ] as const),
            ),
        );
        return { empreendimento, locais, pavimentosPorPai, unidadesPorPavimento };
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            throw new Response("Empreendimento não encontrado", { status: 404 });
        }
        throw error;
    }
}
