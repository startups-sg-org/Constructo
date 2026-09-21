import type { User } from "@constructo/shared";

export async function createUser(user: User): Promise<User> {

    const newUser: User = {
        cpf: user.cpf,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        senha: user.senha
    }

    const response = await fetch("http://127.0.0.1:8000/api/users", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(newUser)

    });

    const resultado = await response.json();
    
    return resultado;
}





