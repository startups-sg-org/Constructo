import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";

type AbaIndisponivelProps = {
    titulo: string;
    descricao: string;
};

export default function AbaIndisponivel({ titulo, descricao }: AbaIndisponivelProps) {
    return (
        <section aria-label={titulo}>
            <EstadoVazio titulo={titulo} descricao={descricao} />
        </section>
    );
}
