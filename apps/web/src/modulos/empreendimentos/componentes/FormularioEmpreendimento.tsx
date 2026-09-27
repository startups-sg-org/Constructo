import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    Link,
    useActionData,
    useNavigation,
    useRouteLoaderData,
    useSubmit,
} from "react-router-dom";
import {
    empreendimentoSchema,
    type EmpreendimentoFormData,
} from "@constructo/shared";
import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";
import { exigirAcessoAoPainel } from "../../../features/auth/auth.loader";

import type { EmpreendimentoActionData } from "../../../features/empreendimentos/empreendimentos.action";
import "./FormularioEmpreendimento.css";

const valoresIniciais: EmpreendimentoFormData = {
    nome: "",
    descricao: "",
    endereco: "",
    status: "PLANEJADO",
};
export default function FormularioEmpreendimento() {
    const usuario = useRouteLoaderData<typeof exigirAcessoAoPainel>("admin-autenticado");
    const actionData = useActionData<EmpreendimentoActionData>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<EmpreendimentoFormData>({
        resolver: zodResolver(empreendimentoSchema),
        defaultValues: valoresIniciais,
    });

    const enviando =
        isSubmitting ||
        (navigation.state !== "idle" && navigation.formData != null);

    useEffect(() => {
        if (actionData?.ok) {
            reset(valoresIniciais);
            return;
        }

        if (!actionData?.campos) return;
        for (const [campo, mensagem] of Object.entries(actionData.campos)) {
            setError(campo as keyof EmpreendimentoFormData, {
                type: "server",
                message: mensagem,
            });
        }
    }, [actionData, reset, setError]);

    if (usuario?.papel !== "ADMIN") return null;

    return (
        <section className="empreendimento-card superficie-painel" aria-labelledby="novo-empreendimento-titulo">
            <CabecalhoSecao
                etiqueta="Novo cadastro"
                titulo="Cadastrar empreendimento"
                tituloId="novo-empreendimento-titulo"
                descricao="Informe os dados que identificam a raiz da estrutura da obra."
                comDivisor
            />

            <Form
                method="post"
                className="empreendimento-form"
                noValidate
                aria-busy={enviando}
                onSubmit={handleSubmit((dados) => {
                    const formulario = new FormData();
                    for (const [campo, valor] of Object.entries(dados)) {
                        if (valor !== undefined) formulario.set(campo, valor);
                    }
                    submit(formulario, { method: "post" });
                })}
            >
                <div className="campo empreendimento-form__nome">
                    <label htmlFor="nome">Nome <span aria-hidden="true">*</span></label>
                    <input
                        id="nome"
                        type="text"
                        autoComplete="organization"
                        placeholder="Ex.: Residencial Parque das Águas"
                        disabled={enviando}
                        aria-invalid={Boolean(errors.nome)}
                        aria-describedby={errors.nome ? "nome-erro" : undefined}
                        {...register("nome")}
                    />
                    {errors.nome && <span id="nome-erro" role="alert">{errors.nome.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="status">Status <span aria-hidden="true">*</span></label>
                    <select id="status" disabled={enviando} {...register("status")}>
                        <option value="PLANEJADO">Planejado</option>
                        <option value="EM_ANDAMENTO">Em andamento</option>
                        <option value="CONCLUIDO">Concluído</option>
                        <option value="INATIVO">Inativo</option>
                    </select>
                </div>

                <div className="campo empreendimento-form__largo">
                    <label htmlFor="endereco">Endereço</label>
                    <input
                        id="endereco"
                        type="text"
                        autoComplete="street-address"
                        placeholder="Rua, número, bairro, cidade e UF"
                        disabled={enviando}
                        aria-invalid={Boolean(errors.endereco)}
                        aria-describedby={errors.endereco ? "endereco-erro" : undefined}
                        {...register("endereco")}
                    />
                    {errors.endereco && <span id="endereco-erro" role="alert">{errors.endereco.message}</span>}
                </div>

                <div className="campo empreendimento-form__largo">
                    <label htmlFor="descricao">Descrição</label>
                    <textarea
                        id="descricao"
                        rows={4}
                        placeholder="Detalhes gerais do empreendimento"
                        disabled={enviando}
                        aria-invalid={Boolean(errors.descricao)}
                        aria-describedby={errors.descricao ? "descricao-erro" : undefined}
                        {...register("descricao")}
                    />
                    {errors.descricao && <span id="descricao-erro" role="alert">{errors.descricao.message}</span>}
                </div>

                {actionData?.ok && (
                    <p className="empreendimento-form__sucesso feedback-painel feedback-painel--sucesso" role="status">
                        Empreendimento “{actionData.empreendimento.nome}” cadastrado com sucesso.
                        {" "}
                        <Link to={`/admin/empreendimentos/${actionData.empreendimento.id}/editar`}>
                            Editar empreendimento
                        </Link>
                    </p>
                )}
                {actionData?.erro && (
                    <p className="empreendimento-form__erro feedback-painel feedback-painel--erro" role="alert">{actionData.erro}</p>
                )}

                <div className="empreendimento-form__acoes barra-acoes">
                    <button className="botao primario" type="submit" disabled={enviando}>
                        {enviando ? "Cadastrando..." : "Cadastrar empreendimento"}
                    </button>
                </div>
            </Form>
        </section>
    );
}
