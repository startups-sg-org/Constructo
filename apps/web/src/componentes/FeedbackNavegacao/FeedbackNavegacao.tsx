import { Outlet, useFetchers, useNavigation } from "react-router-dom";
import "./FeedbackNavegacao.css";

export default function FeedbackNavegacao() {
    const navigation = useNavigation();
    const fetchers = useFetchers();
    const fetcherEnviando = fetchers.some((fetcher) => fetcher.state === "submitting");
    const fetcherCarregando = fetchers.some((fetcher) => fetcher.state === "loading");
    const fetcherEmAndamento = fetcherEnviando || fetcherCarregando;
    const emAndamento = navigation.state !== "idle" || fetcherEmAndamento;

    let mensagem = fetcherEnviando
        ? "Enviando dados..."
        : "Concluindo operação...";

    if (navigation.state === "submitting") {
        mensagem = "Enviando dados...";
    } else if (navigation.state === "loading") {
        mensagem = navigation.formData
            ? "Concluindo operação..."
            : "Carregando página...";
    }

    return (
        <>
            {emAndamento && <IndicadorCarregamento mensagem={mensagem} />}
            <Outlet />
        </>
    );
}

function IndicadorCarregamento({ mensagem }: { mensagem: string }) {
    return (
        <div
            className="feedback-navegacao"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <span className="feedback-navegacao__barra" aria-hidden="true" />
            <span className="feedback-navegacao__aviso">
                <span className="feedback-navegacao__spinner" aria-hidden="true" />
                <span>{mensagem}</span>
            </span>
        </div>
    );
}
