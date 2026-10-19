import { useCallback, useState } from "react";

import type { LocalSelecionado } from "../../../features/empreendimentos/localSelecionado";
import LocationForm from "./LocationForm";

const rotulosTipo = {
    TORRE: "Torre",
    BLOCO: "Bloco",
    PAVIMENTO: "Pavimento",
    UNIDADE: "Unidade",
} as const;

const iconesTipo = {
    TORRE: "bi-buildings",
    BLOCO: "bi-building",
    PAVIMENTO: "bi-layers",
    UNIDADE: "bi-door-open",
} as const;

const estilos = {
    vazio: "grid min-h-48 place-items-center gap-3 rounded-md border border-dashed border-border-muted px-4 py-8 text-center",
    iconeVazio: "grid h-10 w-10 place-items-center rounded-md bg-surface-hover text-lg text-accent",
    tituloVazio: "m-0 font-headline-sm text-headline-sm font-semibold text-foreground-strong",
    descricaoVazio: "m-0 max-w-56 font-body-sm text-body-sm text-foreground-muted",
    detalhes: "grid min-w-0 gap-4",
    cabecalho: "flex min-w-0 items-start gap-3",
    iconeLocal: "grid h-10 w-10 flex-none place-items-center rounded-md border border-border-control bg-surface-muted text-lg text-accent",
    textosCabecalho: "min-w-0 flex-1",
    apoio: "m-0 font-label-sm text-label-sm uppercase tracking-wide text-foreground-muted",
    titulo: "m-0 truncate font-headline-sm text-headline-sm font-semibold text-foreground-strong",
    tipo: "ds-status ds-status--informativo mt-2",
    dados: "m-0 grid divide-y divide-border-muted border-y border-border-muted",
    dado: "grid min-w-0 gap-1 py-3 first:pt-3 last:pb-3",
    termo: "font-label-sm text-label-sm uppercase tracking-wide text-foreground-muted",
    valor: "m-0 [overflow-wrap:anywhere] font-body-md text-body-md font-medium text-default-font",
    caminho: "grid gap-2",
    tituloSecao: "m-0 font-label-sm text-label-sm uppercase tracking-wide text-foreground-muted",
    listaCaminho: "m-0 flex min-w-0 list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 font-body-sm text-body-sm text-foreground-muted",
    itemCaminho: "flex min-w-0 items-center gap-1.5",
    nomeCaminho: "max-w-44 truncate",
    editar: "ds-focus-ring-offset inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-border-control bg-surface-hover px-3 font-label-sm text-label-sm text-default-font hover:bg-border-muted hover:text-foreground-strong",
} as const;

type LocationDetailsProps = {
    selecao: LocalSelecionado | null;
    empreendimentoNome: string;
};

function rotuloFilhos(quantidade: number): string {
    return quantidade === 1 ? "1 local" : `${quantidade} locais`;
}

export default function LocationDetails({ selecao, empreendimentoNome }: LocationDetailsProps) {
    const [editando, setEditando] = useState(false);
    const concluirEdicao = useCallback(() => setEditando(false), []);

    if (!selecao) {
        return (
            <div className={estilos.vazio}>
                <span className={estilos.iconeVazio} aria-hidden="true">
                    <i className="bi bi-cursor" />
                </span>
                <div className="grid gap-1">
                    <h3 className={estilos.tituloVazio}>Selecione um local</h3>
                    <p className={estilos.descricaoVazio}>
                        Escolha uma torre, bloco, pavimento ou unidade para consultar os detalhes.
                    </p>
                </div>
            </div>
        );
    }

    const localSuperior = selecao.caminho.at(-2)?.nome ?? empreendimentoNome;

    return (
        <aside className={estilos.detalhes} aria-labelledby="detalhes-local-titulo">
            <header className={estilos.cabecalho}>
                <span className={estilos.iconeLocal} aria-hidden="true">
                    <i className={`bi ${iconesTipo[selecao.local.tipo]}`} />
                </span>
                <div className={estilos.textosCabecalho}>
                    <p className={estilos.apoio}>Local selecionado</p>
                    <h3 className={estilos.titulo} id="detalhes-local-titulo" title={selecao.local.nome}>
                        {selecao.local.nome}
                    </h3>
                    <span className={estilos.tipo}>{rotulosTipo[selecao.local.tipo]}</span>
                </div>
            </header>

            {editando ? (
                <LocationForm
                    key={selecao.local.id}
                    local={selecao.local}
                    onCancel={() => setEditando(false)}
                    onSaved={concluirEdicao}
                />
            ) : (
                <>
                    <dl className={estilos.dados}>
                        <div className={estilos.dado}>
                            <dt className={estilos.termo}>Nome</dt>
                            <dd className={estilos.valor}>{selecao.local.nome}</dd>
                        </div>
                        <div className={estilos.dado}>
                            <dt className={estilos.termo}>Tipo</dt>
                            <dd className={estilos.valor}>{rotulosTipo[selecao.local.tipo]}</dd>
                        </div>
                        <div className={estilos.dado}>
                            <dt className={estilos.termo}>Local superior</dt>
                            <dd className={estilos.valor}>{localSuperior}</dd>
                        </div>
                        <div className={estilos.dado}>
                            <dt className={estilos.termo}>Ordem</dt>
                            <dd className={estilos.valor}>{selecao.local.ordem}</dd>
                        </div>
                        <div className={estilos.dado}>
                            <dt className={estilos.termo}>Locais filhos</dt>
                            <dd className={estilos.valor}>{rotuloFilhos(selecao.local.filhos.length)}</dd>
                        </div>
                    </dl>

                    <section className={estilos.caminho} aria-labelledby="caminho-local-titulo">
                        <h4 className={estilos.tituloSecao} id="caminho-local-titulo">Caminho hierárquico</h4>
                        <ol className={estilos.listaCaminho} aria-label="Caminho hierárquico">
                            <li className={estilos.itemCaminho}>
                                <span className={estilos.nomeCaminho}>{empreendimentoNome}</span>
                            </li>
                            {selecao.caminho.map((local) => (
                                <li className={estilos.itemCaminho} key={local.id}>
                                    <i className="bi bi-chevron-right text-[10px] text-foreground-muted" aria-hidden="true" />
                                    <span className={estilos.nomeCaminho} title={local.nome}>{local.nome}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <button className={estilos.editar} type="button" onClick={() => setEditando(true)}>
                        <i className="bi bi-pencil" aria-hidden="true" />
                        Editar local
                    </button>
                </>
            )}
        </aside>
    );
}
