import { useLoaderData } from "react-router-dom";

import { carregarEmpreendimentos } from "../../../features/empreendimentos/empreendimentos.loader";
import CardEmpreendimento from "./CardEmpreendimento";
import "./ListaEmpreendimentos.css";

export default function ListaEmpreendimentos() {
    const empreendimentos = useLoaderData<typeof carregarEmpreendimentos>();

    return (
        <section className="lista-empreendimentos" aria-labelledby="lista-empreendimentos-titulo">
            <header className="lista-empreendimentos__cabecalho">
                <div>
                    <span className="subtitulo">Obras disponíveis</span>
                    <h2 id="lista-empreendimentos-titulo">Seus empreendimentos</h2>
                </div>
                {empreendimentos.length > 0 && (
                    <p>
                        {empreendimentos.length}{" "}
                        {empreendimentos.length === 1 ? "empreendimento" : "empreendimentos"}
                    </p>
                )}
            </header>

            {empreendimentos.length === 0 ? (
                <div className="lista-empreendimentos__vazia">
                    <span aria-hidden="true">🏗️</span>
                    <div>
                        <h3>Nenhum empreendimento cadastrado</h3>
                        <p>Use o formulário abaixo para adicionar a primeira obra.</p>
                    </div>
                </div>
            ) : (
                <div className="lista-empreendimentos__grade">
                    {empreendimentos.map((empreendimento) => (
                        <CardEmpreendimento
                            key={empreendimento.id}
                            empreendimento={empreendimento}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
