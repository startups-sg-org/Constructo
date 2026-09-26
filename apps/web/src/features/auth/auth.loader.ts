import { redirect, type LoaderFunctionArgs } from "react-router-dom";

import { ApiError } from "../../services/api";
import { getAuthenticatedUser } from "./auth.service";

type AuthArgs = Pick<LoaderFunctionArgs, "request">;


function redirecionarParaLogin(request: Request): never {
  const url = new URL(request.url);
  const destino = `${url.pathname}${url.search}${url.hash}`;
  const parametros = new URLSearchParams({ redirectTo: destino });

  throw redirect(`/login?${parametros.toString()}`);
}
export async function exigirAutenticacao({ request }: AuthArgs) {
  try {
    return await getAuthenticatedUser({ signal: request.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    if (error instanceof ApiError && error.status === 401) redirecionarParaLogin(request);
    throw error;
  }
}


export async function exigirAcessoAoPainel(args: AuthArgs) {
  const usuario = await exigirAutenticacao(args);

  if (usuario.papel !== "ADMIN" && usuario.papel !== "GESTOR") {
    throw new Response("Acesso restrito ao painel administrativo", { status: 403 });
  }

  return usuario;
}


export async function exigirAdmin(args: AuthArgs) {
  const usuario = await exigirAutenticacao(args);

  if (usuario.papel !== "ADMIN") {
    throw new Response("Acesso restrito a administradores", { status: 403 });
  }

  return usuario;
}
