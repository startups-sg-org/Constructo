import { Outlet } from "react-router-dom";
import "./AdminContent.css";

/**
 * Região do layout em que o React Router renderiza a rota administrativa ativa.
 * O Outlet troca somente o conteúdo da página e mantém Sidebar e Navbar montadas.
 */
export default function AdminContent() {
    return (
        <main className="admin-content" id="conteudo-principal">
            <Outlet />
        </main>
    );
}
