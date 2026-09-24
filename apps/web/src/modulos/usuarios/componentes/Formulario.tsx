import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { userSchema, type User, type userFormData } from "@constructo/shared";
import AuthCard from "../../../componentes/AuthCard/AuthCard";
import { createUser } from "../servicos/userService";

export default function Formulario() {
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
            const novoUsuario = await createUser(data);

            alert(`Usuário criado com sucesso! Seja bem-vindo, ${novoUsuario.nome}.`);
            window.location.assign("/login");
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Erro inesperado! Tente novamente mais tarde.");
            }
        }
    }

    return (
        <AuthCard
            titulo="Crie sua conta"
            descricao="Preencha seus dados para acompanhar sua obra com clareza e segurança."
            chamada="Comece agora"
            acoes={<>Já tem uma conta? <Link to="/login">Entre</Link></>}
        >
            <form className="usuario-form" aria-busy={isSubmitting} onSubmit={handleSubmit(handleSubmitUser)}>
                <div className="campo">
                    <label htmlFor="cpf">CPF</label>
                    <input id="cpf" type="text" placeholder="000.000.000-00" inputMode="numeric" autoComplete="off" {...register("cpf")} disabled={isSubmitting} aria-invalid={Boolean(errors.cpf)} aria-describedby={errors.cpf ? "cpf-erro" : undefined} />
                    {errors.cpf && <span id="cpf-erro" className="campo__erro" role="alert">{errors.cpf.message}</span>}
                </div>

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

                <div className="campo">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" {...register("email")} disabled={isSubmitting} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-erro" : undefined} />
                    {errors.email && <span id="email-erro" className="campo__erro" role="alert">{errors.email.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="telefone">Telefone</label>
                    <input id="telefone" type="tel" placeholder="(00) 00000-0000" inputMode="tel" autoComplete="tel" {...register("telefone")} disabled={isSubmitting} aria-invalid={Boolean(errors.telefone)} aria-describedby={errors.telefone ? "telefone-erro" : undefined} />
                    {errors.telefone && <span id="telefone-erro" className="campo__erro" role="alert">{errors.telefone.message}</span>}
                </div>

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

                <div className="campo">
                    <label htmlFor="canal_preferido">Canal preferido</label>
                    <select id="canal_preferido" {...register("canal_preferido")} disabled={isSubmitting}>
                        <option value="email">E-mail</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>

                <div className="campo campo-checkbox">
                    <label>
                        <input type="checkbox" {...register("receber_atualizacoes")} disabled={isSubmitting} />
                        Receber atualizações da construção
                    </label>
                </div>

                <div className="campo">
                    <label htmlFor="senha">Senha</label>
                    <input id="senha" type="password" placeholder="Crie uma senha segura" autoComplete="new-password" {...register("senha")} disabled={isSubmitting} aria-invalid={Boolean(errors.senha)} aria-describedby={errors.senha ? "senha-erro" : undefined} />
                    {errors.senha && <span id="senha-erro" className="campo__erro" role="alert">{errors.senha.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="confirmarSenha">Confirme a senha</label>
                    <input id="confirmarSenha" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" {...register("confirmarSenha")} disabled={isSubmitting} aria-invalid={Boolean(errors.confirmarSenha)} aria-describedby={errors.confirmarSenha ? "confirmar-senha-erro" : undefined} />
                    {errors.confirmarSenha && <span id="confirmar-senha-erro" className="campo__erro" role="alert">{errors.confirmarSenha.message}</span>}
                </div>

                <button className="botao primario" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                </button>
            </form>
        </AuthCard>
    );
}
