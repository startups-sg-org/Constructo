import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

import type { ItemProtocolo, ProtocoloEvidenciaDados } from "../../../../features/evidencias/evidencias.service";
import type { carregarProtocoloEditor } from "../../../../features/evidencias/protocolos.loader";
import { cn } from "../../../../utils/classes";
import { ProtocolForm } from "./ProtocolForm";
import { ProtocolHeader } from "./ProtocolHeader";
import { ProtocolItemList } from "./ProtocolItemList";
import { ProtocolPreview } from "./ProtocolPreview";

const DADOS_INICIAIS: ProtocoloEvidenciaDados = { nome: "", descricao: null, quantidade_minima: 0 };

/** Workspace integrado de listagem, configuração e prévia de protocolos. */
export default function ProtocolEditor() {
    const dadosCarregados = useLoaderData<typeof carregarProtocoloEditor>();
    const chavePersistida = `${dadosCarregados.modo}:${JSON.stringify(dadosCarregados.protocolo ?? null)}`;
    return <ProtocolWorkspace dadosCarregados={dadosCarregados} key={chavePersistida} />;
}

type ProtocolWorkspaceProps = {
    dadosCarregados: Awaited<ReturnType<typeof carregarProtocoloEditor>>;
};

function ProtocolWorkspace({ dadosCarregados }: ProtocolWorkspaceProps) {
    const { empreendimentoId, marcoId, protocolo, protocolos, modo, baseProtocolos } = dadosCarregados;
    const [busca, setBusca] = useState("");
    const [dados, setDados] = useState<ProtocoloEvidenciaDados>(protocolo ?? DADOS_INICIAIS);
    const [itens, setItens] = useState<ItemProtocolo[]>(protocolo?.itens ?? []);

    const protocolosFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        if (!termo) return protocolos;
        return protocolos.filter((item) => item.nome.toLocaleLowerCase("pt-BR").includes(termo));
    }, [busca, protocolos]);

    return (
        <section className="grid min-w-0 gap-6 text-foreground" aria-labelledby="protocol-editor-title">
            <ProtocolHeader baseProtocolos={baseProtocolos} empreendimentoId={empreendimentoId} marcoId={marcoId} />
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(220px,0.72fr)_minmax(360px,1.65fr)_minmax(260px,0.9fr)]">
                <aside className="ds-panel grid min-w-0 gap-4 p-3 lg:sticky lg:top-4" aria-label="Lista de protocolos">
                    <div className="flex items-center justify-between gap-2 px-1">
                        <h3 className="text-[15px] font-semibold text-foreground-strong">Protocolos</h3>
                        <span className="text-[11px] text-foreground-muted">{protocolos.length}</span>
                    </div>
                    <label className="relative block">
                        <span className="sr-only">Buscar protocolo</span>
                        <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-foreground-muted" aria-hidden="true" />
                        <input className="ds-dark-field min-h-10! pl-9! text-[13px]!" type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar protocolo..." />
                    </label>
                    {protocolos.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border-control px-3 py-6 text-center">
                            <p className="text-[13px] font-medium text-foreground">Nenhum protocolo cadastrado neste marco.</p>
                            <p className="mt-1 text-[12px] leading-5 text-foreground-muted">Crie o primeiro checklist de evidências.</p>
                        </div>
                    ) : protocolosFiltrados.length === 0 ? (
                        <p className="rounded-md border border-dashed border-border-control px-3 py-5 text-center text-[12px] text-foreground-muted">Nenhum protocolo encontrado para “{busca}”.</p>
                    ) : (
                        <nav className="grid gap-1" aria-label="Protocolos do marco">
                            {protocolosFiltrados.map((item) => {
                                const obrigatorios = item.itens.filter((checklistItem) => checklistItem.obrigatorio).length;
                                const selecionado = item.id === protocolo?.id;
                                return (
                                    <Link aria-current={selecionado ? "page" : undefined} className={cn("ds-focus-ring-offset grid min-w-0 gap-1 rounded-md border px-3 py-2.5 no-underline transition-colors", selecionado ? "border-accent/60 bg-surface-selected text-foreground-strong" : "border-transparent text-foreground hover:border-border-muted hover:bg-surface-hover")} key={item.id} to={`${baseProtocolos}/${item.id}`}>
                                        <span className="truncate text-[13px] font-semibold">{item.nome}</span>
                                        <span className="text-[11px] leading-4 text-foreground-muted">{item.itens.length} {item.itens.length === 1 ? "item" : "itens"} · {obrigatorios} {obrigatorios === 1 ? "obrigatório" : "obrigatórios"}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
                </aside>
                {modo === "listar" ? (
                    <div className="ds-panel grid min-h-72 place-items-center p-8 text-center lg:col-span-2">
                        <div className="max-w-md">
                            <i className="bi bi-ui-checks-grid text-[32px] text-accent" aria-hidden="true" />
                            <h3 className="mt-3 text-[16px] font-semibold text-foreground-strong">Selecione um protocolo</h3>
                            <p className="mt-1 text-[13px] leading-5 text-foreground-muted">Escolha um protocolo na lista para editar seus dados e itens, ou crie uma nova configuração.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <main className="ds-panel grid min-w-0 gap-5 p-5 max-sm:p-4">
                            <div>
                                <p className="text-overline font-medium uppercase tracking-[0.08em] text-foreground-muted">Marco #{marcoId}</p>
                                <h3 className="mt-1 text-[16px] font-semibold text-foreground-strong">{protocolo ? "Editar protocolo" : "Novo protocolo"}</h3>
                            </div>
                            <ProtocolForm baseProtocolos={baseProtocolos} dados={dados} protocoloId={protocolo?.id} onChange={setDados} />
                            <div className="h-px bg-border-muted" />
                            <ProtocolItemList protocoloId={protocolo?.id} itens={itens} onChange={setItens} />
                        </main>
                        <ProtocolPreview dados={dados} itens={itens} />
                    </>
                )}
            </div>
        </section>
    );
}
