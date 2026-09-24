import { useEffect, useState } from "react";
import DashboardSummary from "../../componentes/DashboardSummary/DashboardSummary";
import { getUsersCount } from "../../modulos/usuarios/servicos/userService";

export default function ResumoPainel() {
    const [quantidadeDeUsuarios, setQuantidadeDeUsuarios] = useState<number>();

    useEffect(() => {
        let ativo = true;

        getUsersCount()
            .then((total) => {
                if (ativo) setQuantidadeDeUsuarios(total);
            })
            .catch(() => undefined);

        return () => {
            ativo = false;
        };
    }, []);

    return (
        <DashboardSummary
            dados={
                quantidadeDeUsuarios === undefined
                    ? undefined
                    : { usuariosCadastrados: quantidadeDeUsuarios }
            }
        />
    );
}
