import type { EstruturaLocal, LocalObra } from "@constructo/shared";
import { useEffect } from "react";
import { useFetcher } from "react-router-dom";

import type { LocalRaizActionData } from "../../../features/empreendimentos/empreendimentos.action";

export type TipoCriacaoLocal = "raiz" | "pavimento" | "unidade";

type LocationCreationFormProps = {
    tipo: TipoCriacaoLocal;
    parent?: EstruturaLocal;
    onCancel: () => void;
    onCreated: (local: LocalObra, tipo: TipoCriacaoLocal, parentId?: number) => void;
};

const configuracoes = {
    raiz: {
        titulo: "Adicionar torre ou bloco",
        descricao: "Crie o primeiro nível da estrutura física do empreendimento.",
        intencao: "adicionar-raiz",
        botao: "Adicionar torre/bloco",
    },
    pavimento: {
        titulo: "Adicionar pavimento",
        descricao: "Cadastre um pavimento no local selecionado.",
        intencao: "adicionar-pavimento",
        botao: "Adicionar pavimento",
    },
    unidade: {
        titulo: "Adicionar unidade",
        descricao: "Cadastre uma unidade no pavimento selecionado.",
        intencao: "adicionar-unidade",
        botao: "Adicionar unidade",
    },
} as const;

const estilos = {
    painel: "grid gap-4 rounded-md border border-border-muted bg-surface-muted p-4",
    cabecalho: "grid gap-1",
    titulo: "m-0 font-headline-sm text-headline-sm font-semibold text-foreground-strong",
    descricao: "m-0 font-body-sm text-body-sm text-foreground-muted",
    formulario: "grid gap-4",
    campos: "grid gap-3 sm:grid-cols-2",
    campo: "grid min-w-0 gap-1.5",
    campoLargo: "grid min-w-0 gap-1.5 sm:col-span-2",
    rotulo: "font-label-sm text-label-sm text-foreground",
    entrada: "ds-dark-field bg-surface! text-foreground!",
    erroCampo: "m-0 font-body-sm text-body-sm text-error",
    erroGeral: "m-0 rounded-md border border-error/40 bg-[#93000a]/20 px-3 py-2 font-body-sm text-body-sm text-error",
    acoes: "flex flex-wrap justify-end gap-2 border-t border-border-muted pt-3",
    botaoSecundario: "ds-focus-ring-offset inline-flex min-h-9 items-center justify-center rounded-md border border-border-control bg-surface-hover px-3 font-label-sm text-label-sm text-default-font hover:bg-border-muted disabled:cursor-not-allowed disabled:opacity-50",
    botaoPrimario: "ds-focus-ring-offset inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-action-primary bg-action-primary px-3 font-label-sm text-label-sm text-white hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
} as const;

export default function LocationCreationForm({
    tipo,
    parent,
    onCancel,
    onCreated,
}: LocationCreationFormProps) {
    const fetcher = useFetcher<LocalRaizActionData>();
    const configuracao = configuracoes[tipo];
    const enviando = fetcher.state !== "idle";
    const resposta = fetcher.data?.intencao === tipo
        && (tipo === "raiz" || fetcher.data.parentId === parent?.id)
        ? fetcher.data
        : undefined;
    const nomeFormulario = tipo === "raiz"
        ? "Adicionar torre ou bloco"
        : `${configuracao.titulo} em ${parent?.nome ?? "local selecionado"}`;

    useEffect(() => {
        if (resposta?.ok) onCreated(resposta.local, tipo, parent?.id);
    }, [onCreated, parent?.id, resposta, tipo]);

    return (
        <section className={estilos.painel} aria-labelledby={`criar-local-${tipo}-titulo`}>
            <header className={estilos.cabecalho}>
                <h3 className={estilos.titulo} id={`criar-local-${tipo}-titulo`}>{configuracao.titulo}</h3>
                <p className={estilos.descricao}>
                    {configuracao.descricao}{parent ? ` Local superior: ${parent.nome}.` : ""}
                </p>
            </header>

            <fetcher.Form
                className={estilos.formulario}
                method="post"
                aria-label={nomeFormulario}
                aria-busy={enviando}
                noValidate
            >
                <input type="hidden" name="intencao" value={configuracao.intencao} />
                {parent && <input type="hidden" name="parent_id" value={parent.id} />}

                <div className={estilos.campos}>
                    <div className={tipo === "raiz" ? estilos.campoLargo : estilos.campo}>
                        <label className={estilos.rotulo} htmlFor={`novo-local-${tipo}-nome`}>
                            Nome <span aria-hidden="true">*</span>
                        </label>
                        <input
                            className={estilos.entrada}
                            id={`novo-local-${tipo}-nome`}
                            name="nome"
                            type="text"
                            maxLength={200}
                            disabled={enviando}
                            aria-invalid={Boolean(!resposta?.ok && resposta?.campos?.nome)}
                        />
                        {!resposta?.ok && resposta?.campos?.nome && (
                            <p className={estilos.erroCampo} role="alert">{resposta.campos.nome}</p>
                        )}
                    </div>

                    {tipo === "raiz" && (
                        <div className={estilos.campo}>
                            <label className={estilos.rotulo} htmlFor="novo-local-raiz-tipo">
                                Tipo <span aria-hidden="true">*</span>
                            </label>
                            <select
                                className={estilos.entrada}
                                id="novo-local-raiz-tipo"
                                name="tipo"
                                defaultValue="TORRE"
                                disabled={enviando}
                                aria-invalid={Boolean(!resposta?.ok && resposta?.campos?.tipo)}
                            >
                                <option value="TORRE">Torre</option>
                                <option value="BLOCO">Bloco</option>
                            </select>
                            {!resposta?.ok && resposta?.campos?.tipo && (
                                <p className={estilos.erroCampo} role="alert">{resposta.campos.tipo}</p>
                            )}
                        </div>
                    )}

                    <div className={estilos.campo}>
                        <label className={estilos.rotulo} htmlFor={`novo-local-${tipo}-ordem`}>
                            Ordem <span aria-hidden="true">*</span>
                        </label>
                        <input
                            className={estilos.entrada}
                            id={`novo-local-${tipo}-ordem`}
                            name="ordem"
                            type="number"
                            min="0"
                            step="1"
                            defaultValue="0"
                            disabled={enviando}
                            aria-invalid={Boolean(!resposta?.ok && resposta?.campos?.ordem)}
                        />
                        {!resposta?.ok && resposta?.campos?.ordem && (
                            <p className={estilos.erroCampo} role="alert">{resposta.campos.ordem}</p>
                        )}
                    </div>
                </div>

                {!resposta?.ok && resposta?.erro && (
                    <p className={estilos.erroGeral} role="alert">{resposta.erro}</p>
                )}

                <div className={estilos.acoes}>
                    <button className={estilos.botaoSecundario} type="button" disabled={enviando} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className={estilos.botaoPrimario} type="submit" disabled={enviando}>
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                        {enviando ? "Adicionando..." : configuracao.botao}
                    </button>
                </div>
            </fetcher.Form>
        </section>
    );
}
