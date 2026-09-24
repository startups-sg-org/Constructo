import type { ReactNode } from "react";
import CabecalhoPagina from "../../componentes/CabecalhoPagina/CabecalhoPagina";

type PaginaPainelProps = {
    titulo: string;
    subtitulo?: string;
    acao?: ReactNode;
    children?: ReactNode;
};

export default function PaginaPainel({
    titulo,
    subtitulo,
    acao,
    children
}: PaginaPainelProps) {
    return (
        <section className="pagina-painel">
            <CabecalhoPagina titulo={titulo} subtitulo={subtitulo} acao={acao} />
            {children}
        </section>
    );
}
