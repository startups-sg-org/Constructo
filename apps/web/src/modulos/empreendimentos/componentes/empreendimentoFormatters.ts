import type { Empreendimento } from "@constructo/shared";

const rotulosStatus: Record<Empreendimento["status"], string> = {
    PLANEJADO: "Planejado",
    EM_ANDAMENTO: "Em andamento",
    CONCLUIDO: "Concluído",
    INATIVO: "Inativo",
};

const tonsStatus = {
    PLANEJADO: "informativo",
    EM_ANDAMENTO: "alerta",
    CONCLUIDO: "sucesso",
    INATIVO: "neutro",
} as const;

const classesStatus: Record<Empreendimento["status"], string> = {
    PLANEJADO: "ds-status ds-status--informativo",
    EM_ANDAMENTO: "ds-status ds-status--alerta",
    CONCLUIDO: "ds-status ds-status--sucesso",
    INATIVO: "ds-status ds-status--neutro",
};

export function formatarDataEmpreendimento(data: string): string {
    const dataCriacao = new Date(data);

    if (Number.isNaN(dataCriacao.getTime())) return "Data indisponível";

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(dataCriacao);
}

export function obterRotuloStatus(status: Empreendimento["status"]): string {
    return rotulosStatus[status];
}

export function obterTomStatus(status: Empreendimento["status"]) {
    return tonsStatus[status];
}

export function obterClassesStatus(status: Empreendimento["status"]): string {
    return classesStatus[status];
}
