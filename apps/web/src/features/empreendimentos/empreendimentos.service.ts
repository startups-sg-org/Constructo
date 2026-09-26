import { apiRequest, type ServiceRequestOptions } from "../../services/api";

export type StatusEmpreendimento =
  | "PLANEJADO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "INATIVO";

export type Empreendimento = {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string;
  endereco: string;
  status: StatusEmpreendimento;
  criado_em: string;
  atualizado_em: string;
};

export function getEmpreendimentoPorId(
  empreendimentoId: string,
  options?: ServiceRequestOptions,
): Promise<Empreendimento> {
  return apiRequest<Empreendimento>(
    `/empreendimentos/${encodeURIComponent(empreendimentoId)}`,
    { signal: options?.signal },
  );
}
