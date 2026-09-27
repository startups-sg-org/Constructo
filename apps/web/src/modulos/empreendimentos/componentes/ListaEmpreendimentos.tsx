import { useLoaderData } from "react-router-dom";

import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";
import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";
import { carregarEmpreendimentos } from "../../../features/empreendimentos/empreendimentos.loader";
import CardEmpreendimento from "./CardEmpreendimento";
import "./ListaEmpreendimentos.css";

export default function ListaEmpreendimentos() {
    const empreendimentos = useLoaderData<typeof carregarEmpreendimentos>();

    return (
        <section className="lista-empreendimentos" aria-labelledby="lista-empreendimentos-titulo">
            <CabecalhoSecao
                etiqueta="Obras disponíveis"
                titulo="Seus empreendimentos"
                tituloId="lista-empreendimentos-titulo"
                complemento={empreendimentos.length > 0 ? (
                    <p className="cabecalho-secao__apoio">
                        {empreendimentos.length}{" "}
                        {empreendimentos.length === 1 ? "empreendimento" : "empreendimentos"}
                    </p>
                ) : undefined}
            />

            {empreendimentos.length === 0 ? (
                <EstadoVazio
                    className="lista-empreendimentos__vazia"
                    titulo="Nenhum empreendimento cadastrado"
                    descricao="Use o formulário abaixo para adicionar a primeira obra."
                />
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
