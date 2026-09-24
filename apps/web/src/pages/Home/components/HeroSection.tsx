import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { IconeDocumento, IconeMedicao, IconeObra, SetaDireita } from "./icons";

export default function HeroSection() {
    return (
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
                                        <span key={indice} style={{ "--altura": altura + "%" } as CSSProperties} />
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

function IconeConfirmacao() {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5.5 10 3 3 6-6" /></svg>;
}

function IconeBusca() {
    return <svg viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5" /><path d="m12.5 12.5 4 4" /></svg>;
}

function IconePainel() {
    return <svg viewBox="0 0 20 20"><rect x="3" y="3" width="5" height="5" /><rect x="12" y="3" width="5" height="5" /><rect x="3" y="12" width="5" height="5" /><rect x="12" y="12" width="5" height="5" /></svg>;
}

function IconeTendencia() {
    return <svg viewBox="0 0 24 24"><path d="m4 16 5-5 4 4 7-8M15 7h5v5" /></svg>;
}
