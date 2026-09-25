import { zodResolver } from "@hookform/resolvers/zod";
import {
    editUserSchema,
    type EditUserData,
    type UserReponse
} from "@constructo/shared";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getUser, updateUser } from "../../../services/users.service";

type EditarUsuarioProps = {
    usuarioId: number;
    aoCancelar: () => void;
    aoSalvar: (usuario: UserReponse) => void;
};

export default function EditarUsuario({
    usuarioId,
    aoCancelar,
    aoSalvar
}: EditarUsuarioProps) {
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [carregado, setCarregado] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<EditUserData>({
        resolver: zodResolver(editUserSchema)
    });

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
                    ativo: usuario.ativo
                });
                setCarregado(true);
            })
            .catch((error: unknown) => {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar o usuário"
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

    async function salvar(dados: EditUserData) {
        setSalvando(true);
        setErro("");

        try {
            aoSalvar(await updateUser(usuarioId, dados));
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o usuário"
            );
        } finally {
            setSalvando(false);
        }
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
                    <div className="editar-usuario__erro" role="alert">{erro}</div>
                ) : null}

                {!carregando && carregado && (
                    <form className="editar-usuario__form" onSubmit={handleSubmit(salvar)}>
                        <div className="campo">
                            <label htmlFor="editar-cpf">CPF</label>
                            <input id="editar-cpf" {...register("cpf")} />
                            {errors.cpf && <span>{errors.cpf.message}</span>}
                        </div>
                        <div className="campo">
                            <label htmlFor="editar-nome">Nome</label>
                            <input id="editar-nome" {...register("nome")} />
                            {errors.nome && <span>{errors.nome.message}</span>}
                        </div>
                        <div className="campo">
                            <label htmlFor="editar-sobrenome">Sobrenome</label>
                            <input id="editar-sobrenome" {...register("sobrenome")} />
                            {errors.sobrenome && <span>{errors.sobrenome.message}</span>}
                        </div>
                        <div className="campo">
                            <label htmlFor="editar-email">E-mail</label>
                            <input id="editar-email" type="email" {...register("email")} />
                            {errors.email && <span>{errors.email.message}</span>}
                        </div>
                        <div className="campo">
                            <label htmlFor="editar-telefone">Telefone</label>
                            <input id="editar-telefone" type="tel" {...register("telefone")} />
                            {errors.telefone && <span>{errors.telefone.message}</span>}
                        </div>
                        <div className="campo">
                            <label htmlFor="editar-empreendimento">Empreendimento</label>
                            <input id="editar-empreendimento" {...register("empreendimento")} />
                            {errors.empreendimento && <span>{errors.empreendimento.message}</span>}
                        </div>
                        <div className="campo">
                            <label htmlFor="editar-unidade">Unidade</label>
                            <input id="editar-unidade" {...register("unidade")} />
                            {errors.unidade && <span>{errors.unidade.message}</span>}
                        </div>
                        <div className="campo">
                            <label htmlFor="editar-canal">Canal preferido</label>
                            <select id="editar-canal" {...register("canal_preferido")}>
                                <option value="email">E-mail</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>
                        <div className="editar-usuario__opcoes">
                            <label>
                                <input type="checkbox" {...register("receber_atualizacoes")} />
                                Receber atualizações
                            </label>
                            <label>
                                <input type="checkbox" {...register("ativo")} />
                                Usuário ativo
                            </label>
                        </div>

                        {erro && <div className="editar-usuario__erro" role="alert">{erro}</div>}

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
                    </form>
                )}
            </section>
        </div>
    );
}
