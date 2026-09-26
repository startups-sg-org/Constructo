import type { Empreendimento } from "@constructo/shared";
import { Link } from "react-router-dom";

import { formatarDataEmpreendimento, obterRotuloStatus } from "./empreendimentoFormatters";

type CardEmpreendimentoProps = {
    empreendimento: Empreendimento;
};

export default function CardEmpreendimento({ empreendimento }: CardEmpreendimentoProps) {
    return (
        <article className="card-empreendimento">
            <header className="card-empreendimento__cabecalho">
                <div>
                    <p className="card-empreendimento__legenda">Empreendimento</p>
                    <h3>{empreendimento.nome}</h3>
                </div>
                <span
                    className={`card-empreendimento__status card-empreendimento__status--${empreendimento.status.toLowerCase()}`}
                >
                    {obterRotuloStatus(empreendimento.status)}
                </span>
            </header>

            <dl className="card-empreendimento__dados">
                <div>
                    <dt>Endereço</dt>
                    <dd>{empreendimento.endereco || "Endereço não informado"}</dd>
                </div>
                <div>
                    <dt>Criado em</dt>
                    <dd>{formatarDataEmpreendimento(empreendimento.criado_em)}</dd>
                </div>
            </dl>

            <footer className="card-empreendimento__acoes">
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
            </footer>
        </article>
    );
}
