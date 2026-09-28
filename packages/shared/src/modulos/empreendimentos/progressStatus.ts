export const progressStatus = [
    "NAO_INICIADO",
    "EM_ANDAMENTO",
    "CONCLUIDO",
] as const;

export type ProgressStatus = (typeof progressStatus)[number];
