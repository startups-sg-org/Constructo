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

/**
 * Contrato retornado por `GET /empreendimentos/{id}/evidencias`.
 *
 * Cada registro representa uma única evidência e uma única imagem, indicada
 * por `arquivo_url`. Local, marco e responsável já são devolvidos expandidos
 * pela API e devem ser a fonte dos rótulos apresentados na interface.
 *
 * O backend atual não fornece status de validação, contrato vinculado,
 * compartilhamento nem agrupamento de várias imagens. Esses elementos da
 * referência visual não pertencem a este tipo e não devem ser simulados no
 * front-end.
 */
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
};

/**
 * Filtros processados pelo backend na listagem de evidências.
 *
 * Busca textual, status de validação e paginação não são parâmetros da API;
 * quando necessários, devem ser aplicados no cliente sobre a resposta.
 */
export type FiltrosEvidencia = {
    localObraId?: number;
    marcoId?: number;
    dataCapturaInicio?: string;
    dataCapturaFim?: string;
};
