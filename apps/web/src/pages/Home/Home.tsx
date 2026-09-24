import ResumoPainel from "../Painel/ResumoPainel";
import PaginaPainel from "../Painel/PaginaPainel";

export default function Home() {
    return (
        <PaginaPainel
            titulo="Painel Administrativo"
            subtitulo="Visão geral do seu painel Constructo."
        >
            <ResumoPainel />
        </PaginaPainel>
    );
}
