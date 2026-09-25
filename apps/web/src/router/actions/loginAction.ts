import { loginSchema } from "@constructo/shared";
import { redirect, type ActionFunctionArgs } from "react-router-dom";

import { loginUser } from "../../services/auth.service";
import { obterDestinoAposLogin } from "../authRedirect";
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

        return redirect(obterDestinoAposLogin(request.url));
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        return {
            erro: mensagemDeErro(error, "Não foi possível realizar o login"),
        } satisfies LoginActionData;
    }
}
