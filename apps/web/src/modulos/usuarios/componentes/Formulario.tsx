import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { userSchema, type User, type userFormData } from "@constructo/shared";
import AuthCard from "../../../componentes/AuthCard/AuthCard";
import BotaoAutenticacao from "../../../componentes/BotaoAutenticacao/BotaoAutenticacao";
import CampoSenha from "../../../componentes/CampoSenha/CampoSenha";
import { createUser } from "../servicos/userService";
import "./Formulario.css";

export default function Formulario() {
    const [erroCadastro, setErroCadastro] = useState("");
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<userFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            canal_preferido: "email",
            receber_atualizacoes: true
        }
    });

    async function handleSubmitUser(data: User) {
        try {
            setErroCadastro("");
            await createUser(data);
            navigate("/login", { replace: true });
        } catch (error) {
            setErroCadastro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível criar sua conta. Tente novamente mais tarde."
            );
        }
    }

    return (
        <AuthCard
            titulo="Crie sua conta"
            descricao="Preencha seus dados para acompanhar sua obra com clareza e segurança."
            chamada="Comece agora"
            acoes={
                <>
                    Já tem uma conta? <Link to="/login">Entrar na conta</Link>
                </>
            }
        >
            <form
                className="usuario-form cadastro-form"
                noValidate
                aria-busy={isSubmitting}
                onSubmit={handleSubmit(handleSubmitUser)}
            >
                <section className="cadastro-form__secao" aria-labelledby="dados-pessoais-titulo">
                    <header className="cadastro-form__secao-cabecalho">
                        <span aria-hidden="true">1</span>
                        <div>
                            <h2 id="dados-pessoais-titulo">Dados pessoais</h2>
                            <p>Informações para identificar e contatar você.</p>
                        </div>
                    </header>

                    <div className="cadastro-form__grade">
                        <div className="campo">
                            <label htmlFor="nome">Nome</label>
                            <input id="nome" type="text" placeholder="Seu nome" autoComplete="given-name" {...register("nome")} disabled={isSubmitting} aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? "nome-erro" : undefined} />
                            {errors.nome && <span id="nome-erro" className="campo__erro" role="alert">{errors.nome.message}</span>}
                        </div>

                        <div className="campo">
                            <label htmlFor="sobrenome">Sobrenome</label>
                            <input id="sobrenome" type="text" placeholder="Seu sobrenome" autoComplete="family-name" {...register("sobrenome")} disabled={isSubmitting} aria-invalid={Boolean(errors.sobrenome)} aria-describedby={errors.sobrenome ? "sobrenome-erro" : undefined} />
                            {errors.sobrenome && <span id="sobrenome-erro" className="campo__erro" role="alert">{errors.sobrenome.message}</span>}
                        </div>

                        <div className="campo cadastro-form__campo--largo">
                            <label htmlFor="email">E-mail</label>
                            <input id="email" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" {...register("email")} disabled={isSubmitting} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-erro" : undefined} />
                            {errors.email && <span id="email-erro" className="campo__erro" role="alert">{errors.email.message}</span>}
                        </div>

                        <div className="campo">
                            <label htmlFor="cpf">CPF</label>
                            <input id="cpf" type="text" placeholder="000.000.000-00" inputMode="numeric" autoComplete="off" {...register("cpf")} disabled={isSubmitting} aria-invalid={Boolean(errors.cpf)} aria-describedby={errors.cpf ? "cpf-erro" : undefined} />
                            {errors.cpf && <span id="cpf-erro" className="campo__erro" role="alert">{errors.cpf.message}</span>}
                        </div>

                        <div className="campo">
                            <label htmlFor="telefone">Telefone</label>
                            <input id="telefone" type="tel" placeholder="(00) 00000-0000" inputMode="tel" autoComplete="tel" {...register("telefone")} disabled={isSubmitting} aria-invalid={Boolean(errors.telefone)} aria-describedby={errors.telefone ? "telefone-erro" : undefined} />
                            {errors.telefone && <span id="telefone-erro" className="campo__erro" role="alert">{errors.telefone.message}</span>}
                        </div>
                    </div>
                </section>

                <section className="cadastro-form__secao" aria-labelledby="obra-titulo">
                    <header className="cadastro-form__secao-cabecalho">
                        <span aria-hidden="true">2</span>
                        <div>
                            <h2 id="obra-titulo">Sua obra</h2>
                            <p>Vincule sua conta ao empreendimento.</p>
                        </div>
                    </header>

                    <div className="cadastro-form__grade">
                        <div className="campo">
                            <label htmlFor="empreendimento">Empreendimento</label>
                            <input id="empreendimento" type="text" placeholder="Nome do empreendimento" {...register("empreendimento")} disabled={isSubmitting} aria-invalid={Boolean(errors.empreendimento)} aria-describedby={errors.empreendimento ? "empreendimento-erro" : undefined} />
                            {errors.empreendimento && <span id="empreendimento-erro" className="campo__erro" role="alert">{errors.empreendimento.message}</span>}
                        </div>

                        <div className="campo">
                            <label htmlFor="unidade">Unidade</label>
                            <input id="unidade" type="text" placeholder="Ex.: Bloco A, apto. 101" {...register("unidade")} disabled={isSubmitting} aria-invalid={Boolean(errors.unidade)} aria-describedby={errors.unidade ? "unidade-erro" : undefined} />
                            {errors.unidade && <span id="unidade-erro" className="campo__erro" role="alert">{errors.unidade.message}</span>}
                        </div>
                    </div>
                </section>

                <section className="cadastro-form__secao" aria-labelledby="preferencias-titulo">
                    <header className="cadastro-form__secao-cabecalho">
                        <span aria-hidden="true">3</span>
                        <div>
                            <h2 id="preferencias-titulo">Preferências</h2>
                            <p>Escolha como quer receber as novidades da obra.</p>
                        </div>
                    </header>

                    <div className="cadastro-form__grade cadastro-form__grade--preferencias">
                        <div className="campo">
                            <label htmlFor="canal_preferido">Canal preferido</label>
                            <select id="canal_preferido" {...register("canal_preferido")} disabled={isSubmitting}>
                                <option value="email">E-mail</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>

                        <div className="campo-checkbox cadastro-form__atualizacoes">
                            <label>
                                <input type="checkbox" {...register("receber_atualizacoes")} disabled={isSubmitting} />
                                <span>Quero receber atualizações da construção</span>
                            </label>
                        </div>
                    </div>
                </section>

                <section className="cadastro-form__secao" aria-labelledby="seguranca-titulo">
                    <header className="cadastro-form__secao-cabecalho">
                        <span aria-hidden="true">4</span>
                        <div>
                            <h2 id="seguranca-titulo">Segurança</h2>
                            <p>Use entre 8 e 16 caracteres para proteger sua conta.</p>
                        </div>
                    </header>

                    <div className="cadastro-form__grade">
                        <CampoSenha
                            label="Senha"
                            placeholder="Crie uma senha segura"
                            autoComplete="new-password"
                            {...register("senha")}
                            disabled={isSubmitting}
                            mensagemErro={errors.senha?.message}
                        />

                        <CampoSenha
                            label="Confirmar senha"
                            placeholder="Digite a senha novamente"
                            autoComplete="new-password"
                            {...register("confirmarSenha")}
                            disabled={isSubmitting}
                            mensagemErro={errors.confirmarSenha?.message}
                        />
                    </div>
                </section>

                {erroCadastro && (
                    <p className="mensagem-erro cadastro-form__erro" role="alert">
                        <span className="cadastro-form__erro-icone" aria-hidden="true">!</span>
                        <span>{erroCadastro}</span>
                    </p>
                )}

                <BotaoAutenticacao
                    type="submit"
                    carregando={isSubmitting}
                    textoCarregando="Criando conta..."
                >
                    Criar minha conta
                </BotaoAutenticacao>
            </form>
        </AuthCard>
    );
}
