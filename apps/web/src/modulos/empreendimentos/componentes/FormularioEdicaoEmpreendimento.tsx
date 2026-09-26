import { zodResolver } from "@hookform/resolvers/zod";
import {
    empreendimentoSchema,
    type EmpreendimentoFormData,
} from "@constructo/shared";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";

import type { EmpreendimentoActionData } from "../../../features/empreendimentos/empreendimentos.action";
import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import "./FormularioEmpreendimento.css";

export default function FormularioEdicaoEmpreendimento() {
    const empreendimento = useLoaderData<typeof carregarEmpreendimento>();
    const actionData = useActionData<EmpreendimentoActionData>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { dirtyFields, errors, isSubmitting },
    } = useForm<EmpreendimentoFormData>({
        resolver: zodResolver(empreendimentoSchema),
        defaultValues: {
            nome: empreendimento.nome,
            descricao: empreendimento.descricao ?? "",
            endereco: empreendimento.endereco ?? "",
            status: empreendimento.status,
        },
    });

    const enviando = isSubmitting || (navigation.state !== "idle" && navigation.formData != null);

    useEffect(() => {
        if (actionData?.ok) {
            reset({
                nome: actionData.empreendimento.nome,
                descricao: actionData.empreendimento.descricao ?? "",
                endereco: actionData.empreendimento.endereco ?? "",
                status: actionData.empreendimento.status,
            });
            return;
        }

        if (!actionData?.campos) return;
        for (const [campo, mensagem] of Object.entries(actionData.campos)) {
            setError(campo as keyof EmpreendimentoFormData, { type: "server", message: mensagem });
        }
    }, [actionData, reset, setError]);

    return (
        <section className="empreendimento-card" aria-labelledby="editar-empreendimento-titulo">
            <header className="empreendimento-card__cabecalho">
                <div>
                    <span className="subtitulo">Dados atuais</span>
                    <h2 id="editar-empreendimento-titulo">Editar empreendimento</h2>
                </div>
                <p>Altere somente as informações gerais da obra.</p>
            </header>

            <Form
                method="patch"
                className="empreendimento-form"
                noValidate
                aria-busy={enviando}
                onSubmit={handleSubmit((dados) => {
                    const formulario = new FormData();
                    for (const campo of Object.keys(dirtyFields) as (keyof EmpreendimentoFormData)[]) {
                        const valor = dados[campo];
                        if (valor !== undefined) formulario.set(campo, valor);
                    }
                    submit(formulario, { method: "patch" });
                })}
            >
                <div className="campo empreendimento-form__nome">
                    <label htmlFor="editar-obra-nome">Nome <span aria-hidden="true">*</span></label>
                    <input id="editar-obra-nome" disabled={enviando} {...register("nome")} />
                    {errors.nome && <span role="alert">{errors.nome.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="editar-obra-status">Status <span aria-hidden="true">*</span></label>
                    <select id="editar-obra-status" disabled={enviando} {...register("status")}>
                        <option value="PLANEJADO">Planejado</option>
                        <option value="EM_ANDAMENTO">Em andamento</option>
                        <option value="CONCLUIDO">Concluído</option>
                        <option value="INATIVO">Inativo</option>
                    </select>
                </div>

                <div className="campo empreendimento-form__largo">
                    <label htmlFor="editar-obra-endereco">Endereço</label>
                    <input id="editar-obra-endereco" disabled={enviando} {...register("endereco")} />
                    {errors.endereco && <span role="alert">{errors.endereco.message}</span>}
                </div>

                <div className="campo empreendimento-form__largo">
                    <label htmlFor="editar-obra-descricao">Descrição</label>
                    <textarea id="editar-obra-descricao" rows={4} disabled={enviando} {...register("descricao")} />
                    {errors.descricao && <span role="alert">{errors.descricao.message}</span>}
                </div>

                {actionData?.ok && (
                    <p className="empreendimento-form__sucesso" role="status">
                        Empreendimento “{actionData.empreendimento.nome}” atualizado com sucesso.
                    </p>
                )}
                {actionData?.erro && <p className="empreendimento-form__erro" role="alert">{actionData.erro}</p>}

                <div className="empreendimento-form__acoes">
                    <Link className="botao secundario" to="/admin/obras">Cancelar</Link>
                    <button className="botao primario" type="submit" disabled={enviando}>
                        {enviando ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </Form>
        </section>
    );
}
