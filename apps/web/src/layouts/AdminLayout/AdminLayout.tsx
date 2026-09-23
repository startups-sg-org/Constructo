import { Outlet } from "react-router-dom";
import Sidebar from "../../componentes/Sidebar/Sidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
    return (
        <div className="layout-admin">
            <Sidebar />
            <main className="layout-admin__conteudo">
                <Outlet />
            </main>
        </div>
    );
}
