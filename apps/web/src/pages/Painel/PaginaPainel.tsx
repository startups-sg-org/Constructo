import type { ReactNode } from "react";
import CabecalhoPagina from "../../componentes/CabecalhoPagina/CabecalhoPagina";
import { cn } from "../../utils/classes";

type PaginaPainelProps = {
    titulo?: string;
    subtitulo?: string;
    acao?: ReactNode;
    children?: ReactNode;
    className?: string;
};

export default function PaginaPainel({
    titulo,
    subtitulo,
    acao,
    children,
    className,
}: PaginaPainelProps) {
    return (
        <section className={cn("pagina-painel", className)}>
            {(titulo || subtitulo || acao) && (
                <CabecalhoPagina titulo={titulo} subtitulo={subtitulo} acao={acao} />
            )}
            {children}
        </section>
    );
}
