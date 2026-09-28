import React from "react";
import { useFetcher, useLoaderData } from "react-router-dom";
import type { Etapa, Marco } from "../../../features/empreendimentos/empreendimentos.service";
import type { carregarTaxonomia } from "../../../features/empreendimentos/taxonomia.loader";
import "./TaxonomyEditor.css";

function ItemForm({ etapa, marco, parentId }: { etapa?: Etapa; marco?: Marco; parentId?: number }) {
    const fetcher = useFetcher();
    const editar = Boolean((etapa && etapa.id > 0) || (marco && marco.id > 0));
    const alvo = etapa ?? marco;
    return <fetcher.Form method="post" className="taxonomy-form">
        <input type="hidden" name="intencao" value={marco ? (editar ? "editar-marco" : "criar-marco") : (editar ? "editar-etapa" : "criar-etapa")} />
        {alvo && <input type="hidden" name="id" value={alvo.id} />}
        {marco && <input type="hidden" name="etapa_id" value={marco.etapa_id} />}
        {!editar && parentId !== undefined && <input type="hidden" name="parent_id" value={parentId} />}
        <input name="nome" defaultValue={alvo?.nome ?? ""} placeholder={marco ? "Nome do marco" : "Nome da etapa"} required />
        <input name="ordem" type="number" min="0" defaultValue={alvo?.ordem ?? 0} aria-label="Ordem" />
        <input name="descricao_tecnica" defaultValue={alvo?.descricao_tecnica ?? ""} placeholder="Descrição técnica" />
        <input name="descricao_cliente" defaultValue={alvo?.descricao_cliente ?? ""} placeholder="Descrição para o comprador" />
        <button type="submit" disabled={fetcher.state !== "idle"}>{fetcher.state === "idle" ? (editar ? "Salvar" : "Criar") : "Salvando…"}</button>
    </fetcher.Form>;
}

function TaxonomyTreeItem({ item, empreendimentoId, nivel = 0, selecionado, onSelect }: { item: Etapa | Marco; empreendimentoId: number; nivel?: number; selecionado?: number; onSelect: (item: Etapa | Marco) => void }) {
    const [aberto, setAberto] = React.useState(true);
    const etapa = "subetapas" in item;
    const filhos = etapa ? [...(item.subetapas ?? []), ...(item.marcos ?? [])] : [];
    return <li className={`taxonomy-item taxonomy-${etapa ? (nivel ? "subetapa" : "etapa") : "marco"} ${selecionado === item.id ? "taxonomy-item--selected" : ""}`}>
        <div className="taxonomy-item__row">
            {etapa && <button type="button" onClick={() => setAberto(!aberto)} aria-label={aberto ? "Recolher" : "Expandir"}>{aberto ? "▾" : "▸"}</button>}
            <button type="button" className="taxonomy-select" onClick={() => onSelect(item)}><strong>{item.nome}</strong></button><span>#{item.ordem}</span>
        </div>
        <div className="taxonomy-item__description">{item.descricao_cliente || item.descricao_tecnica || "Sem descrição"}</div>
        {etapa && aberto && <>
            <ItemForm etapa={item as Etapa} />
            <ItemForm parentId={item.id} />
            <ItemForm marco={{ id: 0, etapa_id: item.id, nome: "", ordem: 0 }} />
            <ul>{filhos.sort((a: Etapa | Marco, b: Etapa | Marco) => a.ordem - b.ordem).map((filho) => <TaxonomyTreeItem key={filho.id} item={filho} empreendimentoId={empreendimentoId} nivel={nivel + 1} selecionado={selecionado} onSelect={onSelect} />)}</ul>
        </>}
        {!etapa && <ItemForm marco={item as Marco} />}
    </li>;
}

export default function TaxonomyEditor() {
    const { empreendimento, taxonomia } = useLoaderData<typeof carregarTaxonomia>();
    const [selecionado, setSelecionado] = React.useState<number>();
    return <section className="taxonomy-editor" aria-labelledby="taxonomy-title">
        <header><h2 id="taxonomy-title">Taxonomia — {empreendimento.nome}</h2><p>{taxonomia.descricao || "Estrutura personalizada do empreendimento."}</p></header>
        <ItemForm />
        <ul className="taxonomy-tree">{(taxonomia.etapas ?? []).sort((a: Etapa, b: Etapa) => a.ordem - b.ordem).map((etapa: Etapa) => <TaxonomyTreeItem key={etapa.id} item={etapa} empreendimentoId={empreendimento.id} selecionado={selecionado} onSelect={(item) => setSelecionado(item.id)} />)}</ul>
    </section>;
}
