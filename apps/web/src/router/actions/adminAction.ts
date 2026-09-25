import { redirect, type ActionFunctionArgs } from "react-router-dom";

import { logoutUser } from "../../services/auth.service";
import { mensagemDeErro, type ActionError } from "./actionUtils";

export type AdminActionData = ActionError;

export async function executarAcaoAdministrativa({ request }: ActionFunctionArgs) {
    const formulario = await request.formData();

    if (formulario.get("intent") !== "logout") {
        return { erro: "Operação administrativa inválida." } satisfies AdminActionData;
    }

    try {
        await logoutUser({ signal: request.signal });
        return redirect("/login");
    } catch (error) {
        return {
            erro: mensagemDeErro(
                error,
                "Não foi possível encerrar a sessão. Tente novamente.",
            ),
        } satisfies AdminActionData;
    }
}
