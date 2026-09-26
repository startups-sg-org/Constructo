import { useEffect, useRef } from "react";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router-dom";

import type { LocalRaizActionData } from "../../../features/empreendimentos/empreendimentos.action";
import { carregarEstruturaFisica } from "../../../features/empreendimentos/empreendimentos.loader";
import "./EstruturaFisicaEmpreendimento.css";

const rotuloTipo = { TORRE: "Torre", BLOCO: "Bloco" } as const;

export default function EstruturaFisicaEmpreendimento() {
    const { empreendimento, locais } = useLoaderData<typeof carregarEstruturaFisica>();
    const actionData = useActionData<LocalRaizActionData>();
    const navigation = useNavigation();
    const formularioRef = useRef<HTMLFormElement>(null);
    const enviando = navigation.state !== "idle" && navigation.formData != null;

    useEffect(() => {
        if (actionData?.ok) formularioRef.current?.reset();
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
                            <li key={local.id}>
                                <span className="estrutura-fisica__ordem">{local.ordem}</span>
                                <div>
                                    <strong>{local.nome}</strong>
                                    <span>{rotuloTipo[local.tipo]}</span>
                                </div>
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
                    ref={formularioRef}
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
                            aria-invalid={Boolean(actionData?.campos?.nome)}
                            aria-describedby={actionData?.campos?.nome ? "local-nome-erro" : undefined}
                        />
                        {actionData?.campos?.nome && (
                            <span id="local-nome-erro" role="alert">{actionData.campos.nome}</span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="local-tipo">Tipo <span aria-hidden="true">*</span></label>
                        <select id="local-tipo" name="tipo" defaultValue="TORRE" disabled={enviando}>
                            <option value="TORRE">Torre</option>
                            <option value="BLOCO">Bloco</option>
                        </select>
                        {actionData?.campos?.tipo && <span role="alert">{actionData.campos.tipo}</span>}
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
                            aria-invalid={Boolean(actionData?.campos?.ordem)}
                        />
                        {actionData?.campos?.ordem && <span role="alert">{actionData.campos.ordem}</span>}
                    </div>

                    {actionData?.ok && (
                        <p className="empreendimento-form__sucesso" role="status">
                            {rotuloTipo[actionData.local.tipo]} “{actionData.local.nome}” adicionada com sucesso.
                        </p>
                    )}
                    {actionData?.erro && (
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
