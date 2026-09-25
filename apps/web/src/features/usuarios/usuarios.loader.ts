import type { LoaderFunctionArgs } from "react-router-dom";

import { getUsers } from "./usuarios.service";

export function carregarUsuarios({ request }: LoaderFunctionArgs) {
    return getUsers({ signal: request.signal });
}
