import { useEffect, useRef, useState } from "react";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router-dom";

import type { LocalRaizActionData } from "../../../features/empreendimentos/empreendimentos.action";
import { carregarEstruturaFisica } from "../../../features/empreendimentos/empreendimentos.loader";
import "./EstruturaFisicaEmpreendimento.css";

const rotuloTipo = { TORRE: "Torre", BLOCO: "Bloco" } as const;

export default function EstruturaFisicaEmpreendimento() {
    const { empreendimento, locais, pavimentosPorPai } = useLoaderData<typeof carregarEstruturaFisica>();
    const actionData = useActionData<LocalRaizActionData>();
    const navigation = useNavigation();
    const formularioRaizRef = useRef<HTMLFormElement>(null);
    const formularioPavimentoRef = useRef<HTMLFormElement>(null);
    const [paiSelecionado, setPaiSelecionado] = useState<number | null>(null);
    const enviando = navigation.state !== "idle" && navigation.formData != null;
    const enviandoPavimento = enviando
        && navigation.formData?.get("intencao") === "adicionar-pavimento";

    useEffect(() => {
        if (!actionData?.ok) return;
        if (actionData.intencao === "pavimento") formularioPavimentoRef.current?.reset();
        else formularioRaizRef.current?.reset();
    }, [actionData]);

    return (
        <>
            <section
                className="detalhes-empreendimento estrutura-fisica"
                aria-labelledby="estrutura-fisica-empreendimento-titulo"
            >
                <header className="detalhes-empreendimento__cabecalho">
                    <div>
                        <span className="subtitulo">Empreendimento</span>
                        <h2 id="estrutura-fisica-empreendimento-titulo">{empreendimento.nome}</h2>
                    </div>
                    <Link
                        className="botao secundario"
                        to={`/admin/empreendimentos/${empreendimento.id}`}
                    >
                        Voltar aos detalhes
                    </Link>
                </header>

                <div className="estrutura-fisica__cabecalho-lista">
                    <div>
                        <span className="subtitulo">Primeiro nível</span>
                        <h3>Torres e blocos</h3>
                    </div>
                    <p>{locais.length} {locais.length === 1 ? "local cadastrado" : "locais cadastrados"}</p>
                </div>

                {locais.length === 0 ? (
                    <div className="estrutura-fisica__vazia">
                        <h3>Nenhuma torre ou bloco cadastrado</h3>
                        <p>Adicione o primeiro local para iniciar a estrutura física da obra.</p>
                    </div>
                ) : (
                    <ol className="estrutura-fisica__lista">
                        {locais.map((local) => (
                            <li className="estrutura-fisica__raiz" key={local.id}>
                                <div className="estrutura-fisica__local">
                                    <span className="estrutura-fisica__ordem">{local.ordem}</span>
                                    <div className="estrutura-fisica__identificacao">
                                        <strong>{local.nome}</strong>
                                        <span>{rotuloTipo[local.tipo as keyof typeof rotuloTipo]}</span>
                                    </div>
                                    <button
                                        className="botao secundario estrutura-fisica__adicionar"
                                        type="button"
                                        aria-expanded={paiSelecionado === local.id}
                                        onClick={() => setPaiSelecionado(
                                            paiSelecionado === local.id ? null : local.id,
                                        )}
                                    >
                                        Adicionar pavimento
                                    </button>
                                </div>

                                {(pavimentosPorPai[local.id] ?? []).length > 0 ? (
                                    <ol className="estrutura-fisica__pavimentos">
                                        {(pavimentosPorPai[local.id] ?? []).map((pavimento) => (
                                            <li key={pavimento.id}>
                                                <span className="estrutura-fisica__ordem">{pavimento.ordem}</span>
                                                <div className="estrutura-fisica__identificacao">
                                                    <strong>{pavimento.nome}</strong>
                                                    <span>Pavimento</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="estrutura-fisica__sem-pavimentos">Nenhum pavimento cadastrado.</p>
                                )}

                                {paiSelecionado === local.id && (
                                    <Form
                                        ref={formularioPavimentoRef}
                                        method="post"
                                        className="empreendimento-form estrutura-fisica__form-pavimento"
                                        noValidate
                                        aria-label={`Adicionar pavimento em ${local.nome}`}
                                        aria-busy={enviandoPavimento}
                                    >
                                        <input type="hidden" name="intencao" value="adicionar-pavimento" />
                                        <input type="hidden" name="parent_id" value={local.id} />
                                        <div className="campo empreendimento-form__nome">
                                            <label htmlFor={`pavimento-nome-${local.id}`}>
                                                Nome <span aria-hidden="true">*</span>
                                            </label>
                                            <input
                                                id={`pavimento-nome-${local.id}`}
                                                name="nome"
                                                type="text"
                                                maxLength={200}
                                                disabled={enviandoPavimento}
                                                aria-invalid={Boolean(
                                                    actionData?.intencao === "pavimento"
                                                    && actionData.parentId === local.id
                                                    && actionData.campos?.nome,
                                                )}
                                            />
                                            {actionData?.intencao === "pavimento"
                                                && actionData.parentId === local.id
                                                && actionData.campos?.nome && (
                                                <span role="alert">{actionData.campos.nome}</span>
                                            )}
                                        </div>
                                        <div className="campo">
                                            <label htmlFor={`pavimento-ordem-${local.id}`}>
                                                Ordem <span aria-hidden="true">*</span>
                                            </label>
                                            <input
                                                id={`pavimento-ordem-${local.id}`}
                                                name="ordem"
                                                type="number"
                                                min="0"
                                                step="1"
                                                defaultValue="0"
                                                disabled={enviandoPavimento}
                                            />
                                            {actionData?.intencao === "pavimento"
                                                && actionData.parentId === local.id
                                                && actionData.campos?.ordem && (
                                                <span role="alert">{actionData.campos.ordem}</span>
                                            )}
                                        </div>
                                        <button className="botao primario" type="submit" disabled={enviandoPavimento}>
                                            {enviandoPavimento ? "Adicionando..." : "Adicionar pavimento"}
                                        </button>
                                        {actionData?.intencao === "pavimento"
                                            && actionData.parentId === local.id
                                            && actionData.ok && (
                                            <p className="empreendimento-form__sucesso" role="status">
                                                Pavimento “{actionData.local.nome}” adicionado com sucesso.
                                            </p>
                                        )}
                                        {actionData?.intencao === "pavimento"
                                            && actionData.parentId === local.id
                                            && actionData.erro && (
                                            <p className="empreendimento-form__erro" role="alert">{actionData.erro}</p>
                                        )}
                                    </Form>
                                )}
                            </li>
                        ))}
                    </ol>
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
                            aria-describedby={actionData?.intencao === "raiz" && actionData.campos?.nome ? "local-nome-erro" : undefined}
                        />
                        {actionData?.intencao === "raiz" && actionData.campos?.nome && (
                            <span id="local-nome-erro" role="alert">{actionData.campos.nome}</span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="local-tipo">Tipo <span aria-hidden="true">*</span></label>
                        <select id="local-tipo" name="tipo" defaultValue="TORRE" disabled={enviando}>
                            <option value="TORRE">Torre</option>
                            <option value="BLOCO">Bloco</option>
                        </select>
                        {actionData?.intencao === "raiz" && actionData.campos?.tipo && <span role="alert">{actionData.campos.tipo}</span>}
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
                        {actionData?.intencao === "raiz" && actionData.campos?.ordem && <span role="alert">{actionData.campos.ordem}</span>}
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
