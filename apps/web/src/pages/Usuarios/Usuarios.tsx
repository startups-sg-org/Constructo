import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { UserReponse } from "@constructo/shared";
import {
    deleteUser,
    getAuthenticatedUser,
    listUsers,
    logoutUser,
    updateUser
} from "../../modulos/usuarios/servicos/userService";

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<UserReponse[]>([]);
    const [usuarioAutenticado, setUsuarioAutenticado] = useState<UserReponse | null>(null);

    useEffect(() => {
        async function buscarUsuarios() {
            try {
                const usuario = await getAuthenticatedUser();
                const result = await listUsers();

                setUsuarioAutenticado(usuario);
                setUsuarios(result);
            } catch {
                window.location.assign("/login");
            }
        }

        buscarUsuarios();
    }, []);

    async function sair() {
        try {
            await logoutUser();
            window.location.assign("/login");
        } catch {
            alert("Erro ao sair");
        }
    }

    async function editarUsuario(usuario: UserReponse) {
        const nome = window.prompt("Nome:", usuario.nome);

        if (nome === null) {
            return;
        }

        const sobrenome = window.prompt("Sobrenome:", usuario.sobrenome);

        if (sobrenome === null) {
            return;
        }

        const cpf = window.prompt("CPF:", usuario.cpf);

        if (cpf === null) {
            return;
        }

        const email = window.prompt("E-mail:", usuario.email);

        if (email === null) {
            return;
        }

        const telefone = window.prompt("Telefone:", usuario.telefone);

        if (telefone === null) {
            return;
        }

        const empreendimento = window.prompt("Empreendimento:", usuario.empreendimento);

        if (empreendimento === null) {
            return;
        }

        const unidade = window.prompt("Unidade:", usuario.unidade);

        if (unidade === null) {
            return;
        }

        const canal = window.prompt(
            "Canal preferido (email ou whatsapp):",
            usuario.canal_preferido
        );

        if (canal === null) {
            return;
        }

        if (canal !== "email" && canal !== "whatsapp") {
            alert("Informe email ou whatsapp");
            return;
        }

        const respostaAtualizacoes = window.prompt(
            "Deseja receber atualizações? (sim ou não):",
            usuario.receber_atualizacoes ? "sim" : "não"
        );

        if (respostaAtualizacoes === null) {
            return;
        }

        const resposta = respostaAtualizacoes.toLowerCase();

        if (resposta !== "sim" && resposta !== "não") {
            alert("Informe sim ou não");
            return;
        }

        const respostaAtivo = window.prompt(
            "Usuário ativo? (sim ou não):",
            usuario.ativo ? "sim" : "não"
        );

        if (respostaAtivo === null) {
            return;
        }

        const ativo = respostaAtivo.toLowerCase();

        if (ativo !== "sim" && ativo !== "não") {
            alert("Informe sim ou não");
            return;
        }

        const usuarioEditado: UserReponse = {
            id: usuario.id,
            nome: nome,
            sobrenome: sobrenome,
            cpf: cpf,
            email: email,
            telefone: telefone,
            empreendimento: empreendimento,
            unidade: unidade,
            canal_preferido: canal,
            receber_atualizacoes: resposta === "sim",
            ativo: ativo === "sim"
        };

        try {
            await updateUser(usuarioEditado);

            const result = await listUsers();
            setUsuarios(result);

            alert("Usuário atualizado com sucesso!");
        } catch {
            alert("Erro ao atualizar o usuário");
        }
    }

    async function excluirUsuario(id: number) {
        const confirmou = window.confirm("Deseja realmente excluir este usuário?");

        if (!confirmou) {
            return;
        }

        try {
            await deleteUser(id);

            const result = await listUsers();
            setUsuarios(result);

            alert("Usuário excluído com sucesso!");
        } catch {
            alert("Erro ao excluir o usuário");
        }
    }

    if (!usuarioAutenticado) {
        return <p className="verificando-sessao">Verificando sessão...</p>;
    }

    return (
        <main className="pagina-usuarios">
            <header className="cabecalho cabecalho-logado">
                <div>
                    <span className="subtitulo">Constructo</span>
                    <h1>Usuários</h1>
                    <p>Olá, {usuarioAutenticado.nome}.</p>
                </div>

                <button className="botao secundario" type="button" onClick={sair}>
                    Sair
                </button>
            </header>

            <section className="card">
                <div className="titulo-lista">
                    <h2>Usuários cadastrados</h2>

                    <Link className="botao primario" to="/cadastro">
                        Novo usuário
                    </Link>
                </div>

                {usuarios.length === 0 ? (
                    <p>Nenhum usuário cadastrado.</p>
                ) : (
                    <div className="tabela-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Contato</th>
                                    <th>Imóvel</th>
                                    <th>Atualizações</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.nome} {usuario.sobrenome}</td>
                                        <td>{usuario.cpf}</td>
                                        <td>
                                            {usuario.email}<br />
                                            {usuario.telefone}
                                        </td>
                                        <td>
                                            {usuario.empreendimento}<br />
                                            Unidade: {usuario.unidade}
                                        </td>
                                        <td>
                                            {usuario.receber_atualizacoes
                                                ? `Sim, por ${usuario.canal_preferido}`
                                                : "Não"}
                                        </td>
                                        <td>{usuario.ativo ? "Ativo" : "Inativo"}</td>
                                        <td className="acoes">
                                            <button
                                                className="botao pequeno secundario"
                                                onClick={() => editarUsuario(usuario)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className="botao pequeno perigo"
                                                onClick={() => excluirUsuario(usuario.id)}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
