import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import "./AuthLayout.css";

type AuthLayoutProps = {
    children?: ReactNode;
    exibirMarca?: boolean;
};

export default function AuthLayout({ children, exibirMarca = true }: AuthLayoutProps) {
    return (
        <div className="auth-layout">
            <aside className="auth-layout__identidade" aria-label="Sobre o Constructo">
                <div className="auth-layout__identidade-conteudo">
                    {exibirMarca && (
                        <Link
                            className="auth-layout__marca"
                            to="/"
                            aria-label="Constructo — ir para o início"
                        >
                            <LogoConstructo />
                            <span>Constructo</span>
                        </Link>
                    )}

                    <div className="auth-layout__apresentacao">
                        <p className="auth-layout__chamada">
                            <span aria-hidden="true" />
                            Sua obra sob controle
                        </p>
                        <h1>
                            Gestão simples.<br />
                            <em>Decisões mais seguras.</em>
                        </h1>
                        <p>
                            Obras, contratos, medições e progresso reunidos em um só lugar,
                            do planejamento à entrega.
                        </p>
                    </div>

                    <ul className="auth-layout__beneficios" aria-label="Benefícios da plataforma">
                        <li><IconeConfirmacao /> Informação clara</li>
                        <li><IconeConfirmacao /> Dados centralizados</li>
                        <li><IconeConfirmacao /> Visão em tempo real</li>
                    </ul>
                </div>

                <div className="auth-layout__circulo auth-layout__circulo--superior" aria-hidden="true" />
                <div className="auth-layout__circulo auth-layout__circulo--inferior" aria-hidden="true" />
            </aside>

            <main className="auth-layout__conteudo">
                <div className="auth-layout__formulario">
                    {children ?? <Outlet />}
                </div>
            </main>
        </div>
    );
}

function LogoConstructo() {
    return (
        <svg className="auth-layout__logo" viewBox="0 0 44 44" aria-hidden="true">
            <path d="M22 2 39.3 12v20L22 42 4.7 32V12L22 2Z" fill="currentColor" />
            <path
                d="M29.7 14.8a10 10 0 1 0 .2 14.2l-4-3.2a5 5 0 1 1-.1-7.7l3.9-3.3Z"
                fill="white"
            />
        </svg>
    );
}

function IconeConfirmacao() {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5.5 10 3 3 6-6" /></svg>;
}
