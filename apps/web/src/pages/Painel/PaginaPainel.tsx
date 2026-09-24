import type { ReactNode } from "react";

type PaginaPainelProps = {
    titulo: string;
    descricao: string;
    children?: ReactNode;
};

export default function PaginaPainel({ titulo, descricao, children }: PaginaPainelProps) {
    return (
        <section className="pagina-painel">
            <span className="pagina-painel__contexto">Painel administrativo</span>
            <h1>{titulo}</h1>
            <p>{descricao}</p>
            {children}
        </section>
    );
}
