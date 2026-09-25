import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import LogoConstructo from "../../componentes/LogoConstructo/LogoConstructo";
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
                            <LogoConstructo className="auth-layout__logo" />
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

function IconeConfirmacao() {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5.5 10 3 3 6-6" /></svg>;
}
