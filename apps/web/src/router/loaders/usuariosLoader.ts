import type { LoaderFunctionArgs } from "react-router-dom";

import { getUsers } from "../../services/users.service";

export function carregarUsuarios({ request }: LoaderFunctionArgs) {
    return getUsers({ signal: request.signal });
}
