import { Link } from "react-router-dom";
import { SetaDireita } from "./icons";

export default function CTASection() {
    return (
        <section className="cta-acesso" aria-labelledby="titulo-cta-acesso">
            <div className="cta-acesso__conteudo">
                <div className="cta-acesso__texto">
                    <p className="cta-acesso__chamada">Sua gestão começa aqui</p>
                    <h2 id="titulo-cta-acesso">Comece a gerenciar suas obras com o Constructo.</h2>
                    <p className="cta-acesso__descricao">
                        Centralize informações, acompanhe o progresso e tome decisões com mais segurança.
                    </p>
                </div>

                <Link className="cta-acesso__botao" to="/login">
                    Acessar plataforma
                    <SetaDireita />
                </Link>
            </div>
        </section>
    );
}
