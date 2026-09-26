import type { EstruturaLocal } from "@constructo/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Form,
    useActionData,
    useLoaderData,
    useLocation,
    useNavigation,
    useSearchParams,
} from "react-router-dom";

import StructureTree from "../../../componentes/StructureTree/StructureTree";
import type { LocalRaizActionData } from "../../../features/empreendimentos/empreendimentos.action";
import { carregarEstruturaFisica } from "../../../features/empreendimentos/empreendimentos.loader";
import {
    encontrarLocalSelecionado,
    LOCAL_SELECIONADO_PARAM,
    obterLocalSelecionadoId,
} from "../../../features/empreendimentos/localSelecionado";
import LocationDetails from "./LocationDetails";
import StructureHeader from "./StructureHeader";
import "./StructureManagementPage.css";

const rotuloTipo = { TORRE: "Torre", BLOCO: "Bloco" } as const;

export default function StructureManagementPage() {
    const { empreendimento, estrutura } = useLoaderData<typeof carregarEstruturaFisica>();
    const actionData = useActionData<LocalRaizActionData>();
    const navigation = useNavigation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const formularioRaizRef = useRef<HTMLFormElement>(null);
    const formularioPavimentoRef = useRef<HTMLFormElement>(null);
    const formularioUnidadeRef = useRef<HTMLFormElement>(null);
    const [paiSelecionado, setPaiSelecionado] = useState<EstruturaLocal | null>(null);
    const [pavimentoSelecionado, setPavimentoSelecionado] = useState<EstruturaLocal | null>(null);
    const selectedId = obterLocalSelecionadoId(
        new URL(`${location.pathname}${location.search}`, window.location.origin),
    );
    const selecao = useMemo(
        () => encontrarLocalSelecionado(estrutura, selectedId),
        [estrutura, selectedId],
    );
    const enviando = navigation.state !== "idle" && navigation.formData != null;
    const enviandoPavimento = enviando
        && navigation.formData?.get("intencao") === "adicionar-pavimento";
    const enviandoUnidade = enviando
        && navigation.formData?.get("intencao") === "adicionar-unidade";

    useEffect(() => {
        if (!actionData?.ok) return;
        if (actionData.intencao === "pavimento") formularioPavimentoRef.current?.reset();
        else if (actionData.intencao === "unidade") formularioUnidadeRef.current?.reset();
        else formularioRaizRef.current?.reset();
    }, [actionData]);

    function selecionarLocal(item: EstruturaLocal) {
        const proximosParametros = new URLSearchParams(searchParams);
        proximosParametros.set(LOCAL_SELECIONADO_PARAM, String(item.id));
        setSearchParams(proximosParametros, { preventScrollReset: true, replace: true });
    }

    function abrirPavimento(item: EstruturaLocal) {
        selecionarLocal(item);
        setPavimentoSelecionado(null);
        setPaiSelecionado((atual) => atual?.id === item.id ? null : item);
    }

    function abrirUnidade(item: EstruturaLocal) {
        selecionarLocal(item);
        setPaiSelecionado(null);
        setPavimentoSelecionado((atual) => atual?.id === item.id ? null : item);
    }

    return (
        <>
            <section
                className="detalhes-empreendimento estrutura-fisica"
                aria-labelledby="estrutura-fisica-empreendimento-titulo"
            >
                <StructureHeader
                    empreendimentoId={empreendimento.id}
                    empreendimentoNome={empreendimento.nome}
                />

                <div className="estrutura-fisica__cabecalho-lista">
                    <div>
                        <span className="subtitulo">Visão hierárquica</span>
                        <h3>Torres, blocos, pavimentos e unidades</h3>
                    </div>
                    <p>
                        {estrutura.length} {estrutura.length === 1 ? "local raiz" : "locais raiz"}
                    </p>
                </div>

                {estrutura.length === 0 ? (
                    <div className="estrutura-fisica__vazia">
                        <h3>Nenhuma torre ou bloco cadastrado</h3>
                        <p>Adicione o primeiro local para iniciar a estrutura física da obra.</p>
                    </div>
                ) : (
                    <div className="estrutura-fisica__conteudo">
                        <div>
                            <StructureTree
                                items={estrutura}
                                selectedId={selecao?.local.id ?? null}
                                onSelect={selecionarLocal}
                                renderActions={(item) => {
                                    if (item.tipo === "TORRE" || item.tipo === "BLOCO") {
                                        return (
                                            <button
                                                className="botao secundario"
                                                type="button"
                                                aria-expanded={paiSelecionado?.id === item.id}
                                                onClick={() => abrirPavimento(item)}
                                            >
                                                Adicionar pavimento
                                            </button>
                                        );
                                    }
                                    if (item.tipo === "PAVIMENTO") {
                                        return (
                                            <button
                                                className="botao secundario"
                                                type="button"
                                                aria-expanded={pavimentoSelecionado?.id === item.id}
                                                onClick={() => abrirUnidade(item)}
                                            >
                                                Adicionar unidade
                                            </button>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </div>
                        <LocationDetails
                            key={selecao?.local.id ?? "sem-selecao"}
                            selecao={selecao}
                            empreendimentoNome={empreendimento.nome}
                        />
                    </div>
                )}

                {paiSelecionado && (
                    <Form
                        ref={formularioPavimentoRef}
                        method="post"
                        className="empreendimento-form estrutura-fisica__form-filho"
                        noValidate
                        aria-label={`Adicionar pavimento em ${paiSelecionado.nome}`}
                        aria-busy={enviandoPavimento}
                    >
                        <input type="hidden" name="intencao" value="adicionar-pavimento" />
                        <input type="hidden" name="parent_id" value={paiSelecionado.id} />
                        <CampoFilho
                            prefixo="pavimento"
                            parentId={paiSelecionado.id}
                            disabled={enviandoPavimento}
                            actionData={actionData}
                            intencao="pavimento"
                        />
                        <button className="botao primario" type="submit" disabled={enviandoPavimento}>
                            {enviandoPavimento ? "Adicionando..." : "Adicionar pavimento"}
                        </button>
                        {actionData?.intencao === "pavimento"
                            && actionData.parentId === paiSelecionado.id
                            && actionData.ok && (
                            <p className="empreendimento-form__sucesso" role="status">
                                Pavimento “{actionData.local.nome}” adicionado com sucesso.
                            </p>
                        )}
                        {actionData?.intencao === "pavimento"
                            && actionData.parentId === paiSelecionado.id
                            && actionData.erro && (
                            <p className="empreendimento-form__erro" role="alert">{actionData.erro}</p>
                        )}
                    </Form>
                )}

                {pavimentoSelecionado && (
                    <Form
                        ref={formularioUnidadeRef}
                        method="post"
                        className="empreendimento-form estrutura-fisica__form-filho"
                        noValidate
                        aria-label={`Adicionar unidade em ${pavimentoSelecionado.nome}`}
                        aria-busy={enviandoUnidade}
                    >
                        <input type="hidden" name="intencao" value="adicionar-unidade" />
                        <input type="hidden" name="parent_id" value={pavimentoSelecionado.id} />
                        <CampoFilho
                            prefixo="unidade"
                            parentId={pavimentoSelecionado.id}
                            disabled={enviandoUnidade}
                            actionData={actionData}
                            intencao="unidade"
                        />
                        <button className="botao primario" type="submit" disabled={enviandoUnidade}>
                            {enviandoUnidade ? "Adicionando..." : "Adicionar unidade"}
                        </button>
                        {actionData?.intencao === "unidade"
                            && actionData.parentId === pavimentoSelecionado.id
                            && actionData.ok && (
                            <p className="empreendimento-form__sucesso" role="status">
                                Unidade “{actionData.local.nome}” adicionada com sucesso.
                            </p>
                        )}
                        {actionData?.intencao === "unidade"
                            && actionData.parentId === pavimentoSelecionado.id
                            && actionData.erro && (
                            <p className="empreendimento-form__erro" role="alert">{actionData.erro}</p>
                        )}
                    </Form>
                )}
            </section>

            <section className="empreendimento-card" aria-labelledby="adicionar-local-titulo">
                <header className="empreendimento-card__cabecalho">
                    <div>
                        <span className="subtitulo">Novo local</span>
                        <h2 id="adicionar-local-titulo">Adicionar torre/bloco</h2>
                    </div>
                    <p>Cadastre uma raiz vinculada ao empreendimento {empreendimento.nome}.</p>
                </header>

                <Form
                    ref={formularioRaizRef}
                    method="post"
                    className="empreendimento-form"
                    noValidate
                    aria-busy={enviando}
                >
                    <div className="campo empreendimento-form__nome">
                        <label htmlFor="local-nome">Nome <span aria-hidden="true">*</span></label>
                        <input
                            id="local-nome"
                            name="nome"
                            type="text"
                            maxLength={200}
                            disabled={enviando}
                            aria-invalid={Boolean(actionData?.intencao === "raiz" && actionData.campos?.nome)}
                        />
                        {actionData?.intencao === "raiz" && actionData.campos?.nome && (
                            <span role="alert">{actionData.campos.nome}</span>
                        )}
                    </div>
                    <div className="campo">
                        <label htmlFor="local-tipo">Tipo <span aria-hidden="true">*</span></label>
                        <select id="local-tipo" name="tipo" defaultValue="TORRE" disabled={enviando}>
                            <option value="TORRE">Torre</option>
                            <option value="BLOCO">Bloco</option>
                        </select>
                    </div>
                    <div className="campo">
                        <label htmlFor="local-ordem">Ordem <span aria-hidden="true">*</span></label>
                        <input
                            id="local-ordem"
                            name="ordem"
                            type="number"
                            min="0"
                            step="1"
                            defaultValue="0"
                            disabled={enviando}
                            aria-invalid={Boolean(actionData?.intencao === "raiz" && actionData.campos?.ordem)}
                        />
                        {actionData?.intencao === "raiz" && actionData.campos?.ordem && (
                            <span role="alert">{actionData.campos.ordem}</span>
                        )}
                    </div>
                    {actionData?.ok && actionData.intencao === "raiz" && (
                        <p className="empreendimento-form__sucesso" role="status">
                            {rotuloTipo[actionData.local.tipo as keyof typeof rotuloTipo]} “{actionData.local.nome}” adicionada com sucesso.
                        </p>
                    )}
                    {actionData?.intencao === "raiz" && actionData.erro && (
                        <p className="empreendimento-form__erro" role="alert">{actionData.erro}</p>
                    )}
                    <div className="empreendimento-form__acoes">
                        <button className="botao primario" type="submit" disabled={enviando}>
                            {enviando ? "Adicionando..." : "Adicionar torre/bloco"}
                        </button>
                    </div>
                </Form>
            </section>
        </>
    );
}

type CampoFilhoProps = {
    prefixo: "pavimento" | "unidade";
    parentId: number;
    disabled: boolean;
    actionData: LocalRaizActionData | undefined;
    intencao: "pavimento" | "unidade";
};

function CampoFilho({ prefixo, parentId, disabled, actionData, intencao }: CampoFilhoProps) {
    const erroNome = actionData?.intencao === intencao
        && actionData.parentId === parentId
        && actionData.campos?.nome;
    const erroOrdem = actionData?.intencao === intencao
        && actionData.parentId === parentId
        && actionData.campos?.ordem;

    return (
        <>
            <div className="campo empreendimento-form__nome">
                <label htmlFor={`${prefixo}-nome-${parentId}`}>Nome <span aria-hidden="true">*</span></label>
                <input
                    id={`${prefixo}-nome-${parentId}`}
                    name="nome"
                    type="text"
                    maxLength={200}
                    disabled={disabled}
                    aria-invalid={Boolean(erroNome)}
                />
                {erroNome && <span role="alert">{erroNome}</span>}
            </div>
            <div className="campo">
                <label htmlFor={`${prefixo}-ordem-${parentId}`}>Ordem <span aria-hidden="true">*</span></label>
                <input
                    id={`${prefixo}-ordem-${parentId}`}
                    name="ordem"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue="0"
                    disabled={disabled}
                    aria-invalid={Boolean(erroOrdem)}
                />
                {erroOrdem && <span role="alert">{erroOrdem}</span>}
            </div>
        </>
    );
}
