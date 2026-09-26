import { Link } from "react-router-dom";

type StructureHeaderProps = {
    empreendimentoId: number;
    empreendimentoNome: string;
};

export default function StructureHeader({
    empreendimentoId,
    empreendimentoNome,
}: StructureHeaderProps) {
    return (
        <header className="detalhes-empreendimento__cabecalho">
            <div>
                <span className="subtitulo">Empreendimento</span>
                <h2 id="estrutura-fisica-empreendimento-titulo">{empreendimentoNome}</h2>
            </div>
            <Link
                className="botao secundario"
                to={`/admin/empreendimentos/${empreendimentoId}`}
            >
                Voltar aos detalhes
            </Link>
        </header>
    );
}
