import { Link, useFetcher } from "react-router-dom";

import type { ProtocoloEvidenciaDados } from "../../../../features/evidencias/evidencias.service";
import type { ResultadoAcaoProtocolo } from "../../../../features/evidencias/protocolos.action";

type ProtocolFormProps = {
    baseProtocolos: string;
    dados: ProtocoloEvidenciaDados;
    protocoloId?: number;
    onChange: (dados: ProtocoloEvidenciaDados) => void;
};

const campo = "grid gap-1.5 text-[12px] font-medium text-foreground";
const controle = "ds-dark-field bg-surface-muted! text-[13px]!";

/** Formulário controlado para os dados gerais do protocolo. */
export function ProtocolForm({ baseProtocolos, dados, protocoloId, onChange }: ProtocolFormProps) {
    const fetcher = useFetcher<ResultadoAcaoProtocolo>();
    const resultado = fetcher.data;
    const erro = resultado && !resultado.ok ? resultado : undefined;
    const atualizar = (nome: keyof ProtocoloEvidenciaDados, valor: string | number | null) => onChange({ ...dados, [nome]: valor });

    return (
        <fetcher.Form method="post" className="grid gap-4" noValidate>
            <input type="hidden" name="intencao" value={protocoloId ? "editar-protocolo" : "criar-protocolo"} />
            <label className={campo}>
                Nome
                <input aria-label="Nome" className={controle} name="nome" value={dados.nome} onChange={(event) => atualizar("nome", event.target.value)} maxLength={200} required aria-invalid={Boolean(erro?.campos?.nome)} aria-describedby={erro?.campos?.nome ? "erro-protocolo-nome" : undefined} />
                {erro?.campos?.nome && <span className="text-error" id="erro-protocolo-nome">{erro.campos.nome}</span>}
            </label>
            <label className={campo}>
                Descrição
                <textarea className={`${controle} min-h-24! resize-y`} name="descricao" value={dados.descricao ?? ""} onChange={(event) => atualizar("descricao", event.target.value || null)} rows={3} />
            </label>
            <label className={campo}>
                Quantidade mínima de evidências
                <input aria-label="Quantidade mínima de evidências" className={controle} name="quantidade_minima" type="number" min="0" step="1" value={dados.quantidade_minima} onChange={(event) => atualizar("quantidade_minima", Number(event.target.value))} required aria-invalid={Boolean(erro?.campos?.quantidade_minima)} aria-describedby="ajuda-quantidade-minima" />
                <span className="font-normal leading-5 text-foreground-muted" id="ajuda-quantidade-minima">Número mínimo de evidências registradas para atender ao protocolo.</span>
                {erro?.campos?.quantidade_minima && <span className="text-error">{erro.campos.quantidade_minima}</span>}
            </label>
            {erro?.erro && <p className="rounded-md border border-error/40 bg-error/10 px-3 py-2 text-[12px] text-error" role="alert">{erro.erro}</p>}
            {resultado?.ok && resultado.mensagem && <p className="text-[12px] text-success-700" role="status">{resultado.mensagem}</p>}
            <div className="flex flex-wrap justify-end gap-2 border-t border-border-muted pt-4">
                <Link className="ds-focus-ring inline-flex min-h-10 items-center rounded-md border border-border-control px-4 py-2 text-[13px] font-medium text-foreground no-underline hover:bg-surface-hover" to={baseProtocolos}>Cancelar</Link>
                <button className="ds-focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-action-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-action-primary-hover disabled:cursor-wait disabled:opacity-60" type="submit" disabled={fetcher.state !== "idle"}>
                    <i className="bi bi-check-lg" aria-hidden="true" /> {fetcher.state === "idle" ? (protocoloId ? "Salvar protocolo" : "Criar protocolo") : "Salvando…"}
                </button>
            </div>
        </fetcher.Form>
    );
}
