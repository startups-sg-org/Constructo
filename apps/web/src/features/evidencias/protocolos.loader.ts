/**
 * Loader do Data Router para as rotas de criação e edição de protocolos.
 * Ele busca o protocolo do marco solicitado antes da renderização do editor.
 */
import type { LoaderFunctionArgs } from "react-router-dom";

import { listarProtocolosEvidencia } from "./evidencias.service";

/** Converte e valida um identificador positivo recebido dos parâmetros de rota. */
function idDaRota(valor: string | undefined, recurso: string): number {
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Response(`${recurso} não encontrado`, { status: 404 });
    }
    return id;
}

/**
 * Carrega os dados necessários para criar ou editar um protocolo no editor.
 *
 * Valida os IDs da URL e garante que o protocolo, quando informado, pertence
 * ao marco solicitado antes de disponibilizá-lo para a rota.
 */
export async function carregarProtocoloEditor({ params, request }: Pick<LoaderFunctionArgs, "params" | "request">) {
    const empreendimentoId = idDaRota(params.empreendimentoId, "Empreendimento");
    const marcoId = idDaRota(params.marcoId, "Marco");
    const protocoloId = params.protocoloId
        ? idDaRota(params.protocoloId, "Protocolo")
        : undefined;
    const protocolos = await listarProtocolosEvidencia(empreendimentoId, marcoId, {
        signal: request.signal,
    });
    const protocolo = protocoloId
        ? protocolos.find((item) => item.id === protocoloId)
        : undefined;

    if (protocoloId && !protocolo) {
        throw new Response("Protocolo não encontrado neste marco", { status: 404 });
    }

    const baseProtocolos = `/admin/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos`;

    return {
        empreendimentoId,
        marcoId,
        protocolo,
        protocolos,
        modo: protocoloId ? "editar" as const : new URL(request.url).pathname.endsWith("/novo")
            ? "criar" as const
            : "listar" as const,
        baseProtocolos,
    };
}
