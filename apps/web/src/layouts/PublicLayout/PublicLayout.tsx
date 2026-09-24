import { Outlet } from "react-router-dom";
import Footer from "../../componentes/Footer/Footer";
import NavbarPublica from "../../componentes/NavbarPublica/NavbarPublica";

export default function PublicLayout() {
    return (
        <div className="layout-publico">
            <NavbarPublica />
            <Outlet />
            <Footer />
        </div>
    );
}
