import { useId, type ReactNode } from "react";
import "./AuthCard.css";

type AuthCardProps = {
    titulo: ReactNode;
    descricao?: ReactNode;
    children: ReactNode;
    acoes?: ReactNode;
    chamada?: ReactNode;
    compacto?: boolean;
};

export default function AuthCard({
    titulo,
    descricao,
    children,
    acoes,
    chamada,
    compacto = false
}: AuthCardProps) {
    const tituloId = useId();

    return (
        <section
            className={`auth-card${compacto ? " auth-card--compacto" : ""}`}
            aria-labelledby={tituloId}
        >
            <header className="auth-card__cabecalho">
                {chamada && <p className="auth-card__chamada">{chamada}</p>}
                <h1 id={tituloId}>{titulo}</h1>
                {descricao && <p className="auth-card__descricao">{descricao}</p>}
            </header>

            <div className="auth-card__conteudo">{children}</div>

            {acoes && <footer className="auth-card__acoes">{acoes}</footer>}
        </section>
    );
}
