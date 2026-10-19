import type { LoaderFunctionArgs } from "react-router-dom";
import { ApiError } from "../../services/api";
import { obterEmpreendimento } from "./empreendimentos.service";
import {
    listarEtapasTaxonomia,
    listarMarcosTaxonomia,
    obterTaxonomia,
    type Etapa,
    type Taxonomia,
} from "./empreendimentos.service";

export type TaxonomiaLoaderData = {
    empreendimento: Awaited<ReturnType<typeof obterEmpreendimento>>;
    taxonomia: (Taxonomia & { etapas: Etapa[] }) | null;
};

async function obterTaxonomiaOpcional(empreendimentoId: number, signal: AbortSignal): Promise<Taxonomia | null> {
    try {
        return await obterTaxonomia(empreendimentoId, { signal });
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function carregarTaxonomia({ params, request }: LoaderFunctionArgs): Promise<TaxonomiaLoaderData> {
    const empreendimentoId = Number(params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        throw new Response("Empreendimento não encontrado", { status: 404 });
    }
    const [empreendimento, taxonomia] = await Promise.all([
        obterEmpreendimento(empreendimentoId, { signal: request.signal }),
        obterTaxonomiaOpcional(empreendimentoId, request.signal),
    ]);

    if (!taxonomia) return { empreendimento, taxonomia: null };

    const raizes = await listarEtapasTaxonomia(empreendimentoId, undefined, { signal: request.signal });
    const carregarEtapa = async (etapa: Etapa): Promise<Etapa> => {
        const [subetapas, marcos] = await Promise.all([
            listarEtapasTaxonomia(empreendimentoId, etapa.id, { signal: request.signal }),
            listarMarcosTaxonomia(empreendimentoId, etapa.id, { signal: request.signal }),
        ]);
        const filhas = await Promise.all(subetapas.map(carregarEtapa));
        return { ...etapa, subetapas: filhas, marcos };
    };
    const etapas = await Promise.all(raizes.map(carregarEtapa));
    return { empreendimento, taxonomia: { ...taxonomia, etapas } };
}
