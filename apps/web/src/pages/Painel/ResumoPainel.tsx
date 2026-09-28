import { useLoaderData } from "react-router-dom";
import DashboardSummary from "../../componentes/DashboardSummary/DashboardSummary";
import PainelMarcosProtocolo from "../../modulos/marcos/componentes/PainelMarcosProtocolo";
import { carregarResumoPainel } from "../../features/usuarios/resumoPainel.loader";

export default function ResumoPainel() {
    const dados = useLoaderData<typeof carregarResumoPainel>();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <DashboardSummary dados={dados} />
            <PainelMarcosProtocolo />
        </div>
    );
}

