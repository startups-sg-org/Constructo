import { z } from "zod";

export const StatusObra = {
    PLANEJAMENTO: "PLANEJAMENTO",
    EM_ANDAMENTO: "EM_ANDAMENTO",
    CONCLUIDA: "CONCLUIDA",
} as const;

export type StatusObra = (typeof StatusObra)[keyof typeof StatusObra];

const obraBaseSchema = z.object({
    nome: z
        .string()
        .trim()
        .min(3, "O nome deve ter pelo menos 3 caracteres"),

    descricao: z
        .string()
        .trim()
        .min(1, "Descrição obrigatória")
        .max(500, "Limite de caracteres excedido")
        .optional()
        .or(z.literal("")),

    endereco: z
        .string()
        .trim()
        .min(1, "Endereço obrigatório"),

    status: z.enum(["PLANEJAMENTO", "EM_ANDAMENTO", "CONCLUIDA"]),

    dataInicio: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        "Data de início inválida",
    ),

    dataFimPrevista: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        "Data de fim prevista inválida",
    ),
});

export const createObraFormSchema = obraBaseSchema
    .extend({
        latitude: z.string().trim().min(1, "Latitude obrigatória").refine(
            (val) => {
                const n = Number(val);
                return !isNaN(n) && n >= -90 && n <= 90;
            },
            "Latitude deve estar entre -90 e 90",
        ),
        longitude: z.string().trim().min(1, "Longitude obrigatória").refine(
            (val) => {
                const n = Number(val);
                return !isNaN(n) && n >= -180 && n <= 180;
            },
            "Longitude deve estar entre -180 e 180",
        ),
        contratoId: z.string().trim().min(1, "Contrato obrigatório"),
    })
    .refine(
        (data) => {
            const inicio = new Date(data.dataInicio).getTime();
            const fim = new Date(data.dataFimPrevista).getTime();
            return fim >= inicio;
        },
        {
            message: "A data de fim prevista deve ser maior ou igual à data de início",
            path: ["dataFimPrevista"],
        },
    );

export type CreateObraFormData = z.infer<typeof createObraFormSchema>;

export type CreateObraDTO = Omit<CreateObraFormData, "latitude" | "longitude" | "contratoId" | "descricao"> & {
    latitude: number;
    longitude: number;
    contratoId: number;
    descricao: string | null;
};


export type Obra = {
    id: number;
    nome: string;
    descricao: string | null;
    endereco: string;
    latitude: number;
    longitude: number;
    status: StatusObra;
    dataInicio: string;
    dataFimPrevista: string;
    contratoId: number;
};

export type ObraResponse = Obra;
