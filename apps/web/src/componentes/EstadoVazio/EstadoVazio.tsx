import type { ReactNode } from "react";

type EstadoVazioProps = {
    titulo: string;
    descricao?: string;
    icone?: ReactNode;
    className?: string;
};

export default function EstadoVazio({
    titulo,
    descricao,
    icone = <IconeEstrutura />,
    className,
}: EstadoVazioProps) {
    const classes = ["estado-vazio", className].filter(Boolean).join(" ");

    return (
        <div className={classes}>
            <span className="estado-vazio__icone" aria-hidden="true">{icone}</span>
            <div>
                <h3>{titulo}</h3>
                {descricao && <p>{descricao}</p>}
            </div>
        </div>
    );
}

function IconeEstrutura() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 21h16M6 21V9l6-4v16M12 10h6v11" />
            <path d="M9 12h1M9 16h1M15 13h1M15 17h1" />
        </svg>
    );
}
