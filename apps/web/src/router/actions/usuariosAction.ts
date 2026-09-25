import { editUserSchema } from "@constructo/shared";
import type { ActionFunctionArgs } from "react-router-dom";

import { deleteUser, updateUser } from "../../services/users.service";
import { mensagemDeErro, validarFormulario, type ActionError } from "./actionUtils";

type UsuarioActionSuccess = {
    ok: true;
    intent: "update" | "delete";
    usuarioId: number;
};

export type UsuariosActionData = (ActionError & {
    intent?: string;
    usuarioId?: number;
}) | UsuarioActionSuccess;

export async function alterarUsuario({ request }: ActionFunctionArgs): Promise<UsuariosActionData> {
    const formulario = await request.formData();
    const intent = formulario.get("intent");
    const usuarioId = Number(formulario.get("usuarioId"));

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return { erro: "Usuário inválido.", intent: String(intent ?? "") };
    }

    try {
        if (intent === "delete") {
            await deleteUser(usuarioId, { signal: request.signal });
            return { ok: true, intent, usuarioId };
        }

        if (intent !== "update") {
            return { erro: "Operação de usuário inválida.", usuarioId };
        }

        const validacao = validarFormulario(editUserSchema, {
            ...Object.fromEntries(formulario),
            receber_atualizacoes: formulario.has("receber_atualizacoes"),
            ativo: formulario.has("ativo"),
        });

        if (validacao.erro) {
            return { ...validacao.erro, intent, usuarioId };
        }

        await updateUser(usuarioId, validacao.dados, { signal: request.signal });
        return { ok: true, intent, usuarioId };
    } catch (error) {
        return {
            erro: mensagemDeErro(
                error,
                intent === "delete"
                    ? "Não foi possível excluir o usuário"
                    : "Não foi possível atualizar o usuário",
            ),
            intent: String(intent ?? ""),
            usuarioId,
        };
    }
}
