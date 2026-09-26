import { z } from "zod";

export const tiposLocalRaiz = ["TORRE", "BLOCO"] as const;
export const tiposLocal = [...tiposLocalRaiz, "PAVIMENTO", "UNIDADE"] as const;

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

export const pavimentoSchema = localRaizSchema.pick({ nome: true, ordem: true });

export type PavimentoFormData = z.infer<typeof pavimentoSchema>;

export const unidadeSchema = pavimentoSchema;

export type UnidadeFormData = z.infer<typeof unidadeSchema>;

export type LocalObra = PavimentoFormData & {
    id: number;
    empreendimento_id: number;
    parent_id: number | null;
    tipo: (typeof tiposLocal)[number];
    criado_em: string;
    atualizado_em: string;
};
