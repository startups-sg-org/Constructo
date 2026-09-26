import { Link, useLoaderData } from "react-router-dom";

import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import "./ListaEmpreendimentos.css";

export default function EstruturaFisicaEmpreendimento() {
    const empreendimento = useLoaderData<typeof carregarEmpreendimento>();

    return (
        <section
            className="detalhes-empreendimento"
            aria-labelledby="estrutura-fisica-empreendimento-titulo"
        >
            <span className="subtitulo">Empreendimento</span>
            <h2 id="estrutura-fisica-empreendimento-titulo">{empreendimento.nome}</h2>
            <p>
                A estrutura física deste empreendimento será organizada a partir desta área.
            </p>
            <Link
                className="botao secundario"
                to={`/admin/empreendimentos/${empreendimento.id}`}
            >
                Voltar aos detalhes
            </Link>
        </section>
    );
}
