import type { User, UserReponse } from "@constructo/shared";

const BACKEND_URL = `http://${window.location.hostname}:8000`;

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

    const response = await fetch(`${BACKEND_URL}/usuarios/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail ?? "Erro ao criar o usuário");
    }

    const result: UserReponse = await response.json();
    return result;
}

export async function loginUser(email: string, senha: string): Promise<UserReponse> {
    const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.detail);
    }

    return result.usuario;
}

export async function getAuthenticatedUser(): Promise<UserReponse> {
    const response = await fetch(`${BACKEND_URL}/sessao`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Usuário não autenticado");
    }

    const result: UserReponse = await response.json();
    return result;
}

export async function getUsersCount(): Promise<number> {
    const response = await fetch(`${BACKEND_URL}/usuarios/quantidade`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Erro ao consultar a quantidade de usuários");
    }

    const result: { total: number } = await response.json();
    return result.total;
}

export async function logoutUser(): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Erro ao sair");
    }
}
