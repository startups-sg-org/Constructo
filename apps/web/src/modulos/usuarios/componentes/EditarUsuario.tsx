import { zodResolver } from "@hookform/resolvers/zod";
import {
    editUserSchema,
    type EditUserData,
    type Empreendimento,
    type EstruturaLocal,
    type UserReponse,
} from "@constructo/shared";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useFetcher } from "react-router-dom";
import { listarEmpreendimentos, obterEstruturaFisica } from "../../../features/empreendimentos/empreendimentos.service";
import type { UsuariosActionData } from "../../../features/usuarios/usuarios.action";

type EditarUsuarioProps = {
    usuario: UserReponse;
    aoCancelar: () => void;
};

function listarUnidades(locais: EstruturaLocal[]): EstruturaLocal[] {
    return locais.flatMap((local) => [
        ...(local.tipo === "UNIDADE" ? [local] : []),
        ...listarUnidades(local.filhos),
    ]);
}

function mensagemDeErro(erro: unknown, fallback: string): string {
    return erro instanceof Error && erro.message ? erro.message : fallback;
}

export default function EditarUsuario({
    usuario,
    aoCancelar,
}: EditarUsuarioProps) {
    const fetcher = useFetcher<UsuariosActionData>();
    const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
    const [unidades, setUnidades] = useState<EstruturaLocal[]>([]);
    const [carregandoEmpreendimentos, setCarregandoEmpreendimentos] = useState(usuario.papel === "COMPRADOR");
    const [unidadesCarregadasPara, setUnidadesCarregadasPara] = useState<number | null>(null);
    const [erroEmpreendimentos, setErroEmpreendimentos] = useState("");
    const [erroUnidades, setErroUnidades] = useState<{ empreendimentoId: number; mensagem: string } | null>(null);
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<EditUserData>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            cpf: usuario.cpf,
            nome: usuario.nome,
            sobrenome: usuario.sobrenome,
            email: usuario.email,
            telefone: usuario.telefone,
            canal_preferido: usuario.canal_preferido as "email" | "whatsapp",
            receber_atualizacoes: usuario.receber_atualizacoes,
            empreendimento: usuario.empreendimento,
            unidade: usuario.unidade,
            ativo: usuario.ativo,
        },
    });
    const usuarioId = usuario.id;
    const empreendimentoSelecionado = useWatch({ control, name: "empreendimento" });
    const unidadeSelecionada = useWatch({ control, name: "unidade" });
    const empreendimentoAtual = empreendimentos.find(
        (empreendimento) => empreendimento.nome === empreendimentoSelecionado,
    );
    const unidadesDisponiveis = unidadesCarregadasPara === empreendimentoAtual?.id ? unidades : [];
    const carregandoUnidades = Boolean(empreendimentoAtual && unidadesCarregadasPara !== empreendimentoAtual.id);
    const erroUnidadesAtual = erroUnidades && erroUnidades.empreendimentoId === empreendimentoAtual?.id
        ? erroUnidades.mensagem
        : "";

    const resultadoDestaEdicao =
        fetcher.data?.intent === "update" && fetcher.data.usuarioId === usuarioId
            ? fetcher.data
            : undefined;
    const erroAction =
        resultadoDestaEdicao && "erro" in resultadoDestaEdicao
            ? resultadoDestaEdicao
            : undefined;
    const salvando = isSubmitting || fetcher.state !== "idle";

    useEffect(() => {
        if (
            fetcher.state === "idle" &&
            resultadoDestaEdicao &&
            "ok" in resultadoDestaEdicao
        ) {
            aoCancelar();
        }
    }, [aoCancelar, fetcher.state, resultadoDestaEdicao]);

    useEffect(() => {
        if (usuario.papel !== "COMPRADOR") return;

        let montado = true;
        void listarEmpreendimentos()
            .then((resultado) => {
                if (montado) setEmpreendimentos(resultado);
            })
            .catch((erro: unknown) => {
                if (montado) setErroEmpreendimentos(mensagemDeErro(erro, "Não foi possível carregar os empreendimentos."));
            })
            .finally(() => {
                if (montado) setCarregandoEmpreendimentos(false);
            });

        return () => {
            montado = false;
        };
    }, [usuario.papel]);

    useEffect(() => {
        if (usuario.papel !== "COMPRADOR" || !empreendimentoAtual) return;

        let montado = true;
        void obterEstruturaFisica(empreendimentoAtual.id)
            .then((estrutura) => {
                if (!montado) return;
                setUnidades(listarUnidades(estrutura));
                setUnidadesCarregadasPara(empreendimentoAtual.id);
            })
            .catch((erro: unknown) => {
                if (!montado) return;
                setUnidades([]);
                setUnidadesCarregadasPara(empreendimentoAtual.id);
                setErroUnidades({
                    empreendimentoId: empreendimentoAtual.id,
                    mensagem: mensagemDeErro(erro, "Não foi possível carregar as unidades."),
                });
            });

        return () => {
            montado = false;
        };
    }, [empreendimentoAtual, usuario.papel]);

    function mensagemCampo(campo: keyof EditUserData) {
        return errors[campo]?.message ?? erroAction?.campos?.[campo];
    }

    return (
        <div className="editar-usuario__fundo" role="presentation">
            <section
                aria-labelledby="editar-usuario-titulo"
                aria-modal="true"
                className="editar-usuario"
                role="dialog"
            >
                <div className="editar-usuario__cabecalho">
                    <div>
                        <span className="subtitulo">Gerenciar acesso</span>
                        <h2 id="editar-usuario-titulo">Editar usuário</h2>
                    </div>
                    <button
                        aria-label="Fechar edição"
                        className="editar-usuario__fechar"
                        disabled={salvando}
                        onClick={aoCancelar}
                        type="button"
                    >
                        ×
                    </button>
                </div>
                <fetcher.Form
                    className="editar-usuario__form"
                    method="post"
                    aria-busy={salvando}
                    onSubmit={handleSubmit((data) => {
                        const formulario = new FormData();
                        formulario.set("intent", "update");
                        formulario.set("usuarioId", String(usuarioId));
                        for (const [campo, valor] of Object.entries(data)) {
                            if (typeof valor !== "boolean" || valor) {
                                formulario.set(campo, String(valor));
                            }
                        }
                        fetcher.submit(formulario, { method: "post" });
                    })}
                >
                    <input name="intent" type="hidden" value="update" />
                    <input name="usuarioId" type="hidden" value={usuarioId} />
                    <div className="campo">
                        <label htmlFor="editar-cpf">CPF</label>
                        <input id="editar-cpf" {...register("cpf")} disabled={salvando} />
                        {mensagemCampo("cpf") && <span>{mensagemCampo("cpf")}</span>}
                    </div>
                    <div className="campo">
                        <label htmlFor="editar-nome">Nome</label>
                        <input id="editar-nome" {...register("nome")} disabled={salvando} />
                        {mensagemCampo("nome") && <span>{mensagemCampo("nome")}</span>}
                    </div>
                    <div className="campo">
                        <label htmlFor="editar-sobrenome">Sobrenome</label>
                        <input id="editar-sobrenome" {...register("sobrenome")} disabled={salvando} />
                        {mensagemCampo("sobrenome") && <span>{mensagemCampo("sobrenome")}</span>}
                    </div>
                    <div className="campo">
                        <label htmlFor="editar-email">E-mail</label>
                        <input id="editar-email" type="email" {...register("email")} disabled={salvando} />
                        {mensagemCampo("email") && <span>{mensagemCampo("email")}</span>}
                    </div>
                    <div className="campo">
                        <label htmlFor="editar-telefone">Telefone</label>
                        <input id="editar-telefone" type="tel" {...register("telefone")} disabled={salvando} />
                        {mensagemCampo("telefone") && <span>{mensagemCampo("telefone")}</span>}
                    </div>
                    {usuario.papel === "COMPRADOR" ? (
                        <>
                            <div className="campo">
                                <label htmlFor="editar-empreendimento">Empreendimento</label>
                                <select
                                    id="editar-empreendimento"
                                    {...register("empreendimento")}
                                    disabled={salvando || carregandoEmpreendimentos}
                                    value={empreendimentoSelecionado ?? ""}
                                    onChange={(evento) => {
                                        setValue("empreendimento", evento.target.value, { shouldDirty: true });
                                        setValue("unidade", "", { shouldDirty: true });
                                    }}
                                >
                                    <option value="">Selecione um empreendimento</option>
                                    {empreendimentoSelecionado && !empreendimentoAtual && (
                                        <option value={empreendimentoSelecionado}>{empreendimentoSelecionado}</option>
                                    )}
                                    {empreendimentos.map((empreendimento) => (
                                        <option key={empreendimento.id} value={empreendimento.nome}>{empreendimento.nome}</option>
                                    ))}
                                </select>
                                {erroEmpreendimentos && <span role="alert">{erroEmpreendimentos}</span>}
                                {mensagemCampo("empreendimento") && <span>{mensagemCampo("empreendimento")}</span>}
                            </div>
                            <div className="campo">
                                <label htmlFor="editar-unidade">Unidade</label>
                                <select
                                    id="editar-unidade"
                                    {...register("unidade")}
                                    disabled={salvando || !empreendimentoAtual || carregandoUnidades}
                                    value={unidadeSelecionada ?? ""}
                                >
                                    <option value="">{carregandoUnidades ? "Carregando unidades..." : "Selecione uma unidade"}</option>
                                    {unidadeSelecionada && !unidadesDisponiveis.some((unidade) => unidade.nome === unidadeSelecionada) && (
                                        <option value={unidadeSelecionada}>{unidadeSelecionada}</option>
                                    )}
                                    {unidadesDisponiveis.map((unidade) => (
                                        <option key={unidade.id} value={unidade.nome}>{unidade.nome}</option>
                                    ))}
                                </select>
                                {erroUnidadesAtual && <span role="alert">{erroUnidadesAtual}</span>}
                                {mensagemCampo("unidade") && <span>{mensagemCampo("unidade")}</span>}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="campo">
                                <label htmlFor="editar-empreendimento">Empreendimento</label>
                                <input id="editar-empreendimento" {...register("empreendimento")} disabled={salvando} />
                                {mensagemCampo("empreendimento") && <span>{mensagemCampo("empreendimento")}</span>}
                            </div>
                            <div className="campo">
                                <label htmlFor="editar-unidade">Unidade</label>
                                <input id="editar-unidade" {...register("unidade")} disabled={salvando} />
                                {mensagemCampo("unidade") && <span>{mensagemCampo("unidade")}</span>}
                            </div>
                        </>
                    )}
                    <div className="campo">
                        <label htmlFor="editar-canal">Canal preferido</label>
                        <select id="editar-canal" {...register("canal_preferido")} disabled={salvando}>
                            <option value="email">E-mail</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </div>
                    <div className="editar-usuario__opcoes">
                        <label>
                            <input type="checkbox" {...register("receber_atualizacoes")} disabled={salvando} />
                            Receber atualizações
                        </label>
                        <label>
                            <input type="checkbox" {...register("ativo")} disabled={salvando} />
                            Usuário ativo
                        </label>
                    </div>

                    {erroAction?.erro && (
                        <div className="editar-usuario__erro" role="alert">
                            {erroAction.erro}
                        </div>
                    )}

                    <div className="editar-usuario__acoes">
                        <button
                            className="botao secundario"
                            disabled={salvando}
                            onClick={aoCancelar}
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button className="botao primario" disabled={salvando} type="submit">
                            {salvando ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </div>
                </fetcher.Form>
            </section>
        </div>
    );
}
