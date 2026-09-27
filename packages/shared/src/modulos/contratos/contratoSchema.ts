import { z } from "zod";

export type Contrato = {
    id: number;
    numero: string;
    descricao: string;
    obraVinculadaId: number | null;
};

export type ContratoResponse = Contrato;

export const contratoIdSchema = z
    .string()
    .trim()
    .min(1, "Contrato obrigatório");
