import { type LoaderFunctionArgs } from "react-router-dom";

import { getContratosDisponiveis } from "./contratos.service";

export function carregarContratosDisponiveis({ request }: LoaderFunctionArgs) {
    return getContratosDisponiveis({ signal: request.signal });
}
