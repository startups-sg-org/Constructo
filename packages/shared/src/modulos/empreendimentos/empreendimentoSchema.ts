import { z } from "zod";

export const statusEmpreendimento = [
    "PLANEJADO",
    "EM_ANDAMENTO",
    "CONCLUIDO",
    "INATIVO",
] as const;

export const empreendimentoSchema = z.object({
    nome: z
        .string()
        .trim()
        .min(1, "Nome é obrigatório")
        .max(200, "Nome deve ter no máximo 200 caracteres"),
    descricao: z
        .string()
        .trim()
        .max(1000, "Descrição deve ter no máximo 1000 caracteres")
        .optional(),
    endereco: z
        .string()
        .trim()
        .max(500, "Endereço deve ter no máximo 500 caracteres")
        .optional(),
    status: z.enum(statusEmpreendimento),
});

export type EmpreendimentoFormData = z.infer<typeof empreendimentoSchema>;

export type Empreendimento = EmpreendimentoFormData & {
    id: number;
    criado_em: string;
};
