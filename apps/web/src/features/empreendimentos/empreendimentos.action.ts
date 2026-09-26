import {
    atualizacaoEmpreendimentoSchema,
    atualizacaoLocalSchema,
    empreendimentoSchema,
    type Empreendimento,
    localRaizSchema,
    pavimentoSchema,
    unidadeSchema,
    type LocalObra,
} from "@constructo/shared";
import type { ActionFunctionArgs } from "react-router-dom";

import { mensagemDeErro, validarFormulario, type ActionError } from "../shared/actionUtils";
import {
    atualizarEmpreendimento,
    atualizarLocal,
    criarEmpreendimento,
    criarLocalRaiz,
    criarPavimento,
    criarUnidade,
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
    | (ActionError & {
        ok?: false;
        intencao?: "raiz" | "pavimento" | "unidade" | "edicao";
        parentId?: number;
        localId?: number;
    })
    | {
        ok: true;
        local: LocalObra;
        intencao: "raiz" | "pavimento" | "unidade" | "edicao";
        parentId?: number;
        localId?: number;
        erro?: never;
        campos?: never;
    };

export async function cadastrarLocalRaiz({ request, params }: ActionFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);
    if (!Number.isInteger(empreendimentoId) || empreendimentoId <= 0) {
        return { erro: "Empreendimento inválido." } satisfies LocalRaizActionData;
    }

    const formulario = await request.formData();
    const intencao = formulario.get("intencao");

    if (intencao === "editar-local") {
        const localId = Number(formulario.get("local_id"));
        if (!Number.isInteger(localId) || localId <= 0) {
            return { intencao: "edicao", erro: "Local inválido." } satisfies LocalRaizActionData;
        }

        const validacao = validarFormulario(atualizacaoLocalSchema, Object.fromEntries(formulario));
        if (validacao.erro) {
            return { ...validacao.erro, intencao: "edicao", localId } satisfies LocalRaizActionData;
        }

        try {
            const local = await atualizarLocal(empreendimentoId, localId, validacao.dados, {
                signal: request.signal,
            });
            return { ok: true, local, intencao: "edicao", localId } satisfies LocalRaizActionData;
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") throw error;
            return {
                intencao: "edicao",
                localId,
                erro: mensagemDeErro(
                    error,
                    "Não foi possível atualizar o local. Tente novamente mais tarde.",
                ),
            } satisfies LocalRaizActionData;
        }
    }

    if (intencao === "adicionar-unidade") {
        const parentId = Number(formulario.get("parent_id"));
        if (!Number.isInteger(parentId) || parentId <= 0) {
            return {
                intencao: "unidade",
                erro: "Pavimento inválido.",
            } satisfies LocalRaizActionData;
        }

        const validacao = validarFormulario(unidadeSchema, Object.fromEntries(formulario));
        if (validacao.erro) {
            return {
                ...validacao.erro,
                intencao: "unidade",
                parentId,
            } satisfies LocalRaizActionData;
        }

        try {
            const local = await criarUnidade(empreendimentoId, parentId, validacao.dados, {
                signal: request.signal,
            });
            return {
                ok: true,
                local,
                intencao: "unidade",
                parentId,
            } satisfies LocalRaizActionData;
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") throw error;
            return {
                intencao: "unidade",
                parentId,
                erro: mensagemDeErro(
                    error,
                    "Não foi possível adicionar a unidade. Tente novamente mais tarde.",
                ),
            } satisfies LocalRaizActionData;
        }
    }

    if (intencao === "adicionar-pavimento") {
        const parentId = Number(formulario.get("parent_id"));
        if (!Number.isInteger(parentId) || parentId <= 0) {
            return { erro: "Torre ou bloco inválido." } satisfies LocalRaizActionData;
        }

        const validacao = validarFormulario(pavimentoSchema, Object.fromEntries(formulario));
        if (validacao.erro) {
            return {
                ...validacao.erro,
                intencao: "pavimento",
                parentId,
            } satisfies LocalRaizActionData;
        }

        try {
            const local = await criarPavimento(empreendimentoId, parentId, validacao.dados, {
                signal: request.signal,
            });
            return {
                ok: true,
                local,
                intencao: "pavimento",
                parentId,
            } satisfies LocalRaizActionData;
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") throw error;
            return {
                intencao: "pavimento",
                parentId,
                erro: mensagemDeErro(
                    error,
                    "Não foi possível adicionar o pavimento. Tente novamente mais tarde.",
                ),
            } satisfies LocalRaizActionData;
        }
    }

    const validacao = validarFormulario(localRaizSchema, Object.fromEntries(formulario));

    if (validacao.erro) {
        return { ...validacao.erro, intencao: "raiz" } satisfies LocalRaizActionData;
    }

    try {
        const local = await criarLocalRaiz(empreendimentoId, validacao.dados, {
            signal: request.signal,
        });
        return { ok: true, local, intencao: "raiz" } satisfies LocalRaizActionData;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;

        return {
            intencao: "raiz",
            erro: mensagemDeErro(
                error,
                "Não foi possível adicionar a torre ou o bloco. Tente novamente mais tarde.",
            ),
        } satisfies LocalRaizActionData;
    }
}
