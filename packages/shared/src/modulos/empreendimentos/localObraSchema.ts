import { z } from "zod";

export const tiposLocalRaiz = ["TORRE", "BLOCO"] as const;

export const localRaizSchema = z.object({
    nome: z
        .string()
        .trim()
        .min(1, "Nome é obrigatório")
        .max(200, "Nome deve ter no máximo 200 caracteres"),
    tipo: z.enum(tiposLocalRaiz),
    ordem: z.coerce
        .number<number>()
        .int("Ordem deve ser um número inteiro")
        .min(0, "Ordem deve ser maior ou igual a zero"),
});

export type LocalRaizFormData = z.infer<typeof localRaizSchema>;

export type LocalObra = LocalRaizFormData & {
    id: number;
    empreendimento_id: number;
    parent_id: number | null;
    criado_em: string;
    atualizado_em: string;
};
