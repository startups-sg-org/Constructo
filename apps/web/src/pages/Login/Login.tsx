import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type loginFormData } from "@constructo/shared";
import {
    getAuthenticatedUser,
    loginUser,
} from "../../modulos/usuarios/servicos/userService";
import AuthCard from "../../componentes/AuthCard/AuthCard";
import BotaoAutenticacao from "../../componentes/BotaoAutenticacao/BotaoAutenticacao";
import CampoSenha from "../../componentes/CampoSenha/CampoSenha";
import "./Login.css";

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
        formState: { errors, isSubmitting },
    } = useForm<loginFormData>({
        resolver: zodResolver(loginSchema),
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
            titulo="Entre na sua conta"
            descricao="Use seus dados de acesso para continuar gerenciando suas obras."
            chamada="Bem-vindo de volta"
            compacto
            acoes={
                <>
                    Ainda não tem uma conta?{" "}
                    <Link to="/cadastro">Cadastre-se</Link>
                </>
            }
        >
            <form
                className="login-form"
                aria-busy={isSubmitting}
                onSubmit={handleSubmit(handleLogin)}
            >
                <div className="login-form__campos">
                    <div className="campo">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            autoComplete="email"
                            {...register("email")}
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email ? "email-erro" : undefined
                            }
                        />
                        {errors.email && (
                            <span
                                id="email-erro"
                                className="campo__erro"
                                role="alert"
                            >
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <CampoSenha
                        label="Senha"
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        {...register("senha")}
                        disabled={isSubmitting}
                        mensagemErro={errors.senha?.message}
                    />
                </div>

                {erro && (
                    <p className="mensagem-erro login-form__erro" role="alert">
                        <span
                            className="login-form__erro-icone"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <span>{erro}</span>
                    </p>
                )}

                <BotaoAutenticacao
                    type="submit"
                    carregando={isSubmitting}
                    textoCarregando="Entrando..."
                >
                    Entrar
                </BotaoAutenticacao>
            </form>
        </AuthCard>
    );
}
