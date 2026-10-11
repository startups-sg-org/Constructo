/**
 * Action do Data Router para as mutações do editor de protocolos.
 * Converte intenções de formulário em chamadas ao service e padroniza o retorno
 * de sucesso ou erro para que a interface atualize o estado e revalide a rota.
 */
import { redirect, type ActionFunctionArgs } from "react-router-dom";

import { mensagemDeErro } from "../shared/actionUtils";
import {
    atualizarItemProtocolo,
    atualizarProtocoloEvidencia,
    criarItemProtocolo,
    criarProtocoloEvidencia,
    removerItemProtocolo,
} from "./evidencias.service";

export type ResultadoAcaoProtocolo = {
    ok: boolean;
    erro?: string;
    protocolo?: import("./evidencias.service").ProtocoloEvidenciaResumo;
    item?: import("./evidencias.service").ItemProtocolo;
    removido?: number;
};

/** Converte e valida um identificador positivo recebido dos parâmetros de rota. */
function idDaRota(valor: string | undefined, recurso: string): number {
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Response(`${recurso} não encontrado`, { status: 404 });
    }
    return id;
}

/** Lê um campo textual opcional, normalizando valor vazio para `null`. */
function texto(form: FormData, campo: string): string | null {
    return String(form.get(campo) ?? "").trim() || null;
}

/** Converte um campo de formulário para número; a API valida seu domínio. */
function inteiro(form: FormData, campo: string): number {
    return Number(form.get(campo));
}

/**
 * Processa as intenções dos formulários do editor e chama a mutação adequada.
 * Retorna um formato uniforme de sucesso ou erro para consumo pelo componente.
 */
export async function alterarProtocoloEditor({ request, params }: ActionFunctionArgs): Promise<ResultadoAcaoProtocolo | Response> {
    const empreendimentoId = idDaRota(params.empreendimentoId, "Empreendimento");
    const marcoId = idDaRota(params.marcoId, "Marco");
    const form = await request.formData();
    const intencao = String(form.get("intencao") ?? "");
    const protocoloId = params.protocoloId ? idDaRota(params.protocoloId, "Protocolo") : undefined;

    try {
        if (intencao === "criar-protocolo") {
            const protocolo = await criarProtocoloEvidencia(empreendimentoId, marcoId, {
                    nome: String(form.get("nome") ?? ""),
                    descricao: texto(form, "descricao"),
                    quantidade_minima: inteiro(form, "quantidade_minima"),
                }, { signal: request.signal });
            // As próximas mutações obtêm o protocoloId da URL de edição.
            return redirect(`/admin/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos/${protocolo.id}`);
        }

        if (!protocoloId) return { ok: false, erro: "Protocolo não informado." };

        if (intencao === "editar-protocolo") {
            return {
                ok: true,
                protocolo: await atualizarProtocoloEvidencia(empreendimentoId, marcoId, protocoloId, {
                    nome: String(form.get("nome") ?? ""),
                    descricao: texto(form, "descricao"),
                    quantidade_minima: inteiro(form, "quantidade_minima"),
                }, { signal: request.signal }),
            };
        }

        if (intencao === "criar-item") {
            return {
                ok: true,
                item: await criarItemProtocolo(empreendimentoId, marcoId, protocoloId, {
                    nome: String(form.get("nome") ?? ""),
                    descricao: texto(form, "descricao"),
                    obrigatorio: form.get("obrigatorio") === "true",
                    ordem: inteiro(form, "ordem"),
                }, { signal: request.signal }),
            };
        }

        const itemId = inteiro(form, "item_id");
        if (!Number.isInteger(itemId) || itemId <= 0) {
            return { ok: false, erro: "Item de protocolo não informado." };
        }
        if (intencao === "editar-item") {
            return {
                ok: true,
                item: await atualizarItemProtocolo(empreendimentoId, marcoId, protocoloId, itemId, {
                    nome: String(form.get("nome") ?? ""),
                    descricao: texto(form, "descricao"),
                    obrigatorio: form.get("obrigatorio") === "true",
                    ordem: inteiro(form, "ordem"),
                }, { signal: request.signal }),
            };
        }
        if (intencao === "remover-item") {
            await removerItemProtocolo(empreendimentoId, marcoId, protocoloId, itemId, {
                signal: request.signal,
            });
            return { ok: true, removido: itemId };
        }
        return { ok: false, erro: "Ação de protocolo inválida." };
    } catch (error) {
        return { ok: false, erro: mensagemDeErro(error, "Não foi possível salvar o protocolo.") };
    }
}
