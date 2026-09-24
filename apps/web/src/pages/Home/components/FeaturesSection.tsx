import FeatureCard from "../../../componentes/FeatureCard/FeatureCard";
import {
    IconeCentralizacao,
    IconeDocumento,
    IconeLocalizacao,
    IconeMedicao,
    IconeObra,
    IconeProgresso
} from "./icons";

export default function FeaturesSection() {
    return (
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
    );
}
