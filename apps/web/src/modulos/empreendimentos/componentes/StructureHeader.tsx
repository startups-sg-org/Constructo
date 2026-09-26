import { Link } from "react-router-dom";
import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";

type StructureHeaderProps = {
    empreendimentoId: number;
    empreendimentoNome: string;
};

export default function StructureHeader({
    empreendimentoId,
    empreendimentoNome,
}: StructureHeaderProps) {
    return (
        <CabecalhoSecao
            etiqueta="Empreendimento"
            titulo={empreendimentoNome}
            tituloId="estrutura-fisica-empreendimento-titulo"
            comDivisor
            complemento={(
                <Link
                    className="botao secundario"
                    to={`/admin/empreendimentos/${empreendimentoId}`}
                >
                    Voltar aos detalhes
                </Link>
            )}
        />
    );
}
