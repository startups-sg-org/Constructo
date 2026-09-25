import { Form, Link, useActionData, useNavigation, useSubmit } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type loginFormData } from "@constructo/shared";
import type { LoginActionData } from "../../features/auth/auth.action";
import AuthCard from "../../componentes/AuthCard/AuthCard";
import BotaoAutenticacao from "../../componentes/BotaoAutenticacao/BotaoAutenticacao";
import CampoSenha from "../../componentes/CampoSenha/CampoSenha";
import "./Login.css";

export default function Login() {
    const actionData = useActionData<LoginActionData>();
    const navigation = useNavigation();
    const submit = useSubmit();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<loginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const enviando =
        isSubmitting ||
        (navigation.state !== "idle" && navigation.formData != null);

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
            <Form
                method="post"
                className="login-form"
                noValidate
                aria-busy={enviando}
                onSubmit={handleSubmit((data) => {
                    const formulario = new FormData();
                    formulario.set("email", data.email);
                    formulario.set("senha", data.senha);
                    submit(formulario, { method: "post" });
                })}
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
                            disabled={enviando}
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
                        disabled={enviando}
                        mensagemErro={errors.senha?.message}
                    />
                </div>

                {actionData?.erro && (
                    <p className="mensagem-erro login-form__erro" role="alert">
                        <span
                            className="login-form__erro-icone"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <span>{actionData.erro}</span>
                    </p>
                )}

                <BotaoAutenticacao
                    type="submit"
                    carregando={enviando}
                    textoCarregando="Entrando..."
                >
                    Entrar
                </BotaoAutenticacao>
            </Form>
        </AuthCard>
    );
}
