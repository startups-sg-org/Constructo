import type { ReactNode } from "react";
import {
    IconeCentralizacao,
    IconeDocumento,
    IconeMedicao,
    IconeProgresso
} from "./icons";

export default function BenefitsSection() {
    return (
        <section className="beneficios" id="beneficios" aria-labelledby="titulo-beneficios">
            <div className="beneficios__introducao">
                <p className="beneficios__chamada">Benefícios para sua gestão</p>
                <h2 id="titulo-beneficios">Mais clareza em cada etapa da obra.</h2>
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

function IconeTransparencia() {
    return <svg viewBox="0 0 20 20"><path d="M2.5 10s2.8-4.5 7.5-4.5 7.5 4.5 7.5 4.5-2.8 4.5-7.5 4.5S2.5 10 2.5 10Z" /><circle cx="10" cy="10" r="2.2" /></svg>;
}

function IconeResponsaveis() {
    return <svg viewBox="0 0 20 20"><circle cx="7" cy="7" r="2.5" /><circle cx="14" cy="8" r="2" /><path d="M2.8 16c.4-3 2-4.5 4.2-4.5s3.8 1.5 4.2 4.5M11.2 12.5c.8-.9 1.7-1.3 2.8-1.3 1.8 0 3 1.2 3.3 3.6" /></svg>;
}

function IconeConexao() {
    return <svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" /></svg>;
}
