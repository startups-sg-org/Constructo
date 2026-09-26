import { useState } from "react";
import {
    useFetcher,
    useLoaderData,
} from "react-router-dom";
import type { UsuariosActionData } from "../../../features/usuarios/usuarios.action";
import { carregarUsuarios } from "../../../features/usuarios/usuarios.loader";
import EditarUsuario from "./EditarUsuario";
import "./ListaUsuarios.css";

export default function ListaUsuarios() {
    const usuarios = useLoaderData<typeof carregarUsuarios>();
    const fetcherExclusao = useFetcher<UsuariosActionData>();
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<number | null>(null);
    const usuarioSelecionado = usuarios.find(
        (usuario) => usuario.id === usuarioEmEdicao,
    );
    const usuarioSendoExcluido =
        fetcherExclusao.state !== "idle" &&
        fetcherExclusao.formData?.get("intent") === "delete"
            ? Number(fetcherExclusao.formData.get("usuarioId"))
            : null;
    const erroAcao =
        fetcherExclusao.data && "erro" in fetcherExclusao.data
            ? fetcherExclusao.data.erro
            : undefined;

    return (
        <div className="lista-usuarios">
            {erroAcao && (
                <div className="lista-usuarios__erro" role="alert">
                    {erroAcao}
                </div>
            )}

            {usuarios.length === 0 ? (
                <div className="lista-usuarios__estado">Nenhum usuário cadastrado.</div>
            ) : (
                <>
                    <div className="lista-usuarios__resumo">
                        {usuarios.length} {usuarios.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
                    </div>
                    <div className="lista-usuarios__tabela-container">
                        <table className="lista-usuarios__tabela">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Sobrenome</th>
                                    <th>Telefone</th>
                                    <th>E-mail</th>
                                    <th>Status</th>
                                    <th>Papel</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td data-label="Nome">{usuario.nome}</td>
                                        <td data-label="Sobrenome">{usuario.sobrenome}</td>
                                        <td data-label="Telefone">{formatarTelefone(usuario.telefone)}</td>
                                        <td data-label="E-mail">{usuario.email}</td>
                                        <td data-label="Papel">
                                            <fetcherExclusao.Form
                                                method="post"
                                                className="lista-usuarios__papel"
                                            >
                                                <input name="intent" type="hidden" value="update-role" />
                                                <input name="usuarioId" type="hidden" value={usuario.id} />
                                                <select
                                                    name="papel"
                                                    defaultValue={usuario.papel}
                                                    aria-label={`Papel de ${usuario.nome}`}
                                                >
                                                    <option value="ADMIN">Administrador</option>
                                                    <option value="GESTOR">Gestor</option>
                                                    <option value="COMPRADOR">Comprador</option>
                                                </select>
                                                <button
                                                    className="botao secundario"
                                                    type="submit"
                                                >
                                                    Salvar
                                                </button>
                                            </fetcherExclusao.Form>
                                        </td>
                                        <td data-label="Status">
                                            <span
                                                className={`lista-usuarios__status lista-usuarios__status--${usuario.ativo ? "ativo" : "inativo"}`}
                                            >
                                                {usuario.ativo ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                        <td data-label="Ações">
                                            <div className="lista-usuarios__acoes">
                                                <button
                                                    className="botao secundario lista-usuarios__editar"
                                                    disabled={usuarioSendoExcluido !== null}
                                                    onClick={() => setUsuarioEmEdicao(usuario.id)}
                                                    type="button"
                                                >
                                                    Editar
                                                </button>
                                                <fetcherExclusao.Form
                                                    method="post"
                                                    aria-busy={usuarioSendoExcluido === usuario.id}
                                                    onSubmit={(event) => {
                                                        if (!window.confirm(`Excluir ${usuario.nome} ${usuario.sobrenome}? Esta ação não pode ser desfeita.`)) {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <input name="intent" type="hidden" value="delete" />
                                                    <input name="usuarioId" type="hidden" value={usuario.id} />
                                                    <button
                                                        className="botao lista-usuarios__excluir"
                                                        disabled={usuarioSendoExcluido !== null}
                                                        type="submit"
                                                    >
                                                        {usuarioSendoExcluido === usuario.id ? "Excluindo..." : "Excluir"}
                                                    </button>
                                                </fetcherExclusao.Form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {usuarioSelecionado && (
                <EditarUsuario
                    usuario={usuarioSelecionado}
                    aoCancelar={() => setUsuarioEmEdicao(null)}
                />
            )}
        </div>
    );
}

function formatarTelefone(telefone: string): string {
    const digitos = telefone.replace(/\D/g, "");

    if (digitos.length === 11) {
        return digitos.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (digitos.length === 10) {
        return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return telefone;
}
