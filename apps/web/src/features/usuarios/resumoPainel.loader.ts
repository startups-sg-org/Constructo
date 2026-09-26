import type { LoaderFunctionArgs } from "react-router-dom";

import { getAuthenticatedUser } from "../auth/auth.service";
import { getUsersCount } from "./usuarios.service";

export async function carregarResumoPainel({ request }: LoaderFunctionArgs) {
    const usuario = await getAuthenticatedUser({ signal: request.signal });
    if (usuario.papel !== "ADMIN") return {};

    const usuariosCadastrados = await getUsersCount({ signal: request.signal });

    return { usuariosCadastrados };
}
