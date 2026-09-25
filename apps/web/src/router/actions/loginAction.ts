import { loginSchema } from "@constructo/shared";
import { redirect, type ActionFunctionArgs } from "react-router-dom";

import { loginUser } from "../../services/auth.service";
import { mensagemDeErro, validarFormulario, type ActionError } from "./actionUtils";

export type LoginActionData = ActionError;

export async function autenticarUsuario({ request }: ActionFunctionArgs) {
    const formulario = await request.formData();
    const validacao = validarFormulario(loginSchema, Object.fromEntries(formulario));

    if (validacao.erro) return validacao.erro;

    try {
        await loginUser(validacao.dados.email, validacao.dados.senha, {
            signal: request.signal,
        });

        const redirectTo = new URL(request.url).searchParams.get("redirectTo");
        const destino =
            redirectTo === "/admin" || redirectTo?.startsWith("/admin/")
                ? redirectTo
                : "/admin";

        return redirect(destino);
    } catch (error) {
        return {
            erro: mensagemDeErro(error, "Não foi possível realizar o login"),
        } satisfies LoginActionData;
    }
}
