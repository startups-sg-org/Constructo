import { useLoaderData } from "react-router-dom";

import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";
import type { carregarContratosEmpreendimento } from "../../../features/contratos/contratos.loader";

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export default function ContratosEmpreendimento() {
    const { contratos } = useLoaderData<typeof carregarContratosEmpreendimento>();

    if (contratos.length === 0) {
        return (
            <EstadoVazio
                titulo="Nenhum contrato vinculado"
                descricao="Os contratos vinculados a este empreendimento aparecerão aqui."
            />
        );
    }

    return (
        <section className="grid gap-4" aria-labelledby="contratos-empreendimento-titulo">
            <header className="border-b border-border-muted pb-3">
                <h2 className="text-[22px] font-semibold leading-7 text-foreground-strong" id="contratos-empreendimento-titulo">
                    Contratos do empreendimento
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-foreground-muted">
                    Relações contratuais cadastradas para esta obra.
                </p>
            </header>
            <ul className="grid gap-3">
                {contratos.map((contrato) => (
                    <li className="ds-panel grid gap-3 p-4" key={contrato.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="break-words text-[16px] font-semibold leading-6 text-foreground-strong">{contrato.objeto}</h3>
                                <p className="mt-1 break-words text-[13px] leading-5 text-foreground-muted">{contrato.descricao}</p>
                            </div>
                            <span className="ds-status ds-status--neutro capitalize">{contrato.status}</span>
                        </div>
                        <dl className="grid gap-3 border-t border-border-muted pt-3 sm:grid-cols-3">
                            <ItemContrato rotulo="Contratante" valor={contrato.contratante.nome_fantasia} />
                            <ItemContrato rotulo="Contratada" valor={contrato.contratado.nome_fantasia} />
                            <ItemContrato rotulo="Valor total" valor={formatoMoeda.format(Number(contrato.valor_total))} />
                        </dl>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function ItemContrato({ rotulo, valor }: { rotulo: string; valor: string }) {
    return (
        <div className="min-w-0">
            <dt className="font-overline text-overline uppercase text-foreground-muted">{rotulo}</dt>
            <dd className="mt-1 break-words text-[13px] font-medium leading-5 text-foreground-strong">{valor}</dd>
        </div>
    );
}
