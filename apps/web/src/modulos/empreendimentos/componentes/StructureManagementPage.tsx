import type { EstruturaLocal } from "@constructo/shared";
import { useCallback, useMemo, useState } from "react";
import { Card, Form as BootstrapForm } from "react-bootstrap";
import { useLoaderData, useLocation, useSearchParams } from "react-router-dom";

import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";
import StructureTree from "../../../componentes/StructureTree/StructureTree";
import { carregarEstruturaFisica } from "../../../features/empreendimentos/empreendimentos.loader";
import { encontrarLocalSelecionado, LOCAL_SELECIONADO_PARAM, obterLocalSelecionadoId } from "../../../features/empreendimentos/localSelecionado";
import LocationDetails from "./LocationDetails";
import StructureBreadcrumb from "./StructureBreadcrumb";
import StructureList from "./StructureList";
import UnitBuyerLink, { type CompradorVinculado } from "./UnitBuyerLink";
import "./StructureManagementPage.css";

function ramosIniciais(items: EstruturaLocal[]): Set<number> {
    return new Set(items.flatMap((item) => [
        ...(item.filhos.length ? [item.id] : []),
        ...ramosIniciais(item.filhos),
    ]));
}

export default function StructureManagementPage() {
    const { empreendimento, estrutura } = useLoaderData<typeof carregarEstruturaFisica>();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [expandedIds, setExpandedIds] = useState<Set<number>>(() => ramosIniciais(estrutura));
    const [busca, setBusca] = useState("");
    const [compradoresPorUnidade, setCompradoresPorUnidade] = useState<Record<number, CompradorVinculado[]>>({});
    const selectedId = obterLocalSelecionadoId(new URL(`${location.pathname}${location.search}`, window.location.origin));
    const selecao = useMemo(() => encontrarLocalSelecionado(estrutura, selectedId), [estrutura, selectedId]);
    const localAtual = selecao?.local ?? null;
    const filhos = localAtual?.filhos ?? estrutura;
    const parametroInvalido = searchParams.has(LOCAL_SELECIONADO_PARAM) && !selecao;

    function selecionarPorId(id: number | null) {
        const parametros = new URLSearchParams(searchParams);
        if (id === null) parametros.delete(LOCAL_SELECIONADO_PARAM);
        else parametros.set(LOCAL_SELECIONADO_PARAM, String(id));
        setBusca("");
        setSearchParams(parametros, { preventScrollReset: true, replace: true });
    }

    function alternarRamo(local: EstruturaLocal) {
        setExpandedIds((atual) => {
            const proximo = new Set(atual);
            if (proximo.has(local.id)) proximo.delete(local.id); else proximo.add(local.id);
            return proximo;
        });
    }

    const registrarCompradorVinculado = useCallback((unidadeId: number, comprador: CompradorVinculado) => {
        setCompradoresPorUnidade((atuais) => {
            const compradores = atuais[unidadeId] ?? [];
            if (compradores.some((item) => item.id === comprador.id)) return atuais;

            return { ...atuais, [unidadeId]: [...compradores, comprador] };
        });
    }, []);

    const registrarCompradoresCarregados = useCallback((unidadeId: number, compradores: CompradorVinculado[]) => {
        setCompradoresPorUnidade((atuais) => ({ ...atuais, [unidadeId]: compradores }));
    }, []);

    return (
        <section className="estrutura-gerenciamento" aria-labelledby="estrutura-gerenciamento-titulo">
            <CabecalhoSecao titulo="Estrutura" tituloId="estrutura-gerenciamento-titulo" />
            <div className="estrutura-gerenciamento__cards">
                <Card className="estrutura-gerenciamento__card estrutura-gerenciamento__card--arvore">
                    <Card.Body>
                        <Card.Title as="h3">Locais do empreendimento</Card.Title>
                        <StructureTree
                            items={estrutura}
                            selectedId={selecao?.local.id ?? null}
                            onSelect={(local) => selecionarPorId(local.id)}
                            expandedIds={expandedIds}
                            onToggle={alternarRamo}
                        />
                    </Card.Body>
                </Card>

                <Card className="estrutura-gerenciamento__card estrutura-gerenciamento__card--lista">
                    <Card.Body>
                        <Card.Title as="h3">{localAtual?.nome ?? empreendimento.nome}</Card.Title>
                        <StructureBreadcrumb selecao={selecao} onSelect={selecionarPorId} />
                        {parametroInvalido && <p className="alert alert-warning">O local informado não pertence a esta estrutura.</p>}
                        <BootstrapForm.Group className="mb-3" controlId="buscar-filhos">
                            <BootstrapForm.Label>Buscar neste nível</BootstrapForm.Label>
                            <BootstrapForm.Control value={busca} placeholder="Nome do local" onChange={(event) => setBusca(event.target.value)} />
                            <BootstrapForm.Text>A busca considera apenas os filhos diretos.</BootstrapForm.Text>
                        </BootstrapForm.Group>
                        <StructureList items={filhos} busca={busca} contexto={localAtual?.nome ?? "A estrutura"} onSelect={(local) => selecionarPorId(local.id)} />
                        {localAtual?.tipo === "UNIDADE" && (
                            <section className="border-top mt-4 pt-3" aria-labelledby="compradores-unidade-titulo">
                                <h4 id="compradores-unidade-titulo" className="h5">Compradores vinculados</h4>
                                {(compradoresPorUnidade[localAtual.id] ?? []).length === 0 ? (
                                    <p className="text-body-secondary mb-0">Nenhum comprador vinculado a esta unidade.</p>
                                ) : (
                                    <ul className="mb-0">
                                        {(compradoresPorUnidade[localAtual.id] ?? []).map((comprador) => (
                                            <li key={comprador.id}>
                                                {comprador.nome}{comprador.email && ` — ${comprador.email}`}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                    </Card.Body>
                </Card>

                <Card className="estrutura-gerenciamento__card estrutura-gerenciamento__card--detalhes">
                    <Card.Body>
                        <Card.Title as="h3">Detalhes do local</Card.Title>
                        <LocationDetails selecao={selecao} empreendimentoNome={empreendimento.nome} />
                        {localAtual?.tipo === "UNIDADE" && (
                            <UnitBuyerLink
                                key={localAtual.id}
                                empreendimentoId={empreendimento.id}
                                unidadeId={localAtual.id}
                                onVinculado={registrarCompradorVinculado}
                                onCompradoresCarregados={registrarCompradoresCarregados}
                            />
                        )}
                    </Card.Body>
                </Card>
            </div>
        </section>
    );
}
