import type { SVGProps } from "react";
import SummaryCard from "../CardIndicador/CardIndicador";
import "./DashboardSummary.css";

type IconProps = SVGProps<SVGSVGElement>;

export type DashboardSummaryData = {
    quantidadeDeObras: number;
    obrasEmAndamento: number;
    usuariosCadastrados: number;
    medicoesRealizadas: number;
};

export type DashboardSummaryProps = {
    dados?: Partial<DashboardSummaryData>;
};

const dadosResumoMock: Omit<DashboardSummaryData, "usuariosCadastrados"> = {
    quantidadeDeObras: 12,
    obrasEmAndamento: 7,
    medicoesRealizadas: 38
};

export default function DashboardSummary({
    dados
}: DashboardSummaryProps) {
    const dadosDoResumo = { ...dadosResumoMock, ...dados };

    const indicadores = [
        {
            titulo: "Quantidade de obras",
            valor: dadosDoResumo.quantidadeDeObras,
            descricao: "Obras cadastradas",
            icone: <IconeObras />
        },
        {
            titulo: "Obras em andamento",
            valor: dadosDoResumo.obrasEmAndamento,
            descricao: "Obras em execução",
            icone: <IconeEmAndamento />
        },
        {
            titulo: "Usuários cadastrados",
            valor: dadosDoResumo.usuariosCadastrados ?? "—",
            descricao: "Usuários com acesso",
            icone: <IconeUsuarios />
        },
        {
            titulo: "Medições realizadas",
            valor: dadosDoResumo.medicoesRealizadas,
            descricao: "Medições registradas",
            icone: <IconeMedicoes />
        }
    ];

    return (
        <section className="dashboard-summary" aria-label="Resumo dos indicadores">
            {indicadores.map((indicador) => (
                <SummaryCard key={indicador.titulo} {...indicador} />
            ))}
        </section>
    );
}

function IconeObras(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M3 21h18M5 21V9l7-4v16M12 10h7v11" />
            <path d="M8 12h1M8 16h1M15 13h1M15 17h1M10 5V3h4v4" />
        </svg>
    );
}

function IconeEmAndamento(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M4 21h16M6 21v-5h12v5M8 16V9h8v7M10 9V5h4v4" />
            <path d="M3 12h18M12 2v3" />
        </svg>
    );
}

function IconeUsuarios(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function IconeMedicoes(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M4 19V9M10 19V5M16 19v-7M22 19V2M2 19h20" />
        </svg>
    );
}
