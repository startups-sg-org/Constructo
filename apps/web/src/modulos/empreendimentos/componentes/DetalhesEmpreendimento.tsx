import { Link, useLoaderData } from "react-router-dom";

import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import { formatarDataEmpreendimento, obterRotuloStatus } from "./empreendimentoFormatters";
import "./ListaEmpreendimentos.css";

export default function DetalhesEmpreendimento() {
    const empreendimento = useLoaderData<typeof carregarEmpreendimento>();

    return (
        <article className="detalhes-empreendimento">
            <header className="detalhes-empreendimento__cabecalho">
                <div>
                    <span className="subtitulo">Dados da obra</span>
                    <h2>{empreendimento.nome}</h2>
                </div>
                <span
                    className={`card-empreendimento__status card-empreendimento__status--${empreendimento.status.toLowerCase()}`}
                >
                    {obterRotuloStatus(empreendimento.status)}
                </span>
            </header>

            <dl className="detalhes-empreendimento__dados">
                <div>
                    <dt>Endereço</dt>
                    <dd>{empreendimento.endereco || "Endereço não informado"}</dd>
                </div>
                <div>
                    <dt>Data de criação</dt>
                    <dd>{formatarDataEmpreendimento(empreendimento.criado_em)}</dd>
                </div>
                <div>
                    <dt>Data de atualização</dt>
                    <dd>{formatarDataEmpreendimento(empreendimento.atualizado_em)}</dd>
                </div>
                <div className="detalhes-empreendimento__descricao">
                    <dt>Descrição</dt>
                    <dd>{empreendimento.descricao || "Descrição não informada"}</dd>
                </div>
            </dl>

            <footer className="detalhes-empreendimento__acoes">
                <Link className="botao secundario" to="/admin/obras">Voltar à listagem</Link>
                <Link className="botao secundario" to="estrutura">
                    Gerenciar estrutura física
                </Link>
                <Link className="botao primario" to="editar">Editar empreendimento</Link>
            </footer>
        </article>
    );
}
