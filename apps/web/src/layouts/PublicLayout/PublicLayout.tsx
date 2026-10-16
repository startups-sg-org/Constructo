import { Outlet } from "react-router-dom";
import Footer from "../../componentes/Footer/Footer";
import NavbarPublica from "../../componentes/NavbarPublica/NavbarPublica";

export default function PublicLayout() {
    return (
        <div className="layout-publico flex min-h-dvh min-w-0 flex-col">
            <NavbarPublica />
            <div className="layout-publico__conteudo flex min-w-0 flex-1 flex-col [&>*]:w-full">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}
