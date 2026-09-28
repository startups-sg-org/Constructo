import { listarMarcos, obterMarcoPorId } from "./marcos.service";
import type { LoaderFunctionArgs } from "react-router-dom";

export async function carregarListaMarcos() {
  return await listarMarcos();
}

export async function carregarMarcoDetalhe({ params }: LoaderFunctionArgs) {
  const marcoId = params.id;
  if (!marcoId) {
    throw new Response("ID do marco não fornecido", { status: 400 });
  }
  const marco = await obterMarcoPorId(marcoId);
  if (!marco) {
    throw new Response("Marco não encontrado", { status: 404 });
  }
  return marco;
}
