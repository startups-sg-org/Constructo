import {
    atualizacaoEmpreendimentoSchema,
    empreendimentoSchema,
    type Empreendimento,
    localRaizSchema,
    type LocalObra,
} from "@constructo/shared";
import type { ActionFunctionArgs } from "react-router-dom";

import { mensagemDeErro, validarFormulario, type ActionError } from "../shared/actionUtils";
import {
    atualizarEmpreendimento,
    criarEmpreendimento,
    criarLocalRaiz,
} from "./empreendimentos.service";

export type EmpreendimentoActionData =
    | (ActionError & { ok?: false })
    | { ok: true; empreendimento: Empreendimento; erro?: never; campos?: never };

export async function cadastrarEmpreendimento({ request }: ActionFunctionArgs) {
    const formulario = await request.formData();
    const validacao = validarFormulario(
        empreendimentoSchema,
        Object.fromEntries(formulario),
    );

    if (validacao.erro) return validacao.erro;

    try {
        const empreendimento = await criarEmpreendimento(validacao.dados, {
            signal: request.signal,
        });
        return { ok: true, empreendimento } satisfies EmpreendimentoActionData;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        return {
            erro: mensagemDeErro(
                error,
                "Não foi possível cadastrar o empreendimento. Tente novamente mais tarde.",
            ),
        } satisfies EmpreendimentoActionData;
    }
}


export async function editarEmpreendimento({ request, params }: ActionFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        return { erro: "Empreendimento inválido." } satisfies EmpreendimentoActionData;
    }

    const formulario = await request.formData();
    const validacao = validarFormulario(
        atualizacaoEmpreendimentoSchema,
        Object.fromEntries(formulario),
    );

    if (validacao.erro) return validacao.erro;

    try {
        const empreendimento = await atualizarEmpreendimento(
            empreendimentoId,
            validacao.dados,
            { signal: request.signal },
        );
        return { ok: true, empreendimento } satisfies EmpreendimentoActionData;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;

        return {
            erro: mensagemDeErro(
                error,
                "Não foi possível atualizar o empreendimento. Tente novamente mais tarde.",
            ),
        } satisfies EmpreendimentoActionData;
    }
}


export type LocalRaizActionData =
    | (ActionError & { ok?: false })
    | { ok: true; local: LocalObra; erro?: never; campos?: never };

export async function cadastrarLocalRaiz({ request, params }: ActionFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        return { erro: "Empreendimento inválido." } satisfies LocalRaizActionData;
    }

    const formulario = await request.formData();
    const validacao = validarFormulario(localRaizSchema, Object.fromEntries(formulario));

    if (validacao.erro) return validacao.erro;

    try {
        const local = await criarLocalRaiz(empreendimentoId, validacao.dados, {
            signal: request.signal,
        });
        return { ok: true, local } satisfies LocalRaizActionData;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;

        return {
            erro: mensagemDeErro(
                error,
                "Não foi possível adicionar a torre ou o bloco. Tente novamente mais tarde.",
            ),
        } satisfies LocalRaizActionData;
    }
}
