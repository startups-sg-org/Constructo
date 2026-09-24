import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import FeatureCard from "../../componentes/FeatureCard/FeatureCard";
import "./Home.css";

export default function Home() {
    return (
        <main className="pagina-inicial">
            <section className="hero" id="inicio" aria-labelledby="titulo-inicio">
                <div className="hero__conteudo">
                    <div className="hero__texto">
                        <p className="hero__chamada">
                            <span aria-hidden="true" />
                            Sua obra sob controle
                        </p>
                        <h1 id="titulo-inicio">
                            Gestão de obras <em>simples e transparente.</em>
                        </h1>
                        <p className="hero__descricao">
                            Acompanhe obras, contratos, medições e progresso em um único lugar.
                            Informação clara para decisões mais seguras, do planejamento à entrega.
                        </p>
                        <div className="hero__acoes" aria-label="Ações principais">
                            <a className="hero__botao hero__botao--primario" href="#recursos">
                                Conhecer a plataforma
                                <SetaDireita />
                            </a>
                            <Link className="hero__botao hero__botao--secundario" to="/login">
                                Entrar
                            </Link>
                        </div>
                        <ul className="hero__beneficios" aria-label="Benefícios da plataforma">
                            <li><IconeConfirmacao /> Visão em tempo real</li>
                            <li><IconeConfirmacao /> Dados centralizados</li>
                        </ul>
                    </div>
                    <PreviewSistema />
                </div>
            </section>

            <section className="recursos" id="recursos" aria-labelledby="titulo-recursos">
                <div className="recursos__cabecalho">
                    <p>Gestão integrada</p>
                    <h2 id="titulo-recursos">Tudo o que sua obra precisa em um só lugar.</h2>
                    <span>
                        Recursos pensados para simplificar a rotina e dar mais segurança às suas decisões.
                    </span>
                </div>

                <div className="recursos__lista">
                    <FeatureCard
                        icone={<IconeObra />}
                        titulo="Gestão de obras"
                        descricao="Organize prazos, responsáveis e etapas para conduzir cada obra com mais clareza."
                    />
                    <FeatureCard
                        icone={<IconeMedicao />}
                        titulo="Acompanhamento de medições"
                        descricao="Registre e consulte as medições da obra com dados claros, acessíveis e atualizados."
                    />
                    <FeatureCard
                        icone={<IconeDocumento />}
                        titulo="Gestão de contratos"
                        descricao="Mantenha contratos, valores e informações importantes sempre organizados e à mão."
                    />
                    <FeatureCard
                        icone={<IconeLocalizacao />}
                        titulo="Localização das obras"
                        descricao="Visualize onde cada projeto está e encontre rapidamente as obras sob sua gestão."
                    />
                    <FeatureCard
                        icone={<IconeProgresso />}
                        titulo="Acompanhamento do progresso"
                        descricao="Veja a evolução das etapas e identifique com facilidade o que precisa de atenção."
                    />
                    <FeatureCard
                        icone={<IconeCentralizacao />}
                        titulo="Informações centralizadas"
                        descricao="Reúna os dados da operação em um só lugar e tome decisões com mais segurança."
                    />
                </div>
            </section>
            <section className="beneficios" id="beneficios" aria-labelledby="titulo-beneficios">
                <div className="beneficios__introducao">
                    <p className="beneficios__chamada">Benefícios para sua gestão</p>
                    <h2 id="titulo-beneficios">
                        Mais clareza em cada etapa da obra.
                    </h2>
                    <p className="beneficios__descricao">
                        O Constructo conecta informações, processos e responsáveis para sua equipe
                        trabalhar de forma mais organizada e tomar decisões com confiança.
                    </p>

                    <aside className="beneficios__destaque" aria-label="Resultado da gestão integrada">
                        <span><IconeConexao /></span>
                        <div>
                            <strong>Todos na mesma direção</strong>
                            <p>Do escritório ao canteiro, a equipe acompanha uma única fonte de informação.</p>
                        </div>
                    </aside>
                </div>

                <div className="beneficios__lista">
                    <Beneficio
                        icone={<IconeCentralizacao />}
                        titulo="Informações centralizadas"
                        descricao="Dados da obra reunidos em um só ambiente, sempre fáceis de encontrar e consultar."
                    />
                    <Beneficio
                        icone={<IconeProgresso />}
                        titulo="Progresso mais visível"
                        descricao="Acompanhe a evolução das etapas e identifique rapidamente pontos que exigem atenção."
                    />
                    <Beneficio
                        icone={<IconeMedicao />}
                        titulo="Medições simplificadas"
                        descricao="Organize registros e acompanhe medições com mais agilidade, clareza e segurança."
                    />
                    <Beneficio
                        icone={<IconeDocumento />}
                        titulo="Contratos organizados"
                        descricao="Mantenha documentos, valores e informações contratuais acessíveis para toda a gestão."
                    />
                    <Beneficio
                        icone={<IconeTransparencia />}
                        titulo="Mais transparência"
                        descricao="Compartilhe informações consistentes e dê mais previsibilidade a cada decisão da obra."
                    />
                    <Beneficio
                        icone={<IconeResponsaveis />}
                        titulo="Responsáveis alinhados"
                        descricao="Facilite o acompanhamento entre equipes e deixe claro quem cuida de cada etapa."
                    />
                </div>
            </section>
            <section className="como-funciona" id="como-funciona" aria-labelledby="titulo-como-funciona">
                <div className="como-funciona__cabecalho">
                    <p>Passo a passo</p>
                    <h2 id="titulo-como-funciona">Da organização ao acompanhamento da obra.</h2>
                    <span>
                        Um fluxo simples para manter informações, medições e progresso sempre sob controle.
                    </span>
                </div>

                <ol className="como-funciona__etapas">
                    <li className="como-funciona__etapa">
                        <span className="como-funciona__numero" aria-hidden="true">01</span>
                        <div>
                            <h3>Cadastre a obra</h3>
                            <p>Adicione os dados principais do projeto e reúna as informações iniciais em um só lugar.</p>
                        </div>
                    </li>
                    <li className="como-funciona__etapa">
                        <span className="como-funciona__numero" aria-hidden="true">02</span>
                        <div>
                            <h3>Vincule contratos e informações</h3>
                            <p>Organize contratos, valores, responsáveis e documentos relacionados à execução.</p>
                        </div>
                    </li>
                    <li className="como-funciona__etapa">
                        <span className="como-funciona__numero" aria-hidden="true">03</span>
                        <div>
                            <h3>Registre as medições</h3>
                            <p>Atualize os serviços realizados para manter os dados da obra claros e confiáveis.</p>
                        </div>
                    </li>
                    <li className="como-funciona__etapa">
                        <span className="como-funciona__numero" aria-hidden="true">04</span>
                        <div>
                            <h3>Acompanhe o andamento</h3>
                            <p>Visualize a evolução do projeto e identifique rapidamente os próximos passos.</p>
                        </div>
                    </li>
                </ol>
            </section>
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
        </main>
    );
}

function Beneficio({ icone, titulo, descricao }: {
    icone: ReactNode;
    titulo: string;
    descricao: string;
}) {
    return (
        <article className="beneficio">
            <div className="beneficio__icone" aria-hidden="true">{icone}</div>
            <div>
                <h3>{titulo}</h3>
                <p>{descricao}</p>
            </div>
        </article>
    );
}

function PreviewSistema() {
    return (
        <div className="hero-preview" role="img" aria-label="Preview do painel de gestão do Constructo">
            <div className="hero-preview__decoracao hero-preview__decoracao--superior" aria-hidden="true" />
            <div className="hero-preview__decoracao hero-preview__decoracao--inferior" aria-hidden="true" />

            <div className="hero-preview__janela">
                <div className="hero-preview__topo">
                    <div className="hero-preview__marca">
                        <span className="hero-preview__simbolo">C</span>
                        <span>Constructo</span>
                    </div>
                    <div className="hero-preview__busca" aria-hidden="true">
                        <IconeBusca />
                        Buscar no painel...
                    </div>
                    <div className="hero-preview__avatar" aria-hidden="true">MS</div>
                </div>

                <div className="hero-preview__corpo">
                    <aside className="hero-preview__lateral" aria-hidden="true">
                        <span className="ativo"><IconePainel /> Visão geral</span>
                        <span><IconeObra /> Obras</span>
                        <span><IconeDocumento /> Contratos</span>
                        <span><IconeMedicao /> Medições</span>
                    </aside>

                    <div className="hero-preview__painel">
                        <div className="hero-preview__cabecalho">
                            <div>
                                <small>VISÃO GERAL</small>
                                <strong>Olá, Marina!</strong>
                            </div>
                            <span>+ Nova obra</span>
                        </div>

                        <div className="hero-preview__indicadores">
                            <Indicador rotulo="Obras ativas" valor="12" variacao="+2 este mês" />
                            <Indicador rotulo="Progresso médio" valor="68%" variacao="+8% este mês" />
                            <Indicador rotulo="Medições" valor="24" variacao="3 pendentes" destaque />
                        </div>

                        <div className="hero-preview__detalhes">
                            <div className="hero-preview__grafico">
                                <div className="hero-preview__titulo-bloco">
                                    <span>Progresso das obras</span>
                                    <small>Últimos 6 meses</small>
                                </div>
                                <div className="hero-preview__barras" aria-hidden="true">
                                    {[42, 56, 48, 70, 62, 84].map((altura, indice) => (
                                        <span key={indice} style={{ "--altura": `${altura}%` } as CSSProperties} />
                                    ))}
                                </div>
                            </div>

                            <div className="hero-preview__obra">
                                <div className="hero-preview__titulo-bloco">
                                    <span>Obra em destaque</span>
                                    <small>Ver detalhes</small>
                                </div>
                                <strong>Residencial Aurora</strong>
                                <small>Palmas, TO</small>
                                <div className="hero-preview__progresso"><span /></div>
                                <small>Previsão de entrega: Dez/26</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-preview__status">
                <span><IconeTendencia /></span>
                <div>
                    <small>Progresso geral</small>
                    <strong>+12,5%</strong>
                </div>
            </div>
        </div>
    );
}

function Indicador({ rotulo, valor, variacao, destaque = false }: {
    rotulo: string;
    valor: string;
    variacao: string;
    destaque?: boolean;
}) {
    return (
        <div className="hero-preview__indicador">
            <small>{rotulo}</small>
            <strong>{valor}</strong>
            <span className={destaque ? "pendente" : ""}>{variacao}</span>
        </div>
    );
}

function SetaDireita() {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>;
}

function IconeConfirmacao() {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5.5 10 3 3 6-6" /></svg>;
}

function IconeBusca() {
    return <svg viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5" /><path d="m12.5 12.5 4 4" /></svg>;
}

function IconePainel() {
    return <svg viewBox="0 0 20 20"><rect x="3" y="3" width="5" height="5" /><rect x="12" y="3" width="5" height="5" /><rect x="3" y="12" width="5" height="5" /><rect x="12" y="12" width="5" height="5" /></svg>;
}

function IconeObra() {
    return <svg viewBox="0 0 20 20"><path d="M3 17h14M5 17V8l5-4 5 4v9M8 17v-5h4v5" /></svg>;
}

function IconeDocumento() {
    return <svg viewBox="0 0 20 20"><path d="M5 2.5h7l3 3V17.5H5zM12 2.5v3h3M8 10h4M8 13h4" /></svg>;
}

function IconeMedicao() {
    return <svg viewBox="0 0 20 20"><path d="M3 16.5h14M5 14V9M10 14V4M15 14V7" /></svg>;
}

function IconeLocalizacao() {
    return <svg viewBox="0 0 20 20"><path d="M10 17s5-4.6 5-9a5 5 0 0 0-10 0c0 4.4 5 9 5 9Z" /><circle cx="10" cy="8" r="1.7" /></svg>;
}

function IconeProgresso() {
    return <svg viewBox="0 0 20 20"><path d="M3 16.5h14M4.5 13l3.2-3.2 2.6 2.2 5.2-6M12.5 6h3v3" /></svg>;
}

function IconeCentralizacao() {
    return <svg viewBox="0 0 20 20"><rect x="3" y="3" width="5" height="5" rx="1" /><rect x="12" y="3" width="5" height="5" rx="1" /><rect x="7.5" y="12" width="5" height="5" rx="1" /><path d="M5.5 8v2h9V8M10 10v2" /></svg>;
}

function IconeTransparencia() {
    return <svg viewBox="0 0 20 20"><path d="M2.5 10s2.8-4.5 7.5-4.5 7.5 4.5 7.5 4.5-2.8 4.5-7.5 4.5S2.5 10 2.5 10Z" /><circle cx="10" cy="10" r="2.2" /></svg>;
}

function IconeResponsaveis() {
    return <svg viewBox="0 0 20 20"><circle cx="7" cy="7" r="2.5" /><circle cx="14" cy="8" r="2" /><path d="M2.8 16c.4-3 2-4.5 4.2-4.5s3.8 1.5 4.2 4.5M11.2 12.5c.8-.9 1.7-1.3 2.8-1.3 1.8 0 3 1.2 3.3 3.6" /></svg>;
}

function IconeConexao() {
    return <svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" /></svg>;
}

function IconeTendencia() {
    return <svg viewBox="0 0 24 24"><path d="m4 16 5-5 4 4 7-8M15 7h5v5" /></svg>;
}
