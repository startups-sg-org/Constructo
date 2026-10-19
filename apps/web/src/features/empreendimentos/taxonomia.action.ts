import type { ActionFunctionArgs } from "react-router-dom";
import { z } from "zod";

import { mensagemDeErro, validarFormulario, type ActionError } from "../shared/actionUtils";
import {
    atualizarEtapaTaxonomia,
    atualizarMarcoTaxonomia,
    criarEtapaTaxonomia,
    criarMarcoTaxonomia,
    type Etapa,
    type Marco,
} from "./empreendimentos.service";

const itemTaxonomiaSchema = z.object({
    nome: z.string().trim().min(1, "Informe o nome.").max(200, "O nome deve ter no máximo 200 caracteres."),
    ordem: z.string()
        .trim()
        .min(1, "Informe a ordem.")
        .refine((valor) => /^\d+$/.test(valor), "A ordem deve ser um número inteiro não negativo.")
        .transform(Number),
    descricao_tecnica: z.string().trim().transform((valor) => valor || null),
    descricao_cliente: z.string().trim().transform((valor) => valor || null),
});

type IntencaoTaxonomia = "criar-etapa" | "editar-etapa" | "criar-marco" | "editar-marco";

export type TaxonomiaActionData =
    | ({ ok: false; item?: never } & ActionError)
    | { ok: true; item: Etapa | Marco; erro?: never; campos?: never };

function idPositivo(valor: FormDataEntryValue | null): number | null {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function alterarTaxonomia({ request, params }: ActionFunctionArgs): Promise<TaxonomiaActionData> {
    const empreendimentoId = idPositivo(params.empreendimentoId ?? null);
    if (!empreendimentoId) return { ok: false, erro: "Empreendimento inválido." };

    const formulario = await request.formData();
    const intencao = String(formulario.get("intencao") ?? "") as IntencaoTaxonomia;
    const intencoesValidas: IntencaoTaxonomia[] = ["criar-etapa", "editar-etapa", "criar-marco", "editar-marco"];

    if (!intencoesValidas.includes(intencao)) {
        return { ok: false, erro: "Ação de taxonomia inválida." };
    }

    const validacao = validarFormulario(itemTaxonomiaSchema, Object.fromEntries(formulario));
    if (validacao.erro) return { ok: false, ...validacao.erro };

    const dados = validacao.dados;

    try {
        if (intencao === "criar-etapa") {
            const parentIdInformado = formulario.get("parent_id");
            const parentId = parentIdInformado ? idPositivo(parentIdInformado) : null;
            if (parentIdInformado && !parentId) return { ok: false, erro: "Etapa pai inválida." };

            const item = await criarEtapaTaxonomia(empreendimentoId, {
                parent_id: parentId,
                ...dados,
            }, { signal: request.signal });
            return { ok: true, item };
        }

        if (intencao === "editar-etapa") {
            const etapaId = idPositivo(formulario.get("id"));
            if (!etapaId) return { ok: false, erro: "Etapa inválida." };

            const item = await atualizarEtapaTaxonomia(empreendimentoId, etapaId, dados, {
                signal: request.signal,
            });
            return { ok: true, item };
        }

        if (intencao === "criar-marco") {
            const etapaId = idPositivo(formulario.get("etapa_id"));
            if (!etapaId) return { ok: false, erro: "Etapa do marco inválida." };

            const item = await criarMarcoTaxonomia(empreendimentoId, etapaId, dados, {
                signal: request.signal,
            });
            return { ok: true, item };
        }

        const marcoId = idPositivo(formulario.get("id"));
        if (!marcoId) return { ok: false, erro: "Marco inválido." };

        const item = await atualizarMarcoTaxonomia(empreendimentoId, marcoId, dados, {
            signal: request.signal,
        });
        return { ok: true, item };
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;

        return {
            ok: false,
            erro: mensagemDeErro(error, "Não foi possível salvar a taxonomia."),
        };
    }
}
