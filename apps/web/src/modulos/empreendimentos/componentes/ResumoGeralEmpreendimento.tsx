import type { Empreendimento } from "@constructo/shared";

import { formatarDataEmpreendimento } from "./empreendimentoFormatters";

type ResumoGeralEmpreendimentoProps = {
    empreendimento: Empreendimento;
};

const estilos = {
    painel: "ds-panel grid gap-3 p-4",
    cabecalho: "flex items-center justify-between gap-3 border-b border-border-muted pb-3",
    titulo: "flex items-center gap-2 text-[15px] font-semibold leading-5 text-foreground-strong",
    rotulo: "font-overline text-overline uppercase text-foreground-muted",
    lista: "grid gap-3",
    item: "flex min-w-0 items-start gap-3 rounded-md bg-surface-muted px-3 py-3",
    icone: "grid h-8 w-8 flex-none place-items-center rounded-md border border-border-control bg-surface-hover text-[15px] text-foreground",
    termo: "text-[12px] leading-4 text-foreground-muted",
    valor: "mt-1 break-words text-[14px] font-medium leading-5 text-foreground-strong",
} as const;

export default function ResumoGeralEmpreendimento({ empreendimento }: ResumoGeralEmpreendimentoProps) {
    return (
        <section className={estilos.painel} aria-labelledby="sobre-empreendimento-titulo">
            <header className={estilos.cabecalho}>
                <h2 className={estilos.titulo} id="sobre-empreendimento-titulo">
                    <i className="bi bi-info-circle" aria-hidden="true" />
                    Informações gerais
                </h2>
                <span className={estilos.rotulo}>Dados da obra</span>
            </header>

            <dl className={estilos.lista}>
                <ItemInformacao icone="bi-geo-alt" termo="Endereço">
                    {empreendimento.endereco || "Endereço não informado"}
                </ItemInformacao>
                <ItemInformacao icone="bi-card-text" termo="Descrição">
                    {empreendimento.descricao || "Descrição não informada"}
                </ItemInformacao>
                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                    <ItemInformacao icone="bi-calendar-plus" termo="Data de criação">
                        {formatarDataEmpreendimento(empreendimento.criado_em)}
                    </ItemInformacao>
                    <ItemInformacao icone="bi-clock-history" termo="Atualizado em">
                        {formatarDataEmpreendimento(empreendimento.atualizado_em)}
                    </ItemInformacao>
                </div>
            </dl>
        </section>
    );
}

function ItemInformacao({
    icone,
    termo,
    children,
}: {
    icone: string;
    termo: string;
    children: string;
}) {
    return (
        <div className={estilos.item}>
            <span className={estilos.icone} aria-hidden="true">
                <i className={`bi ${icone}`} />
            </span>
            <div className="min-w-0 flex-1">
                <dt className={estilos.termo}>{termo}</dt>
                <dd className={estilos.valor}>{children}</dd>
            </div>
        </div>
    );
}
