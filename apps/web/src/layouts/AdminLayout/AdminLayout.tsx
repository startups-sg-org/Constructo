import { Outlet } from "react-router-dom";
import AdminContent from "../../componentes/AdminContent/AdminContent";
import Navbar from "../../componentes/Navbar/Navbar";
import Sidebar from "../../componentes/Sidebar/Sidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
    return (
        <div className="layout-admin">
            <Sidebar />
            <div className="layout-admin__principal">
                <Navbar />
                <AdminContent>
                    <Outlet />
                </AdminContent>
            </div>
        </div>
    );
}
