import { Outlet } from "react-router-dom";
import AdminContent from "../../componentes/AdminContent/AdminContent";
import Navbar from "../../componentes/Navbar/Navbar";
import Sidebar from "../../componentes/Sidebar/Sidebar";

export default function AdminLayout() {
    return (
        <div className="layout-admin flex min-h-dvh w-full items-start bg-canvas text-foreground">
            <Sidebar />
            <div className="layout-admin__principal flex min-h-dvh min-w-0 flex-1 flex-col items-start self-stretch bg-canvas">
                <Navbar />
                <AdminContent>
                    <Outlet />
                </AdminContent>
            </div>
        </div>
    );
}
