import type { ReactNode } from "react";

type CabecalhoSecaoProps = {
    etiqueta?: string;
    titulo: string;
    tituloId?: string;
    descricao?: ReactNode;
    complemento?: ReactNode;
    nivel?: 2 | 3;
    comDivisor?: boolean;
    className?: string;
};

export default function CabecalhoSecao({
    etiqueta,
    titulo,
    tituloId,
    descricao,
    complemento,
    nivel = 2,
    comDivisor = false,
    className,
}: CabecalhoSecaoProps) {
    const Titulo = nivel === 3 ? "h3" : "h2";
    const classes = [
        "cabecalho-secao",
        comDivisor && "cabecalho-secao--com-divisor",
        className,
    ].filter(Boolean).join(" ");

    return (
        <header className={classes}>
            <div className="cabecalho-secao__textos">
                {etiqueta && <span className="subtitulo">{etiqueta}</span>}
                <Titulo className="cabecalho-secao__titulo" id={tituloId}>
                    {titulo}
                </Titulo>
            </div>
            {descricao && <p className="cabecalho-secao__apoio">{descricao}</p>}
            {complemento}
        </header>
    );
}
