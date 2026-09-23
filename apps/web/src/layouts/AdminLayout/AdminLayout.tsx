import { Outlet } from "react-router-dom";
import Navbar from "../../componentes/Navbar/Navbar";
import Sidebar from "../../componentes/Sidebar/Sidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
    return (
        <div className="layout-admin">
            <Sidebar />
            <div className="layout-admin__principal">
                <Navbar />
                <main className="layout-admin__conteudo">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
