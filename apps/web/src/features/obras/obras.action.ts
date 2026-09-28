import { createObraFormSchema, type CreateObraFormData, type CreateObraDTO } from "@constructo/shared";
import { replace, type ActionFunctionArgs } from "react-router-dom";

import { createObra } from "./obras.service";
import { mensagemDeErro, validarFormulario, type ActionError } from "../shared/actionUtils";

export type ObraActionData = ActionError & { sucesso?: boolean };

export async function cadastrarObra({ request }: ActionFunctionArgs) {
    const formulario = await request.formData();
    const dados = Object.fromEntries(formulario);

    const validacao = validarFormulario(createObraFormSchema, dados);

    if (validacao.erro) return validacao.erro;

    const formData: CreateObraFormData = validacao.dados;

    const obraDTO: CreateObraDTO = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        endereco: formData.endereco,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        status: formData.status,
        dataInicio: formData.dataInicio,
        dataFimPrevista: formData.dataFimPrevista,
        contratoId: parseInt(formData.contratoId, 10),
    };

    try {
        await createObra(obraDTO, { signal: request.signal });
        return replace("/admin/obras");
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        if (error instanceof Error && error.message.includes("já possui uma obra")) {
            return {
                erro: "Este contrato já possui uma obra cadastrada.",
            } satisfies ObraActionData;
        }

        return {
            erro: mensagemDeErro(error, "Não foi possível cadastrar a obra. Tente novamente mais tarde."),
        } satisfies ObraActionData;
    }
}
