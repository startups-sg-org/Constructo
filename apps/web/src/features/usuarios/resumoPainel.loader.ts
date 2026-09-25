import type { LoaderFunctionArgs } from "react-router-dom";

import { getUsersCount } from "./usuarios.service";

export async function carregarResumoPainel({ request }: LoaderFunctionArgs) {
    const usuariosCadastrados = await getUsersCount({ signal: request.signal });

    return { usuariosCadastrados };
}
