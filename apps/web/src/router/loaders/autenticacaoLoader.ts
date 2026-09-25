import { redirect, type LoaderFunctionArgs } from "react-router-dom";

import { getAuthenticatedUser } from "../../services/auth.service";

export async function exigirAutenticacao({ request }: LoaderFunctionArgs) {
  try {
    await getAuthenticatedUser({ signal: request.signal });
    return null;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    const url = new URL(request.url);
    const destino = `${url.pathname}${url.search}${url.hash}`;
    const parametros = new URLSearchParams({ redirectTo: destino });

    throw redirect(`/login?${parametros.toString()}`);
  }
}
