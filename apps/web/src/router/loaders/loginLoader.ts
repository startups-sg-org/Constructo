import { redirect, type LoaderFunctionArgs } from "react-router-dom";

import { getAuthenticatedUser } from "../../services/auth.service";
import { obterDestinoAposLogin } from "../authRedirect";

export async function redirecionarUsuarioAutenticado({ request }: LoaderFunctionArgs) {
    try {
        await getAuthenticatedUser({ signal: request.signal });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        return null;
    }

    return redirect(obterDestinoAposLogin(request.url));
}
