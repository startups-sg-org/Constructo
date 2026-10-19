/**
 * Action do Data Router para as mutações do editor de protocolos.
 * Converte intenções de formulário em chamadas ao service e padroniza o retorno
 * de sucesso ou erro para que a interface atualize o estado e revalide a rota.
 */
import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { z } from "zod";

import { mensagemDeErro, validarFormulario } from "../shared/actionUtils";
import {
    atualizarItemProtocolo,
    atualizarProtocoloEvidencia,
    criarItemProtocolo,
    criarProtocoloEvidencia,
    removerItemProtocolo,
} from "./evidencias.service";

export type ResultadoAcaoProtocolo = {
    ok: true;
    mensagem?: string;
    intencao: string;
    protocolo?: import("./evidencias.service").ProtocoloEvidenciaResumo;
    item?: import("./evidencias.service").ItemProtocolo;
    removido?: number;
} | {
    ok: false;
    erro?: string;
    campos?: Record<string, string>;
    intencao: string;
    rascunho?: Record<string, string | number | boolean | null>;
};

const protocoloSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do protocolo.").max(200, "Use no máximo 200 caracteres."),
    descricao: z.string().trim().transform((valor) => valor || null),
    quantidade_minima: z.string().trim()
        .min(1, "Informe a quantidade mínima de evidências.")
        .regex(/^\d+$/, "Informe um número inteiro não negativo.")
        .transform(Number),
});

const itemSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome do item.").max(200, "Use no máximo 200 caracteres."),
    descricao: z.string().trim().transform((valor) => valor || null),
    obrigatorio: z.boolean(),
    ordem: z.string().trim()
        .min(1, "Informe a ordem do item.")
        .regex(/^\d+$/, "Informe um número inteiro não negativo.")
        .transform(Number),
});

/** Converte e valida um identificador positivo recebido dos parâmetros de rota. */
function idDaRota(valor: string | undefined, recurso: string): number {
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Response(`${recurso} não encontrado`, { status: 404 });
    }
    return id;
}

/** Converte um campo de formulário para número; a API valida seu domínio. */
function inteiro(form: FormData, campo: string): number {
    return Number(form.get(campo));
}

function foiAbortado(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
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
            const rascunho = {
                nome: String(form.get("nome") ?? ""),
                descricao: String(form.get("descricao") ?? ""),
                quantidade_minima: String(form.get("quantidade_minima") ?? ""),
            };
            const validacao = validarFormulario(protocoloSchema, rascunho);
            if (validacao.erro) return { ok: false, intencao, rascunho, ...validacao.erro };
            const protocolo = await criarProtocoloEvidencia(
                empreendimentoId,
                marcoId,
                validacao.dados,
                { signal: request.signal },
            );
            // As próximas mutações obtêm o protocoloId da URL de edição.
            return redirect(`/admin/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos/${protocolo.id}`);
        }

        if (!protocoloId) return { ok: false, erro: "Protocolo não informado.", intencao };

        if (intencao === "editar-protocolo") {
            const rascunho = {
                nome: String(form.get("nome") ?? ""),
                descricao: String(form.get("descricao") ?? ""),
                quantidade_minima: String(form.get("quantidade_minima") ?? ""),
            };
            const validacao = validarFormulario(protocoloSchema, rascunho);
            if (validacao.erro) return { ok: false, intencao, rascunho, ...validacao.erro };
            return {
                ok: true,
                intencao,
                mensagem: "Protocolo salvo.",
                protocolo: await atualizarProtocoloEvidencia(
                    empreendimentoId,
                    marcoId,
                    protocoloId,
                    validacao.dados,
                    { signal: request.signal },
                ),
            };
        }

        if (intencao === "criar-item") {
            const rascunho = {
                nome: String(form.get("nome") ?? ""),
                descricao: String(form.get("descricao") ?? ""),
                obrigatorio: form.get("obrigatorio") === "true",
                ordem: String(form.get("ordem") ?? ""),
            };
            const validacao = validarFormulario(itemSchema, rascunho);
            if (validacao.erro) return { ok: false, intencao, rascunho, ...validacao.erro };
            return {
                ok: true,
                intencao,
                mensagem: "Item adicionado.",
                item: await criarItemProtocolo(
                    empreendimentoId,
                    marcoId,
                    protocoloId,
                    validacao.dados,
                    { signal: request.signal },
                ),
            };
        }

        const itemId = inteiro(form, "item_id");
        if (!Number.isInteger(itemId) || itemId <= 0) {
            return { ok: false, erro: "Item de protocolo não informado.", intencao };
        }
        if (intencao === "editar-item") {
            const rascunho = {
                nome: String(form.get("nome") ?? ""),
                descricao: String(form.get("descricao") ?? ""),
                obrigatorio: form.get("obrigatorio") === "true",
                ordem: String(form.get("ordem") ?? ""),
            };
            const validacao = validarFormulario(itemSchema, rascunho);
            if (validacao.erro) return { ok: false, intencao, rascunho, ...validacao.erro };
            return {
                ok: true,
                intencao,
                mensagem: "Item salvo.",
                item: await atualizarItemProtocolo(
                    empreendimentoId,
                    marcoId,
                    protocoloId,
                    itemId,
                    validacao.dados,
                    { signal: request.signal },
                ),
            };
        }
        if (intencao === "remover-item") {
            await removerItemProtocolo(empreendimentoId, marcoId, protocoloId, itemId, {
                signal: request.signal,
            });
            return { ok: true, intencao, mensagem: "Item removido.", removido: itemId };
        }
        return { ok: false, erro: "Ação de protocolo inválida.", intencao };
    } catch (error) {
        if (foiAbortado(error)) throw error;
        return { ok: false, erro: mensagemDeErro(error, "Não foi possível salvar o protocolo."), intencao };
    }
}
