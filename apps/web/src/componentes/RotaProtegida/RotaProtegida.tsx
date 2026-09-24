import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthenticatedUser } from "../../modulos/usuarios/servicos/userService";

type EstadoAutenticacao = "verificando" | "autenticado" | "nao-autenticado";

export default function RotaProtegida() {
    const [estado, setEstado] = useState<EstadoAutenticacao>("verificando");
    const location = useLocation();

    useEffect(() => {
        let ativo = true;

        getAuthenticatedUser()
            .then(() => {
                if (ativo) setEstado("autenticado");
            })
            .catch(() => {
                if (ativo) setEstado("nao-autenticado");
            });

        return () => {
            ativo = false;
        };
    }, []);

    if (estado === "verificando") {
        return <div role="status" aria-live="polite">Verificando autenticação...</div>;
    }

    if (estado === "nao-autenticado") {
        return <Navigate to="/login" replace state={{ origem: location }} />;
    }

    return <Outlet />;
}
