import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    loginSchema,
    type loginFormData
} from "@constructo/shared";
import {
    getAuthenticatedUser,
    loginUser
} from "../../modulos/usuarios/servicos/userService";
import AuthCard from "../../componentes/AuthCard/AuthCard";

type EstadoNavegacao = {
    origem?: {
        pathname?: string;
        search?: string;
        hash?: string;
    };
};

export default function Login() {
    const [erro, setErro] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const origem = (location.state as EstadoNavegacao | null)?.origem;
    const destinoAposLogin = origem?.pathname?.startsWith("/admin")
        ? `${origem.pathname}${origem.search ?? ""}${origem.hash ?? ""}`
        : "/admin";

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
                await getAuthenticatedUser();
                navigate(destinoAposLogin, { replace: true });
            } catch {
                // Sem sessão ativa: o formulário de login permanece disponível.
            }
        }

        verificarSessao();
    }, [destinoAposLogin, navigate]);

    async function handleLogin(data: loginFormData) {
        try {
            setErro("");

            await loginUser(data.email, data.senha);
            navigate(destinoAposLogin, { replace: true });
        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível realizar o login");
            }
        }
    }

    return (
        <AuthCard
            titulo="Bem-vindo de volta"
            descricao="Informe seu e-mail e sua senha para continuar."
            chamada="Acesse sua conta"
            compacto
            acoes={<>Não tem uma conta? <Link to="/cadastro">Crie uma</Link></>}
        >
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
        </AuthCard>
    );
}
