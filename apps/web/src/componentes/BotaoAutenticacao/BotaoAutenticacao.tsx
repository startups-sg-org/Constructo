import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./BotaoAutenticacao.css";

type BotaoAutenticacaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    carregando?: boolean;
    children: ReactNode;
    textoCarregando: string;
};

export default function BotaoAutenticacao({
    carregando = false,
    children,
    textoCarregando,
    className = "",
    disabled,
    ...props
}: BotaoAutenticacaoProps) {
    const estaDesabilitado = disabled || carregando;

    return (
        <button
            className={`botao primario botao-autenticacao ${className}`.trim()}
            disabled={estaDesabilitado}
            aria-busy={carregando || undefined}
            data-carregando={carregando || undefined}
            {...props}
        >
            <span aria-live="polite">
                {carregando ? textoCarregando : children}
            </span>
            {carregando ? (
                <span
                    className="botao-autenticacao__carregando"
                    aria-hidden="true"
                />
            ) : (
                <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
            )}
        </button>
    );
}
