import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { carregarUsuarios } from "../../../router/loaders/usuariosLoader";
import EditarUsuario from "./EditarUsuario";
import "./ListaUsuarios.css";

export default function ListaUsuarios() {
    const usuariosCarregados = useLoaderData<typeof carregarUsuarios>();
    const [usuarios, setUsuarios] = useState(usuariosCarregados);
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<number | null>(null);

    if (usuarios.length === 0) {
        return <div className="lista-usuarios__estado">Nenhum usuário cadastrado.</div>;
    }

    return (
        <div className="lista-usuarios">
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
                                <td data-label="Status">
                                    <span
                                        className={`lista-usuarios__status lista-usuarios__status--${
                                            usuario.ativo ? "ativo" : "inativo"
                                        }`}
                                    >
                                        {usuario.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td data-label="Ações">
                                    <button
                                        className="botao secundario lista-usuarios__editar"
                                        onClick={() => setUsuarioEmEdicao(usuario.id)}
                                        type="button"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {usuarioEmEdicao !== null && (
                <EditarUsuario
                    usuarioId={usuarioEmEdicao}
                    aoCancelar={() => setUsuarioEmEdicao(null)}
                    aoSalvar={(usuarioAtualizado) => {
                        setUsuarios((atuais) =>
                            atuais.map((usuario) =>
                                usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario
                            )
                        );
                        setUsuarioEmEdicao(null);
                    }}
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
