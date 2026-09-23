import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userSchema, type User, type userFormData } from "@constructo/shared";
import { createUser } from "../servicos/userService";

export default function Formulario() {
    const {
        register,
        handleSubmit,
        formState: { errors }
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
            window.location.assign("/usuarios");
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Erro inesperado! Tente novamente mais tarde.");
            }
        }
    }

    return (
        <section className="card">
            <h2>Novo usuário</h2>

            <form className="usuario-form" onSubmit={handleSubmit(handleSubmitUser)}>
                <div className="campo">
                    <label htmlFor="cpf">CPF</label>
                    <input id="cpf" type="text" {...register("cpf")} />
                    {errors.cpf && <span>{errors.cpf.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" type="text" {...register("nome")} />
                    {errors.nome && <span>{errors.nome.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="sobrenome">Sobrenome</label>
                    <input id="sobrenome" type="text" {...register("sobrenome")} />
                    {errors.sobrenome && <span>{errors.sobrenome.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" {...register("email")} />
                    {errors.email && <span>{errors.email.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="telefone">Telefone</label>
                    <input id="telefone" type="tel" {...register("telefone")} />
                    {errors.telefone && <span>{errors.telefone.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="empreendimento">Empreendimento</label>
                    <input id="empreendimento" type="text" {...register("empreendimento")} />
                    {errors.empreendimento && <span>{errors.empreendimento.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="unidade">Unidade</label>
                    <input id="unidade" type="text" {...register("unidade")} />
                    {errors.unidade && <span>{errors.unidade.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="canal_preferido">Canal preferido</label>
                    <select id="canal_preferido" {...register("canal_preferido")}>
                        <option value="email">E-mail</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>

                <div className="campo campo-checkbox">
                    <label>
                        <input type="checkbox" {...register("receber_atualizacoes")} />
                        Receber atualizações da construção
                    </label>
                </div>

                <div className="campo">
                    <label htmlFor="senha">Senha</label>
                    <input id="senha" type="password" {...register("senha")} />
                    {errors.senha && <span>{errors.senha.message}</span>}
                </div>

                <div className="campo">
                    <label htmlFor="confirmarSenha">Confirme a senha</label>
                    <input id="confirmarSenha" type="password" {...register("confirmarSenha")} />
                    {errors.confirmarSenha && <span>{errors.confirmarSenha.message}</span>}
                </div>

                <button className="botao primario" type="submit">
                    Criar usuário
                </button>
            </form>
        </section>
    );
}
