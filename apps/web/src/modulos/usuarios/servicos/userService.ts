import type { User, UserReponse } from "@constructo/shared";

const BACKEND_URL = "http://127.0.0.1:8000/usuarios";

export async function createUser(user: User): Promise<UserReponse> {
    const newUser: User = {
        cpf: user.cpf,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        senha: user.senha,
        telefone: user.telefone,
        canal_preferido: user.canal_preferido,
        receber_atualizacoes: user.receber_atualizacoes,
        empreendimento: user.empreendimento,
        unidade: user.unidade
    };

    const response = await fetch(`${BACKEND_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
    });

    if (!response.ok) {
        throw new Error("Erro ao criar o usuário");
    }

    const result: UserReponse = await response.json();
    return result;
}

export async function listUsers(): Promise<UserReponse[]> {
    const response = await fetch(`${BACKEND_URL}/`);

    if (!response.ok) {
        throw new Error("Erro ao buscar os usuários");
    }

    const result: UserReponse[] = await response.json();
    return result;
}

export async function updateUser(user: UserReponse): Promise<UserReponse> {
    const updatedUser = {
        cpf: user.cpf,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        telefone: user.telefone,
        canal_preferido: user.canal_preferido,
        receber_atualizacoes: user.receber_atualizacoes,
        empreendimento: user.empreendimento,
        unidade: user.unidade
    };

    const response = await fetch(`${BACKEND_URL}/${user.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
    });

    if (!response.ok) {
        throw new Error("Erro ao atualizar o usuário");
    }

    const result: UserReponse = await response.json();
    return result;
}

export async function deleteUser(id: number): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Erro ao excluir o usuário");
    }
}
