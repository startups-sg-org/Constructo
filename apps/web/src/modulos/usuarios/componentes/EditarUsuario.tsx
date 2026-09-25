import { zodResolver } from "@hookform/resolvers/zod";
import {
    editUserSchema,
    type EditUserData,
} from "@constructo/shared";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    useFetcher,
} from "react-router-dom";
import type { UsuariosActionData } from "../../../router/actions/usuariosAction";
import { getUser } from "../../../services/users.service";

type EditarUsuarioProps = {
    usuarioId: number;
    aoCancelar: () => void;
};

export default function EditarUsuario({
    usuarioId,
    aoCancelar,
}: EditarUsuarioProps) {
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [carregado, setCarregado] = useState(false);
    const fetcher = useFetcher<UsuariosActionData>();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditUserData>({
        resolver: zodResolver(editUserSchema),
    });

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
        let ativo = true;

        getUser(usuarioId)
            .then((usuario) => {
                if (!ativo) return;
                reset({
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
                });
                setCarregado(true);
            })
            .catch((error: unknown) => {
                if (ativo) {
                    setErroCarregamento(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar o usuário",
                    );
                }
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => {
            ativo = false;
        };
    }, [reset, usuarioId]);

    useEffect(() => {
        if (
            fetcher.state === "idle" &&
            resultadoDestaEdicao &&
            "ok" in resultadoDestaEdicao
        ) {
            aoCancelar();
        }
    }, [aoCancelar, fetcher.state, resultadoDestaEdicao]);

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

                {carregando ? (
                    <div className="editar-usuario__estado" role="status">
                        Carregando dados do usuário...
                    </div>
                ) : !carregado ? (
                    <div className="editar-usuario__erro" role="alert">
                        {erroCarregamento}
                    </div>
                ) : null}

                {!carregando && carregado && (
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
                )}
            </section>
        </div>
    );
}
