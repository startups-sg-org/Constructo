export type TipoLocalObra = "TORRE" | "BLOCO" | "PAVIMENTO" | "UNIDADE";

export type LocalObraResumo = {
    id: number;
    nome: string;
    tipo: TipoLocalObra;
    parent_id: number | null;
};

export type MarcoResumo = {
    id: number;
    nome: string;
    descricao_tecnica: string | null;
};

export type UsuarioResumo = {
    id: number;
    nome: string;
    email: string;
    papel: string;
};

export type StatusValidacaoEvidencia = "PENDENTE" | "APROVADA" | "REJEITADA";

export type Evidencia = {
    id: number;
    arquivo_url: string;
    descricao_tecnica: string | null;
    local_obra_id: number;
    marco_id: number;
    item_protocolo_id: number | null;
    capturado_por: number;
    capturado_em: string;
    criado_em: string;
    atualizado_em: string;
    local_obra: LocalObraResumo;
    marco: MarcoResumo;
    responsavel: UsuarioResumo;
    /** Campo futuro: renderizado apenas quando a API disponibilizá-lo. */
    status_validacao?: StatusValidacaoEvidencia;
};

export type FiltrosEvidencia = {
    localObraId?: number;
    marcoId?: number;
    dataCapturaInicio?: string;
    dataCapturaFim?: string;
};
