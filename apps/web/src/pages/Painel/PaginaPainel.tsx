type PaginaPainelProps = {
    titulo: string;
    descricao: string;
};

export default function PaginaPainel({ titulo, descricao }: PaginaPainelProps) {
    return (
        <section className="pagina-painel">
            <span className="pagina-painel__contexto">Painel administrativo</span>
            <h1>{titulo}</h1>
            <p>{descricao}</p>
        </section>
    );
}
