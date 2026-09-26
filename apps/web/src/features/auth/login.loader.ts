import { redirect, type LoaderFunctionArgs } from "react-router-dom";

import { getAuthenticatedUser } from "./auth.service";
import { obterDestinoAposLogin } from "./authRedirect";

export async function redirecionarUsuarioAutenticado({ request }: LoaderFunctionArgs) {
    try {
        const usuario = await getAuthenticatedUser({ signal: request.signal });
        return redirect(obterDestinoAposLogin(request.url, usuario.papel));
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        return null;
    }
}
