import { userSchema } from "@constructo/shared";
import { replace, type ActionFunctionArgs } from "react-router-dom";

import { createUser } from "./usuarios.service";
import { mensagemDeErro, validarFormulario, type ActionError } from "../shared/actionUtils";
import { logoutUser } from "../auth/auth.service";

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
        // Garante que uma sessão anterior não redirecione o cadastro para o
        // papel do usuário antigo ao abrir a tela de login.
        await logoutUser({ signal: request.signal });
        return replace("/login");
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        return {
            erro: mensagemDeErro(
                error,
                "Não foi possível criar sua conta. Tente novamente mais tarde.",
            ),
        } satisfies CadastroActionData;
    }
}
