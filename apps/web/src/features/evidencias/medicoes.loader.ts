import type { LoaderFunctionArgs } from "react-router-dom";

import {
    obterEmpreendimento,
    type Etapa,
} from "../empreendimentos/empreendimentos.service";
import { carregarTaxonomia } from "../empreendimentos/taxonomia.loader";
import {
    listarProtocolosEvidencia,
    listarProtocolosRecentes,
    type ProtocoloEvidenciaResumo,
} from "./evidencias.service";

export async function carregarMedicoesEmpreendimento(args: LoaderFunctionArgs) {
    const empreendimentoId = Number(args.params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        throw new Response("Empreendimento não encontrado", { status: 404 });
    }

    const contextoTaxonomia = await carregarTaxonomia(args)
        .then((dados) => ({ ...dados, erroTaxonomia: null }))
        .catch(async (error: unknown) => {
            if (ehCancelamento(error)) throw error;
            const empreendimento = await obterEmpreendimento(empreendimentoId, {
                signal: args.request.signal,
            });
            return {
                empreendimento,
                taxonomia: null,
                erroTaxonomia: mensagemErro(error, "Não foi possível carregar a taxonomia."),
            };
        });

    const marcoIds = listarMarcoIds(contextoTaxonomia.taxonomia?.etapas ?? []);
    const resultadoProtocolos = marcoIds.length > 0
        ? await listarProtocolosPorMarco(empreendimentoId, marcoIds, args.request.signal)
        : contextoTaxonomia.erroTaxonomia
            ? await listarRecentes(empreendimentoId, args.request.signal)
            : { protocolos: [], erroProtocolos: null };

    return { ...contextoTaxonomia, ...resultadoProtocolos };
}

async function listarProtocolosPorMarco(
    empreendimentoId: number,
    marcoIds: number[],
    signal: AbortSignal,
): Promise<{ protocolos: ProtocoloEvidenciaResumo[]; erroProtocolos: string | null }> {
    const resultados = await Promise.allSettled(
        marcoIds.map((marcoId) => listarProtocolosEvidencia(
            empreendimentoId,
            marcoId,
            { signal },
        )),
    );

    const cancelamento = resultados.find(
        (resultado) => resultado.status === "rejected" && ehCancelamento(resultado.reason),
    );
    if (cancelamento?.status === "rejected") throw cancelamento.reason;

    const protocolosDosMarcos = resultados.flatMap((resultado) =>
        resultado.status === "fulfilled" ? resultado.value : [],
    );
    const quantidadeFalhas = resultados.filter((resultado) => resultado.status === "rejected").length;

    if (quantidadeFalhas === 0) {
        return { protocolos: ordenarERemoverDuplicados(protocolosDosMarcos), erroProtocolos: null };
    }

    const recentes = await listarRecentes(empreendimentoId, signal);
    return {
        protocolos: ordenarERemoverDuplicados([
            ...protocolosDosMarcos,
            ...recentes.protocolos,
        ]),
        erroProtocolos: recentes.erroProtocolos
            ? `${quantidadeFalhas} marco(s) não puderam ser consultados. ${recentes.erroProtocolos}`
            : `${quantidadeFalhas} marco(s) não puderam ser consultados; os protocolos recentes foram mantidos na listagem.`,
    };
}

async function listarRecentes(
    empreendimentoId: number,
    signal: AbortSignal,
): Promise<{ protocolos: ProtocoloEvidenciaResumo[]; erroProtocolos: string | null }> {
    try {
        const protocolos = await listarProtocolosRecentes(empreendimentoId, { signal }, 100);
        return { protocolos: ordenarERemoverDuplicados(protocolos), erroProtocolos: null };
    } catch (error) {
        if (ehCancelamento(error)) throw error;
        return {
            protocolos: [],
            erroProtocolos: mensagemErro(error, "Não foi possível carregar os protocolos."),
        };
    }
}

function listarMarcoIds(etapas: Etapa[]): number[] {
    return etapas.flatMap((etapa) => [
        ...(etapa.marcos ?? []).map((marco) => marco.id),
        ...listarMarcoIds(etapa.subetapas ?? []),
    ]);
}

function ordenarERemoverDuplicados<T extends ProtocoloEvidenciaResumo>(protocolos: T[]): ProtocoloEvidenciaResumo[] {
    const unicos = new Map(protocolos.map((protocolo) => [protocolo.id, protocolo]));
    return [...unicos.values()].sort(
        (primeiro, segundo) => Date.parse(segundo.criado_em) - Date.parse(primeiro.criado_em),
    );
}

function ehCancelamento(error: unknown): error is Error {
    return error instanceof Error && error.name === "AbortError";
}

function mensagemErro(error: unknown, padrao: string): string {
    return error instanceof Error ? error.message : padrao;
}
