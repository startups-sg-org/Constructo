import { Outlet } from "react-router-dom";
import AdminContent from "../../componentes/AdminContent/AdminContent";
import Navbar from "../../componentes/Navbar/Navbar";
import Sidebar from "../../componentes/Sidebar/Sidebar";

export default function AdminLayout() {
    return (
        <div className="layout-admin flex min-h-dvh bg-[#f5f7f6] max-[760px]:flex-col">
            <Sidebar />
            <div className="layout-admin__principal flex min-w-0 flex-1 flex-col">
                <Navbar />
                <AdminContent>
                    <Outlet />
                </AdminContent>
            </div>
        </div>
    );
}
