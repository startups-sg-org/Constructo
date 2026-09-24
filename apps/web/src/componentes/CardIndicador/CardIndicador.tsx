import type { ReactNode } from "react";
import "./CardIndicador.css";

export type CardIndicadorProps = {
    titulo: string;
    valor: ReactNode;
    icone: ReactNode;
    descricao?: string;
};

export default function CardIndicador({
    titulo,
    valor,
    icone,
    descricao
}: CardIndicadorProps) {
    return (
        <article className="card-indicador">
            <div className="card-indicador__icone" aria-hidden="true">
                {icone}
            </div>

            <div className="card-indicador__conteudo">
                <h2 className="card-indicador__titulo">{titulo}</h2>
                <p className="card-indicador__valor">{valor}</p>
                {descricao && (
                    <p className="card-indicador__descricao">{descricao}</p>
                )}
            </div>
        </article>
    );
}
