import { z } from "zod";

export const StatusProtocolo = {
    SEM_PROTOCOLO: "SEM_PROTOCOLO",
    INCOMPLETO: "INCOMPLETO",
    COMPLETO: "COMPLETO",
} as const;

export type StatusProtocolo = (typeof StatusProtocolo)[keyof typeof StatusProtocolo];

export const itemProtocoloSchema = z.object({
    id: z.union([z.string(), z.number()]),
    nome: z.string().trim().min(1, "Nome do item é obrigatório"),
    descricao: z.string().optional(),
    obrigatorio: z.boolean().optional().default(true),
    atendido: z.boolean().optional().default(false),
    evidenciaId: z.union([z.string(), z.number()]).nullable().optional(),
    arquivoUrl: z.string().optional(),
    capturadoEm: z.string().optional(),
});

export type ItemProtocolo = {
    id: string | number;
    nome: string;
    descricao?: string;
    obrigatorio?: boolean;
    atendido?: boolean;
    evidenciaId?: string | number | null;
    arquivoUrl?: string;
    capturadoEm?: string;
};


export const protocoloEvidenciasSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    marcoId: z.union([z.string(), z.number()]).optional(),
    nome: z.string().optional(),
    descricao: z.string().optional(),
    itens: z.array(itemProtocoloSchema),
});

export type ProtocoloEvidencias = {
    id?: string | number;
    marcoId?: string | number;
    nome?: string;
    descricao?: string;
    itens: ItemProtocolo[];
};

export type ResumoProtocolo = {

    status: StatusProtocolo;
    totalNecessario: number;
    totalRegistrado: number;
    pendencias: ItemProtocolo[];
    itens: ItemProtocolo[];
    percentualAtendido: number;
};

export type MarcoComProtocolo = {
    id: number | string;
    nome: string;
    descricaoTecnica?: string | null;
    descricaoCliente?: string | null;
    statusMarco?: "NAO_INICIADO" | "EM_ANDAMENTO" | "CONCLUIDO";
    protocolo?: ProtocoloEvidencias | null;
};

/**
 * Calcula o estado e o resumo detalhado do protocolo de evidências de um marco.
 */
export function calcularResumoProtocolo(
    protocolo?: ProtocoloEvidencias | null,
    evidenciasRegistradasIds?: Array<string | number>
): ResumoProtocolo {
    if (!protocolo || !protocolo.itens || protocolo.itens.length === 0) {
        return {
            status: StatusProtocolo.SEM_PROTOCOLO,
            totalNecessario: 0,
            totalRegistrado: 0,
            pendencias: [],
            itens: [],
            percentualAtendido: 0,
        };
    }

    const idsRegistradosSet = new Set(
        evidenciasRegistradasIds ? evidenciasRegistradasIds.map(String) : []
    );

    const itensProcessados: ItemProtocolo[] = protocolo.itens.map((item) => {
        const atendido =
            Boolean(item.atendido) ||
            Boolean(item.evidenciaId) ||
            Boolean(item.arquivoUrl) ||
            idsRegistradosSet.has(String(item.id));

        return {
            ...item,
            atendido,
        };
    });

    const totalNecessario = itensProcessados.length;
    const atendidos = itensProcessados.filter((item) => item.atendido);
    const pendencias = itensProcessados.filter((item) => !item.atendido);
    const totalRegistrado = atendidos.length;

    let status: StatusProtocolo;
    if (totalRegistrado >= totalNecessario) {
        status = StatusProtocolo.COMPLETO;
    } else {
        status = StatusProtocolo.INCOMPLETO;
    }

    const percentualAtendido = totalNecessario > 0
        ? Math.round((totalRegistrado / totalNecessario) * 100)
        : 0;

    return {
        status,
        totalNecessario,
        totalRegistrado,
        pendencias,
        itens: itensProcessados,
        percentualAtendido,
    };
}

/**
 * Calcula apenas o status do protocolo com base em contagens numéricas.
 */
export function calcularStatusProtocolo(
    totalNecessario: number,
    totalRegistrado: number
): StatusProtocolo {
    if (totalNecessario <= 0) {
        return StatusProtocolo.SEM_PROTOCOLO;
    }
    if (totalRegistrado >= totalNecessario) {
        return StatusProtocolo.COMPLETO;
    }
    return StatusProtocolo.INCOMPLETO;
}
