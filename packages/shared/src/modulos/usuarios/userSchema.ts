import { z } from "zod"

export const userSchema = z.object({
    
    cpf: z
        .string()
        .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'O CPF deve estar no formato 000.000.000-00 ou conter apenas 11 números')
    ,

    nome: z
        .string()
        .trim()
        .min(1, 'Nome obrigatório')
        .min(3, 'Precisa ter pelo menos 3 caracteres')
        .max(20, 'Pode ter no máximo 20 caracteres'),

    sobrenome: z
        .string()
        .toLowerCase()
        .trim()
        .min(1, 'Sobrenome obrigatório')
        .min(3, 'Precisa ter pelo menos 3 caracteres')
        .max(50, 'Pode ter no máximo 50 caracteres'),

    email: z
        .email('Email obrigatório')
        .toLowerCase()

    ,
    telefone: z
        .string()
        .min(10, 'Telefone inválido')
        .max(15, 'Telefone inválido'),

    canal_preferido: z.enum(['email', 'whatsapp']),

    receber_atualizacoes: z.boolean(),

    empreendimento: z
        .string()
        .trim()
        .min(1, 'Empreendimento obrigatório'),

    unidade: z
        .string()
        .trim()
        .min(1, 'Unidade obrigatória'),

    senha: z
        .string()
        .min(1, 'Senha obrigatória')
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .max(16, 'Limite de caracteres excedido')
    ,

    confirmarSenha: z.
        string()

}).refine((data) => data.senha === data.confirmarSenha, { message: 'As senhas não coincidem', path: ['confirmarSenha'] })

export type userFormData = z.infer<typeof userSchema>

export type User = Omit<userFormData, "confirmarSenha">

export const editUserSchema = userSchema.omit({
    senha: true,
    confirmarSenha: true
}).extend({
    ativo: z.boolean()
})

export type EditUserData = z.infer<typeof editUserSchema>


export const loginSchema = z.object({
    email: z
        .email('E-mail obrigatório')
        .toLowerCase(),

    senha: z
        .string()
        .min(1, 'Senha obrigatória')
})

export type loginFormData = z.infer<typeof loginSchema>


export type UserReponse = {
    id: number,
    cpf: string,
    nome: string,
    sobrenome: string,
    email: string,
    telefone: string,
    canal_preferido: string,
    receber_atualizacoes: boolean,
    empreendimento: string,
    unidade: string,
    ativo: boolean,
}
