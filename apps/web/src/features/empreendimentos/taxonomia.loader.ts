import type { LoaderFunctionArgs } from "react-router-dom";
import { obterEmpreendimento } from "./empreendimentos.service";
import { listarEtapasTaxonomia, listarMarcosTaxonomia, obterTaxonomia, type Etapa } from "./empreendimentos.service";

export async function carregarTaxonomia({ params, request }: LoaderFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        throw new Response("Empreendimento não encontrado", { status: 404 });
    }
    const [empreendimento, taxonomia] = await Promise.all([
        obterEmpreendimento(empreendimentoId, { signal: request.signal }),
        obterTaxonomia(empreendimentoId, { signal: request.signal }),
    ]);
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
