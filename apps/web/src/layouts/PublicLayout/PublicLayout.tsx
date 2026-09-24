import { Outlet } from "react-router-dom";
import Footer from "../../componentes/Footer/Footer";
import NavbarPublica from "../../componentes/NavbarPublica/NavbarPublica";
import "./PublicLayout.css";

export default function PublicLayout() {
    return (
        <div className="layout-publico">
            <NavbarPublica />
            <div className="layout-publico__conteudo">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}
