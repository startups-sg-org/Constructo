import { userSchema } from "@constructo/shared";
import { redirect, type ActionFunctionArgs } from "react-router-dom";

import { createUser } from "../../services/users.service";
import { mensagemDeErro, validarFormulario, type ActionError } from "./actionUtils";

export type CadastroActionData = ActionError;

export async function cadastrarUsuario({ request }: ActionFunctionArgs) {
    const formulario = await request.formData();
    const validacao = validarFormulario(userSchema, {
        ...Object.fromEntries(formulario),
        receber_atualizacoes: formulario.has("receber_atualizacoes"),
    });

    if (validacao.erro) return validacao.erro;

    try {
        const { confirmarSenha, ...usuario } = validacao.dados;
        void confirmarSenha;
        await createUser(usuario, { signal: request.signal });
        return redirect("/login");
    } catch (error) {
        return {
            erro: mensagemDeErro(
                error,
                "Não foi possível criar sua conta. Tente novamente mais tarde.",
            ),
        } satisfies CadastroActionData;
    }
}
