import { redirect, type LoaderFunctionArgs } from "react-router-dom";

import { getAuthenticatedUser } from "../../modulos/usuarios/servicos/userService";

export async function exigirAutenticacao({ request }: LoaderFunctionArgs) {
  try {
    await getAuthenticatedUser();
    return null;
  } catch {
    const url = new URL(request.url);
    const destino = `${url.pathname}${url.search}${url.hash}`;
    const parametros = new URLSearchParams({ redirectTo: destino });

    throw redirect(`/login?${parametros.toString()}`);
  }
}
