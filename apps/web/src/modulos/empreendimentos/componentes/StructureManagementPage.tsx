import type { EstruturaLocal } from "@constructo/shared";
import { useMemo, useState } from "react";
import { useLoaderData, useLocation, useSearchParams } from "react-router-dom";

import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";
import { Card, CardBody, CardTitle, FormControl, FormGroup, FormLabel, FormText } from "../../../componentes/ui/Ui";
import StructureTree from "../../../componentes/StructureTree/StructureTree";
import { carregarEstruturaFisica } from "../../../features/empreendimentos/empreendimentos.loader";
import { encontrarLocalSelecionado, LOCAL_SELECIONADO_PARAM, obterLocalSelecionadoId } from "../../../features/empreendimentos/localSelecionado";
import LocationDetails from "./LocationDetails";
import StructureBreadcrumb from "./StructureBreadcrumb";
import StructureList from "./StructureList";
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

    return (
        <section className="estrutura-gerenciamento" aria-labelledby="estrutura-gerenciamento-titulo">
            <CabecalhoSecao titulo="Estrutura" tituloId="estrutura-gerenciamento-titulo" />
            <div className="estrutura-gerenciamento__cards">
                <Card className="estrutura-gerenciamento__card estrutura-gerenciamento__card--arvore">
                    <CardBody>
                        <CardTitle>Locais do empreendimento</CardTitle>
                        <StructureTree
                            items={estrutura}
                            selectedId={selecao?.local.id ?? null}
                            onSelect={(local) => selecionarPorId(local.id)}
                            expandedIds={expandedIds}
                            onToggle={alternarRamo}
                        />
                    </CardBody>
                </Card>

                <Card className="estrutura-gerenciamento__card estrutura-gerenciamento__card--lista">
                    <CardBody>
                        <CardTitle>{localAtual?.nome ?? empreendimento.nome}</CardTitle>
                        <StructureBreadcrumb selecao={selecao} onSelect={selecionarPorId} />
                        {parametroInvalido && <p className="alert alert-warning">O local informado não pertence a esta estrutura.</p>}
                        <FormGroup className="mb-3">
                            <FormLabel htmlFor="buscar-filhos">Buscar neste nível</FormLabel>
                            <FormControl id="buscar-filhos" value={busca} placeholder="Nome do local" onChange={(event) => setBusca(event.target.value)} />
                            <FormText>A busca considera apenas os filhos diretos.</FormText>
                        </FormGroup>
                        <StructureList items={filhos} busca={busca} contexto={localAtual?.nome ?? "A estrutura"} onSelect={(local) => selecionarPorId(local.id)} />
                    </CardBody>
                </Card>

                <Card className="estrutura-gerenciamento__card estrutura-gerenciamento__card--detalhes">
                    <CardBody>
                        <CardTitle>Detalhes do local</CardTitle>
                        <LocationDetails selecao={selecao} empreendimentoNome={empreendimento.nome} />
                    </CardBody>
                </Card>
            </div>
        </section>
    );
}
