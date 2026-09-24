import type { SVGProps } from "react";
import CardIndicador from "../../componentes/CardIndicador/CardIndicador";
import "./ResumoPainel.css";

type IconeProps = SVGProps<SVGSVGElement>;

const indicadores = [
    {
        titulo: "Obras",
        valor: 12,
        descricao: "Obras cadastradas",
        icone: <IconeObras />
    },
    {
        titulo: "Usuários",
        valor: 24,
        descricao: "Usuários com acesso",
        icone: <IconeUsuarios />
    },
    {
        titulo: "Contratos",
        valor: 8,
        icone: <IconeContratos />
    },
    {
        titulo: "Medições",
        valor: 38,
        descricao: "Medições registradas",
        icone: <IconeMedicoes />
    }
];

export default function ResumoPainel() {
    return (
        <section className="resumo-painel" aria-label="Resumo dos indicadores">
            {indicadores.map((indicador) => (
                <CardIndicador key={indicador.titulo} {...indicador} />
            ))}
        </section>
    );
}

function IconeObras(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M3 21h18M5 21V9l7-4v16M12 10h7v11" />
            <path d="M8 12h1M8 16h1M15 13h1M15 17h1M10 5V3h4v4" />
        </svg>
    );
}

function IconeUsuarios(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function IconeContratos(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
    );
}

function IconeMedicoes(props: IconeProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M4 19V9M10 19V5M16 19v-7M22 19V2M2 19h20" />
        </svg>
    );
}
