export default function HowItWorksSection() {
    return (
        <section className="como-funciona" id="como-funciona" aria-labelledby="titulo-como-funciona">
            <div className="como-funciona__cabecalho">
                <p>Passo a passo</p>
                <h2 id="titulo-como-funciona">Da organização ao acompanhamento da obra.</h2>
                <span>
                    Um fluxo simples para manter informações, medições e progresso sempre sob controle.
                </span>
            </div>

            <ol className="como-funciona__etapas">
                <Etapa numero="01" titulo="Cadastre a obra">
                    Adicione os dados principais do projeto e reúna as informações iniciais em um só lugar.
                </Etapa>
                <Etapa numero="02" titulo="Vincule contratos e informações">
                    Organize contratos, valores, responsáveis e documentos relacionados à execução.
                </Etapa>
                <Etapa numero="03" titulo="Registre as medições">
                    Atualize os serviços realizados para manter os dados da obra claros e confiáveis.
                </Etapa>
                <Etapa numero="04" titulo="Acompanhe o andamento">
                    Visualize a evolução do projeto e identifique rapidamente os próximos passos.
                </Etapa>
            </ol>
        </section>
    );
}

function Etapa({ numero, titulo, children }: {
    numero: string;
    titulo: string;
    children: string;
}) {
    return (
        <li className="como-funciona__etapa">
            <span className="como-funciona__numero" aria-hidden="true">{numero}</span>
            <div>
                <h3>{titulo}</h3>
                <p>{children}</p>
            </div>
        </li>
    );
}
