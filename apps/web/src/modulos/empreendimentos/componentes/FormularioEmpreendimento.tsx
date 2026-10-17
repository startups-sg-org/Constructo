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

import { exigirAcessoAoPainel } from "../../../features/auth/auth.loader";
import type { EmpreendimentoActionData } from "../../../features/empreendimentos/empreendimentos.action";

const valoresIniciais: EmpreendimentoFormData = {
    nome: "",
    descricao: "",
    endereco: "",
    status: "PLANEJADO",
};

const estilos = {
    raiz: "mx-auto grid w-full max-w-[1120px] gap-6 text-foreground",
    caminho: "flex flex-wrap items-center gap-2 font-code-sm text-[13px] leading-5",
    etiquetaRota: "rounded-sm border border-border-control bg-surface-muted px-2 py-0.5 text-foreground-muted",
    cabecalho: "grid gap-2 border-b border-border-muted pb-6",
    titulo: "font-headline-xl text-[36px] font-semibold leading-[44px] tracking-[-0.02em] text-foreground-strong max-md:text-[28px] max-md:leading-9",
    subtitulo: "max-w-3xl text-[16px] leading-6 text-foreground-muted",
    formulario: "ds-panel overflow-hidden",
    formularioCabecalho: "flex items-center justify-between gap-4 border-b border-border-muted bg-surface-muted px-6 py-4",
    formularioTitulo: "text-[13px] font-medium uppercase leading-5 tracking-[0.08em] text-foreground-muted",
    formularioCodigo: "rounded-sm border border-border-control bg-surface px-2 py-1 font-code-sm text-[13px] leading-5 text-foreground-muted",
    campos: "grid grid-cols-1 gap-6 p-6 md:grid-cols-3",
    campo: "grid min-w-0 gap-2",
    campoNome: "md:col-span-2",
    campoLargo: "md:col-span-3",
    label: "text-[14px] font-medium leading-5 text-foreground",
    obrigatorio: "text-accent",
    input: "ds-dark-field min-h-12! bg-canvas! px-4! py-3! text-[15px]! leading-6! placeholder:text-foreground-muted disabled:cursor-wait disabled:opacity-60",
    select: "ds-dark-field min-h-12! bg-surface-hover! px-4! py-3! text-[15px]! leading-6! disabled:cursor-wait disabled:opacity-60",
    textarea: "ds-dark-field min-h-36! resize-y! bg-canvas! px-4! py-3! text-[15px]! leading-6! placeholder:text-foreground-muted disabled:cursor-wait disabled:opacity-60",
    apoio: "text-[12px] leading-5 text-foreground-muted",
    erroCampo: "text-[13px] leading-5 text-error",
    feedbackSucesso: "md:col-span-3 rounded-md border border-success-700/40 bg-[rgb(35_134_54_/_15%)] px-4 py-3 text-[14px] leading-6 text-foreground",
    feedbackErro: "md:col-span-3 rounded-md border border-error/40 bg-[#93000a]/20 px-4 py-3 text-[14px] leading-6 text-error",
    rodape: "flex flex-wrap items-center justify-between gap-4 border-t border-border-muted bg-surface-muted px-6 py-4 max-sm:flex-col-reverse",
    cancelar: "ds-focus-ring-offset inline-flex min-h-11 items-center justify-center rounded-md border border-border-control bg-surface px-5 text-[14px] font-medium text-foreground no-underline transition-colors hover:bg-surface-hover max-sm:w-full",
    enviar: "ds-focus-ring-offset inline-flex min-h-11 items-center justify-center gap-2 rounded-md border-0 bg-[#1f6feb] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#388bfd] disabled:cursor-wait disabled:opacity-60 max-sm:w-full",
} as const;

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

    const enviando = isSubmitting || (navigation.state !== "idle" && navigation.formData != null);

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

    if (usuario?.papel !== "ADMIN" && usuario?.papel !== "GESTOR") return null;

    return (
        <section className={estilos.raiz} aria-labelledby="novo-empreendimento-titulo">
            <nav className={estilos.caminho} aria-label="breadcrumb">
                <span className="text-foreground-muted">constructo /</span>
                <Link className="ds-accent-link ds-focus-ring-offset" to="/admin/obras">empreendimentos</Link>
                <span className="text-foreground-muted" aria-hidden="true">/</span>
                <span className="text-foreground">novo</span>
                <span className={estilos.etiquetaRota}>cadastro</span>
            </nav>

            <header className={estilos.cabecalho}>
                <h1 className={estilos.titulo} id="novo-empreendimento-titulo">Criar empreendimento</h1>
                <p className={estilos.subtitulo}>
                    Cadastre os dados que identificam a obra. A estrutura física e a taxonomia poderão ser configuradas após a criação.
                </p>
            </header>

            <Form
                method="post"
                className={estilos.formulario}
                noValidate
                aria-label="Cadastrar empreendimento"
                aria-busy={enviando}
                onSubmit={handleSubmit((dados) => {
                    const formulario = new FormData();
                    for (const [campo, valor] of Object.entries(dados)) {
                        if (valor !== undefined) formulario.set(campo, valor);
                    }
                    submit(formulario, { method: "post" });
                })}
            >
                <div className={estilos.formularioCabecalho}>
                    <h2 className={estilos.formularioTitulo}>Dados do empreendimento</h2>
                    <span className={estilos.formularioCodigo}>NOVO</span>
                </div>

                <div className={estilos.campos}>
                    <div className={`${estilos.campo} ${estilos.campoNome}`}>
                        <label className={estilos.label} htmlFor="nome">
                            Nome <span className={estilos.obrigatorio} aria-hidden="true">*</span>
                        </label>
                        <input
                            className={estilos.input}
                            id="nome"
                            type="text"
                            autoComplete="organization"
                            placeholder="Ex.: Residencial Parque das Águas"
                            disabled={enviando}
                            aria-invalid={Boolean(errors.nome)}
                            aria-describedby={errors.nome ? "nome-erro" : "nome-ajuda"}
                            {...register("nome")}
                        />
                        {errors.nome
                            ? <span className={estilos.erroCampo} id="nome-erro" role="alert">{errors.nome.message}</span>
                            : <small className={estilos.apoio} id="nome-ajuda">Nome utilizado para identificar a obra em todo o sistema.</small>}
                    </div>

                    <div className={estilos.campo}>
                        <label className={estilos.label} htmlFor="status">
                            Status <span className={estilos.obrigatorio} aria-hidden="true">*</span>
                        </label>
                        <select className={estilos.select} id="status" disabled={enviando} {...register("status")}>
                            <option value="PLANEJADO">Planejado</option>
                            <option value="EM_ANDAMENTO">Em andamento</option>
                            <option value="CONCLUIDO">Concluído</option>
                            <option value="INATIVO">Inativo</option>
                        </select>
                        <small className={estilos.apoio}>Situação operacional inicial do empreendimento.</small>
                    </div>

                    <div className={`${estilos.campo} ${estilos.campoLargo}`}>
                        <label className={estilos.label} htmlFor="endereco">Endereço</label>
                        <input
                            className={estilos.input}
                            id="endereco"
                            type="text"
                            autoComplete="street-address"
                            placeholder="Rua, número, bairro, cidade e UF"
                            disabled={enviando}
                            aria-invalid={Boolean(errors.endereco)}
                            aria-describedby={errors.endereco ? "endereco-erro" : "endereco-ajuda"}
                            {...register("endereco")}
                        />
                        {errors.endereco
                            ? <span className={estilos.erroCampo} id="endereco-erro" role="alert">{errors.endereco.message}</span>
                            : <small className={estilos.apoio} id="endereco-ajuda">Informe uma localização que facilite a identificação da obra.</small>}
                    </div>

                    <div className={`${estilos.campo} ${estilos.campoLargo}`}>
                        <label className={estilos.label} htmlFor="descricao">Descrição</label>
                        <textarea
                            className={estilos.textarea}
                            id="descricao"
                            rows={5}
                            placeholder="Descreva o escopo geral, finalidade e características relevantes do empreendimento"
                            disabled={enviando}
                            aria-invalid={Boolean(errors.descricao)}
                            aria-describedby={errors.descricao ? "descricao-erro" : "descricao-ajuda"}
                            {...register("descricao")}
                        />
                        {errors.descricao
                            ? <span className={estilos.erroCampo} id="descricao-erro" role="alert">{errors.descricao.message}</span>
                            : <small className={estilos.apoio} id="descricao-ajuda">Até 1.000 caracteres.</small>}
                    </div>

                    {actionData?.ok && (
                        <p className={estilos.feedbackSucesso} role="status">
                            Empreendimento “{actionData.empreendimento.nome}” cadastrado com sucesso.{" "}
                            <Link className="ds-accent-link ds-focus-ring-offset" to={`/admin/empreendimentos/${actionData.empreendimento.id}/editar`}>
                                Editar empreendimento
                            </Link>
                        </p>
                    )}
                    {actionData?.erro && (
                        <p className={estilos.feedbackErro} role="alert">{actionData.erro}</p>
                    )}
                </div>

                <footer className={estilos.rodape}>
                    <span className="text-[13px] leading-5 text-foreground-muted">
                        <span className={estilos.obrigatorio}>*</span> Campos obrigatórios
                    </span>
                    <div className="flex items-center gap-3 max-sm:w-full max-sm:flex-col-reverse">
                        <Link className={estilos.cancelar} to="/admin/obras">Cancelar</Link>
                        <button className={estilos.enviar} type="submit" disabled={enviando}>
                            <i className="bi bi-plus-lg" aria-hidden="true" />
                            {enviando ? "Cadastrando..." : "Cadastrar empreendimento"}
                        </button>
                    </div>
                </footer>
            </Form>
        </section>
    );
}
