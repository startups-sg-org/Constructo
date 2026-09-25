import { useLoaderData } from "react-router-dom";
import DashboardSummary from "../../componentes/DashboardSummary/DashboardSummary";
import { carregarResumoPainel } from "../../router/loaders/resumoPainelLoader";

export default function ResumoPainel() {
    const dados = useLoaderData<typeof carregarResumoPainel>();

    return <DashboardSummary dados={dados} />;
}
