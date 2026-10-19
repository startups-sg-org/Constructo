import type { EstruturaLocal } from "@constructo/shared";
import { useEffect } from "react";
import { useFetcher } from "react-router-dom";

import type { LocalRaizActionData } from "../../../features/empreendimentos/empreendimentos.action";

const estilos = {
    formulario: "grid gap-4 border-t border-border-muted pt-4",
    campos: "grid gap-3",
    campo: "grid min-w-0 gap-1.5",
    rotulo: "font-label-sm text-label-sm text-foreground",
    entrada: "ds-dark-field bg-surface-muted! text-foreground!",
    erroCampo: "m-0 font-body-sm text-body-sm text-error",
    erroGeral: "m-0 rounded-md border border-error/40 bg-[#93000a]/20 px-3 py-2 font-body-sm text-body-sm text-error",
    acoes: "grid grid-cols-2 gap-2 border-t border-border-muted pt-3",
    botaoSecundario: "ds-focus-ring-offset inline-flex min-h-9 items-center justify-center rounded-md border border-border-control bg-surface-hover px-3 font-label-sm text-label-sm text-default-font hover:bg-border-muted disabled:cursor-not-allowed disabled:opacity-50",
    botaoPrimario: "ds-focus-ring-offset inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-action-primary bg-action-primary px-3 font-label-sm text-label-sm text-white hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
} as const;

type LocationFormProps = {
    local: EstruturaLocal;
    onCancel: () => void;
    onSaved: () => void;
};

export default function LocationForm({ local, onCancel, onSaved }: LocationFormProps) {
    const fetcher = useFetcher<LocalRaizActionData>();
    const salvando = fetcher.state !== "idle";
    const resposta = fetcher.data?.intencao === "edicao"
        && fetcher.data.localId === local.id
        ? fetcher.data
        : undefined;

    useEffect(() => {
        if (resposta?.ok) onSaved();
    }, [onSaved, resposta]);

    return (
        <fetcher.Form
            method="post"
            className={estilos.formulario}
            aria-label={`Editar ${local.nome}`}
            aria-busy={salvando}
            noValidate
        >
            <input type="hidden" name="intencao" value="editar-local" />
            <input type="hidden" name="local_id" value={local.id} />
            <div className={estilos.campos}>
                <div className={estilos.campo}>
                    <label className={estilos.rotulo} htmlFor={`editar-local-nome-${local.id}`}>
                        Nome <span aria-hidden="true">*</span>
                    </label>
                    <input
                        className={estilos.entrada}
                        id={`editar-local-nome-${local.id}`}
                        name="nome"
                        type="text"
                        maxLength={200}
                        defaultValue={local.nome}
                        disabled={salvando}
                        aria-invalid={Boolean(!resposta?.ok && resposta?.campos?.nome)}
                    />
                    {!resposta?.ok && resposta?.campos?.nome && (
                        <p className={estilos.erroCampo} role="alert">{resposta.campos.nome}</p>
                    )}
                </div>
                <div className={estilos.campo}>
                    <label className={estilos.rotulo} htmlFor={`editar-local-ordem-${local.id}`}>
                        Ordem <span aria-hidden="true">*</span>
                    </label>
                    <input
                        className={estilos.entrada}
                        id={`editar-local-ordem-${local.id}`}
                        name="ordem"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={local.ordem}
                        disabled={salvando}
                        aria-invalid={Boolean(!resposta?.ok && resposta?.campos?.ordem)}
                    />
                    {!resposta?.ok && resposta?.campos?.ordem && (
                        <p className={estilos.erroCampo} role="alert">{resposta.campos.ordem}</p>
                    )}
                </div>
            </div>
            {!resposta?.ok && resposta?.erro && !resposta.campos && (
                <p className={estilos.erroGeral} role="alert">{resposta.erro}</p>
            )}
            <div className={estilos.acoes}>
                <button className={estilos.botaoSecundario} type="button" onClick={onCancel} disabled={salvando}>
                    Cancelar
                </button>
                <button className={estilos.botaoPrimario} type="submit" disabled={salvando}>
                    <i className="bi bi-check-lg" aria-hidden="true" />
                    {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
            </div>
        </fetcher.Form>
    );
}
