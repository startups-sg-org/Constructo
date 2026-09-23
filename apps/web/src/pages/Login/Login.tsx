import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    loginSchema,
    type loginFormData,
    type UserReponse
} from "@constructo/shared";
import {
    getAuthenticatedUser,
    loginUser,
    logoutUser
} from "../../modulos/usuarios/servicos/userService";

export default function Login() {
    const [erro, setErro] = useState("");
    const [usuario, setUsuario] = useState<UserReponse | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<loginFormData>({
        resolver: zodResolver(loginSchema)
    });

    useEffect(() => {
        async function verificarSessao() {
            try {
                const usuarioAutenticado = await getAuthenticatedUser();
                setUsuario(usuarioAutenticado);
            } catch {
                setUsuario(null);
            }
        }

        verificarSessao();
    }, []);

    async function handleLogin(data: loginFormData) {
        try {
            setErro("");

            const usuarioAutenticado = await loginUser(data.email, data.senha);
            setUsuario(usuarioAutenticado);
        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível realizar o login");
            }
        }
    }

    async function sair() {
        await logoutUser();
        setUsuario(null);
    }

    if (usuario) {
        return (
            <main className="pagina-login">
                <section className="card">
                    <span className="subtitulo">Constructo</span>
                    <h1>Login realizado</h1>
                    <p className="mensagem-sucesso">
                        Olá, {usuario.nome}! Sua autenticação foi concluída com sucesso.
                    </p>
                    <p>O próximo painel será criado posteriormente.</p>

                    <button className="botao secundario" type="button" onClick={sair}>
                        Sair
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="pagina-login">
            <section className="card">
                <span className="subtitulo">Constructo</span>
                <h1>Entrar</h1>
                <p>Informe seu e-mail e sua senha.</p>

                <form className="login-form" onSubmit={handleSubmit(handleLogin)}>
                    <div className="campo">
                        <label htmlFor="email">E-mail</label>
                        <input id="email" type="email" {...register("email")} />
                        {errors.email && <span>{errors.email.message}</span>}
                    </div>

                    <div className="campo">
                        <label htmlFor="senha">Senha</label>
                        <input id="senha" type="password" {...register("senha")} />
                        {errors.senha && <span>{errors.senha.message}</span>}
                    </div>

                    {erro && <p className="mensagem-erro">{erro}</p>}

                    <button className="botao primario" type="submit">
                        Entrar
                    </button>
                </form>

                <p className="link-conta">
                    Não tem uma conta? <Link to="/cadastro">Crie uma</Link>
                </p>
            </section>
        </main>
    );
}
