import { apiRequest, type ServiceRequestOptions } from "../../services/api";

/**
 * Cliente HTTP do domínio de evidências.
 *
 * Centraliza contratos TypeScript e chamadas à API para upload, protocolos,
 * itens de protocolo e registros de evidência. Componentes, loaders e actions
 * devem usar estas funções em vez de conhecer caminhos HTTP diretamente.
 */
export const TAMANHO_MAXIMO_EVIDENCIA = 5 * 1024 * 1024;
export const TIPOS_EVIDENCIA_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

export type EvidenciaUpload = {
    id: number;
    empreendimento_id: number;
    nome: string;
    caminho: string;
    url: string;
    tamanho: number;
    tipo_mime: string;
    criado_em: string;
};

export type ItemProtocolo = {
    id: number;
    protocolo_id: number;
    nome: string;
    descricao: string | null;
    obrigatorio: boolean;
    ordem: number;
    criado_em: string;
    atualizado_em: string;
};

export type ProtocoloEvidencia = {
    id: number;
    marco_id: number;
    nome: string;
    descricao: string | null;
    quantidade_minima: number;
    itens: ItemProtocolo[];
    criado_em: string;
    atualizado_em: string;
};

export type ProtocoloEvidenciaStatus = {
    protocolo_id: number;
    quantidade_minima: number;
    evidencias_registradas: number;
    quantidade_atendida: boolean;
    itens_pendentes: Array<Pick<ItemProtocolo, "id" | "nome" | "ordem">>;
    itens_obrigatorios_atendidos: boolean;
};

export type ProtocoloEvidenciaDados = Pick<
    ProtocoloEvidencia,
    "nome" | "descricao" | "quantidade_minima"
>;

export type ProtocoloEvidenciaResumo = Omit<ProtocoloEvidencia, "itens">;

export type ItemProtocoloDados = Pick<
    ItemProtocolo,
    "nome" | "descricao" | "obrigatorio" | "ordem"
>;

export type EvidenciaItem = {
    id: number;
    progresso_marco_id: number;
    item_protocolo_id: number | null;
    arquivo_url: string;
    descricao: string | null;
    capturado_em: string;
    usuario_id: number;
};

/** Envia o arquivo de evidência e devolve seus metadados persistidos. */
export function enviarEvidencia(
    empreendimentoId: number,
    arquivo: File,
    options?: ServiceRequestOptions,
): Promise<EvidenciaUpload> {
    const dados = new FormData();
    dados.append("empreendimento_id", String(empreendimentoId));
    dados.append("file", arquivo);

    return apiRequest<EvidenciaUpload>("/api/evidences/upload", {
        method: "POST",
        body: dados,
        signal: options?.signal,
    });
}

/** Lista os protocolos de evidência de um marco, já acompanhados de seus itens. */
export function listarProtocolosEvidencia(
    empreendimentoId: number,
    marcoId: number,
    options?: ServiceRequestOptions,
): Promise<ProtocoloEvidencia[]> {
    return apiRequest<ProtocoloEvidencia[]>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia`,
        { signal: options?.signal },
    );
}

/** Cria um protocolo de evidência para o marco informado. */
export function criarProtocoloEvidencia(
    empreendimentoId: number,
    marcoId: number,
    dados: ProtocoloEvidenciaDados,
    options?: ServiceRequestOptions,
): Promise<ProtocoloEvidenciaResumo> {
    return apiRequest<ProtocoloEvidenciaResumo>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia`,
        { method: "POST", body: JSON.stringify(dados), signal: options?.signal },
    );
}

/** Atualiza os campos informados de um protocolo pertencente ao marco. */
export function atualizarProtocoloEvidencia(
    empreendimentoId: number,
    marcoId: number,
    protocoloId: number,
    dados: Partial<ProtocoloEvidenciaDados>,
    options?: ServiceRequestOptions,
): Promise<ProtocoloEvidenciaResumo> {
    return apiRequest<ProtocoloEvidenciaResumo>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia/${protocoloId}`,
        { method: "PATCH", body: JSON.stringify(dados), signal: options?.signal },
    );
}

/** Adiciona um item ao protocolo na ordem e com a obrigatoriedade definidas. */
export function criarItemProtocolo(
    empreendimentoId: number,
    marcoId: number,
    protocoloId: number,
    dados: ItemProtocoloDados,
    options?: ServiceRequestOptions,
): Promise<ItemProtocolo> {
    return apiRequest<ItemProtocolo>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia/${protocoloId}/itens`,
        { method: "POST", body: JSON.stringify(dados), signal: options?.signal },
    );
}

/** Atualiza os campos informados de um item do protocolo. */
export function atualizarItemProtocolo(
    empreendimentoId: number,
    marcoId: number,
    protocoloId: number,
    itemId: number,
    dados: Partial<ItemProtocoloDados>,
    options?: ServiceRequestOptions,
): Promise<ItemProtocolo> {
    return apiRequest<ItemProtocolo>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia/${protocoloId}/itens/${itemId}`,
        { method: "PATCH", body: JSON.stringify(dados), signal: options?.signal },
    );
}

/** Exclui definitivamente um item do protocolo. */
export function removerItemProtocolo(
    empreendimentoId: number,
    marcoId: number,
    protocoloId: number,
    itemId: number,
    options?: ServiceRequestOptions,
): Promise<void> {
    return apiRequest<void>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia/${protocoloId}/itens/${itemId}`,
        { method: "DELETE", signal: options?.signal },
    );
}

/** Consulta se o protocolo foi atendido em um progresso específico do marco. */
export function consultarStatusProtocolo(
    empreendimentoId: number,
    marcoId: number,
    protocoloId: number,
    progressoMarcoId: number,
    options?: ServiceRequestOptions,
): Promise<ProtocoloEvidenciaStatus> {
    return apiRequest<ProtocoloEvidenciaStatus>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia/${protocoloId}/status?progresso_marco_id=${progressoMarcoId}`,
        { signal: options?.signal },
    );
}

/** Registra uma evidência previamente enviada em um item do protocolo. */
export function registrarEvidenciaNoItem(
    empreendimentoId: number,
    marcoId: number,
    protocoloId: number,
    itemId: number,
    dados: Omit<EvidenciaItem, "id" | "item_protocolo_id" | "usuario_id">,
    options?: ServiceRequestOptions,
): Promise<EvidenciaItem> {
    return apiRequest<EvidenciaItem>(
        `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia/${protocoloId}/itens/${itemId}/evidencias`,
        {
            method: "POST",
            body: JSON.stringify(dados),
            signal: options?.signal,
        },
    );
}

/**
 * Executa o fluxo completo de evidência de item: upload do arquivo seguido do
 * registro da referência no item do protocolo.
 */
export async function enviarEvidenciaParaItem(
    empreendimentoId: number,
    marcoId: number,
    protocoloId: number,
    itemId: number,
    progressoMarcoId: number,
    arquivo: File,
    options?: ServiceRequestOptions,
): Promise<EvidenciaItem> {
    const upload = await enviarEvidencia(empreendimentoId, arquivo, options);
    return registrarEvidenciaNoItem(
        empreendimentoId,
        marcoId,
        protocoloId,
        itemId,
        {
            progresso_marco_id: progressoMarcoId,
            arquivo_url: upload.url,
            descricao: null,
            capturado_em: new Date().toISOString(),
        },
        options,
    );
}
