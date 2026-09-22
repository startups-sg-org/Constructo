import type { User, UserReponse } from "@constructo/shared";

export async function createUser(user: User): Promise<UserReponse> {

    const newUser: User = {
        cpf: user.cpf,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        senha: user.senha
    }

    const response = await fetch("http://127.0.0.1:8000/api/usuarios", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
    });

    if(!response.ok){
        throw new Error ("Erro ao enviar os dados")
    }

    const result: UserReponse = await response.json();
    return result;

}
