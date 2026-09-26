import type { EstruturaLocal } from "@constructo/shared";
import { useEffect } from "react";
import { useFetcher } from "react-router-dom";

import type { LocalRaizActionData } from "../../../features/empreendimentos/empreendimentos.action";

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
            className="location-form"
            aria-label={`Editar ${local.nome}`}
            aria-busy={salvando}
            noValidate
        >
            <input type="hidden" name="intencao" value="editar-local" />
            <input type="hidden" name="local_id" value={local.id} />
            <div className="campo">
                <label htmlFor={`editar-local-nome-${local.id}`}>
                    Nome <span aria-hidden="true">*</span>
                </label>
                <input
                    id={`editar-local-nome-${local.id}`}
                    name="nome"
                    type="text"
                    maxLength={200}
                    defaultValue={local.nome}
                    disabled={salvando}
                    aria-invalid={Boolean(!resposta?.ok && resposta?.campos?.nome)}
                />
                {!resposta?.ok && resposta?.campos?.nome && (
                    <span role="alert">{resposta.campos.nome}</span>
                )}
            </div>
            <div className="campo">
                <label htmlFor={`editar-local-ordem-${local.id}`}>
                    Ordem <span aria-hidden="true">*</span>
                </label>
                <input
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
                    <span role="alert">{resposta.campos.ordem}</span>
                )}
            </div>
            {!resposta?.ok && resposta?.erro && (
                <p className="empreendimento-form__erro" role="alert">{resposta.erro}</p>
            )}
            <div className="location-form__acoes">
                <button className="botao secundario" type="button" onClick={onCancel} disabled={salvando}>
                    Cancelar
                </button>
                <button className="botao primario" type="submit" disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
            </div>
        </fetcher.Form>
    );
}
