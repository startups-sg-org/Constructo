import type { ReactNode } from "react";
import "./CabecalhoPagina.css";

export type CabecalhoPaginaProps = {
    titulo: string;
    subtitulo?: string;
    acao?: ReactNode;
};

export default function CabecalhoPagina({
    titulo,
    subtitulo,
    acao
}: CabecalhoPaginaProps) {
    return (
        <header className="cabecalho-pagina">
            <div className="cabecalho-pagina__textos">
                <h1 className="cabecalho-pagina__titulo">{titulo}</h1>
                {subtitulo && (
                    <p className="cabecalho-pagina__subtitulo">{subtitulo}</p>
                )}
            </div>
            {acao && <div className="cabecalho-pagina__acao">{acao}</div>}
        </header>
    );
}
