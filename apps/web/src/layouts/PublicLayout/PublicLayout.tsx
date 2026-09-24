import { Outlet } from "react-router-dom";
import NavbarPublica from "../../componentes/NavbarPublica/NavbarPublica";

export default function PublicLayout() {
    return (
        <div className="layout-publico">
            <NavbarPublica />
            <Outlet />
        </div>
    );
}
