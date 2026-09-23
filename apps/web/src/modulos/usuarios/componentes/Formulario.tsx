import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userSchema, type User, type userFormData} from "@constructo/shared";
import { createUser } from "../servicos/userService";

export default function Formulario() {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<userFormData>({

        resolver: zodResolver(userSchema),

    })

    async function handleSubmitUser(data: User) {
        try {
            
            const novoUsuario = await createUser(data);

            alert(`Usuario criado com sucesso! Seja bem vindo ${novoUsuario.nome + novoUsuario.sobrenome}`)

        } catch (error) {
            
            console.log("Ocorreu um erro no cadastro!");

            if(error instanceof Error){

                alert(error.message)

            } else {

                alert("Erro inesperado! Tente novamente mais tarde.")
                
            }

        }
        
    }

    return (
        <div>

            <form
                onSubmit={handleSubmit(handleSubmitUser)}
            >
                <div>
                    <div>
                        <label>
                            CPF
                        </label>
                        <input type="text" {...register("cpf")} />
                        {errors.cpf && <span>{errors.cpf.message}</span>}
                    </div>
                    <div>
                        <label>
                            Nome
                        </label>
                        <input type="text" {...register("nome")} />
                        {errors.nome && <span>{errors.nome.message}</span>}
                    </div>
                    <div>
                        <label>
                            Sobrenome
                        </label>
                        <input type="text" {...register("sobrenome")} />
                        {errors.sobrenome && <span>{errors.sobrenome.message}</span>}
                    </div>
                </div>
                <div>
                    <label>
                        Email
                    </label>
                    <input type="email" {...register("email")} />
                    {errors.email && <span>{errors.email.message}</span>}
                </div>
                <div>
                    <label>
                        Senha
                    </label>
                    <input placeholder="Senha" type="password" {...register("senha")} />
                    {errors.senha && <span>{errors.senha.message}</span>}
                </div>
                <div>
                    <label>
                        Confirme a senha
                    </label>
                    <input type="password" {...register("confirmarSenha")} />
                    {errors.confirmarSenha && <span>{errors.confirmarSenha.message}</span>}
                </div>

                <div>
                    <button type="submit">
                        Criar Conta
                    </button>
                </div>

            </form>

        </div>

    )

}