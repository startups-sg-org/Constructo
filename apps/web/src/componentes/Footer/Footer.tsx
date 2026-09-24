import { Link } from "react-router-dom";
import "./Footer.css";

const linksNavegacao = [
    { rotulo: "Início", destino: "/#inicio" },
    { rotulo: "Recursos", destino: "/#recursos" },
    { rotulo: "Benefícios", destino: "/#beneficios" },
    { rotulo: "Como funciona", destino: "/#como-funciona" }
];

export default function Footer() {
    const anoAtual = new Date().getFullYear();

    return (
        <footer className="footer" id="sobre" aria-labelledby="footer-titulo">
            <div className="footer__conteudo">
                <div className="footer__apresentacao">
                    <a className="footer__marca" href="/#inicio" aria-label="Constructo — ir para o início">
                        <LogoConstructo />
                        <span id="footer-titulo">Constructo</span>
                    </a>
                    <p>
                        Gestão de obras simples e transparente, com informações centralizadas
                        para decisões mais seguras do planejamento à entrega.
                    </p>
                </div>

                <nav className="footer__coluna" aria-label="Navegação do rodapé">
                    <h2>Navegação</h2>
                    <ul>
                        {linksNavegacao.map(({ rotulo, destino }) => (
                            <li key={destino}>
                                <a href={destino}>{rotulo}</a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="footer__coluna">
                    <h2>Plataforma</h2>
                    <ul>
                        <li><Link to="/login">Entrar</Link></li>
                        <li><Link to="/cadastro">Criar conta</Link></li>
                    </ul>
                </div>

                <div className="footer__projeto">
                    <h2>Sobre o projeto</h2>
                    <p>
                        Uma plataforma criada para conectar equipes, processos e dados durante
                        todas as etapas da obra.
                    </p>
                </div>
            </div>

            <div className="footer__base">
                <p>&copy; {anoAtual} Constructo. Todos os direitos reservados.</p>
                <span>Construindo uma gestão mais clara.</span>
            </div>
        </footer>
    );
}

function LogoConstructo() {
    return (
        <svg className="footer__logo" viewBox="0 0 44 44" aria-hidden="true">
            <path d="M22 2 39.3 12v20L22 42 4.7 32V12L22 2Z" fill="currentColor" />
            <path
                d="M29.7 14.8a10 10 0 1 0 .2 14.2l-4-3.2a5 5 0 1 1-.1-7.7l3.9-3.3Z"
                fill="white"
            />
        </svg>
    );
}
