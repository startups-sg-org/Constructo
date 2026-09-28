import type { Empreendimento } from "@constructo/shared";
import { Link } from "react-router-dom";

import BadgeStatus from "../../../componentes/BadgeStatus/BadgeStatus";
import { formatarDataEmpreendimento, obterRotuloStatus, obterTomStatus } from "./empreendimentoFormatters";

type CardEmpreendimentoProps = {
    empreendimento: Empreendimento;
};

export default function CardEmpreendimento({ empreendimento }: CardEmpreendimentoProps) {
    return (
        <article className="card-empreendimento superficie-painel">
            <header className="card-empreendimento__cabecalho">
                <div>
                    <p className="card-empreendimento__legenda">Empreendimento</p>
                    <h3>{empreendimento.nome}</h3>
                </div>
                <BadgeStatus tom={obterTomStatus(empreendimento.status)}>
                    {obterRotuloStatus(empreendimento.status)}
                </BadgeStatus>
            </header>

            <dl className="card-empreendimento__dados lista-dados">
                <div>
                    <dt>Endereço</dt>
                    <dd>{empreendimento.endereco || "Endereço não informado"}</dd>
                </div>
                <div>
                    <dt>Descrição</dt>
                    <dd>{empreendimento.descricao || "Descrição não informada"}</dd>
                </div>
                <div>
                    <dt>Criado em</dt>
                    <dd>{formatarDataEmpreendimento(empreendimento.criado_em)}</dd>
                </div>
            </dl>

            <footer className="card-empreendimento__acoes barra-acoes">
                <Link
                    className="botao secundario"
                    to={`/admin/empreendimentos/${empreendimento.id}`}
                >
                    Visualizar
                </Link>
                <Link
                    className="botao primario"
                    to={`/admin/empreendimentos/${empreendimento.id}/editar`}
                >
                    Editar
                </Link>
                <Link
                    className="botao secundario"
                    to={`/admin/empreendimentos/${empreendimento.id}/estrutura`}
                >
                    Estrutura
                </Link>
                <Link
                    className="botao secundario"
                    to={`/admin/empreendimentos/${empreendimento.id}`}
                >
                    Taxonomia
                </Link>
            </footer>
        </article>
    );
}
