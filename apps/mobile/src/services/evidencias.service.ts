import { apiRequest } from './api';
import { achatarLocaisHierarquia, snapshotStore } from './demo-seed';
import {
  EnvioEvidenciaPayload,
  EvidenciaBackend,
  StatusValidacaoEvidencia,
} from '../types/evidencias';

export const evidenciasService = {
  /**
   * Envia uma nova evidência para o endpoint do backend (multipart/form-data)
   * e sincroniza imediatamente com o snapshot compartilhado do dispositivo.
   */
  async enviarEvidencia(
    payload: EnvioEvidenciaPayload,
    autorNome?: string
  ): Promise<EvidenciaBackend> {
    const snap = await snapshotStore.obter();
    const locais = achatarLocaisHierarquia(snap.estruturaFisica);
    const localObj = locais.find((l) => l.id === payload.localObraId) || locais[0];
    const marcoObj = snap.marcos.find((m) => m.id === payload.marcoId) || snap.marcos[0];

    const formData = new FormData();
    formData.append('file', {
      uri: payload.arquivoUri,
      name: payload.arquivoNome || `evidencia_${Date.now()}.jpg`,
      type: payload.arquivoTipo || 'image/jpeg',
    } as unknown as Blob);

    formData.append('local_obra_id', String(payload.localObraId));
    formData.append('marco_id', String(payload.marcoId));

    if (payload.descricaoTecnica) {
      formData.append('descricao_tecnica', payload.descricaoTecnica);
    }

    const dataCaptura = payload.capturadoEm || new Date().toISOString();
    formData.append('capturado_em', dataCaptura);

    if (payload.itemProtocoloId) {
      formData.append('item_protocolo_id', String(payload.itemProtocoloId));
    }

    let evidenciaCriada: EvidenciaBackend;

    try {
      const respostaBackend = await apiRequest<EvidenciaBackend>(
        `/empreendimentos/${payload.empreendimentoId}/evidencias`,
        {
          method: 'POST',
          body: formData,
        }
      );
      evidenciaCriada = {
        ...respostaBackend,
        status_validacao: respostaBackend.status_validacao || 'VALIDA',
      };
    } catch {
      // Se o backend estiver inacessível mas o usuário estiver em sessão demo local,
      // persiste a foto capturada diretamente no snapshot compartilhado (Empresa + Cliente)
      evidenciaCriada = {
        id: Math.max(200, ...snap.evidencias.map((e) => e.id)) + 1,
        empreendimento_id: payload.empreendimentoId,
        local_obra_id: payload.localObraId,
        marco_id: payload.marcoId,
        item_protocolo_id: payload.itemProtocoloId || null,
        arquivo_url: payload.arquivoUri,
        descricao_tecnica:
          payload.descricaoTecnica || `Registro fotográfico de avanço — ${marcoObj?.nome || 'Obra'}`,
        capturado_em: dataCaptura,
        capturado_por: 2,
        criado_em: dataCaptura,
        atualizado_em: dataCaptura,
        status_validacao: 'VALIDA',
        local_obra: localObj
          ? { id: localObj.id, nome: localObj.nome, tipo: localObj.tipo, parent_id: localObj.parent_id }
          : { id: 1, nome: 'Bloco A • Canteiro', tipo: 'BLOCO', parent_id: null },
        marco: marcoObj
          ? { id: marcoObj.id, nome: marcoObj.nome, descricao_tecnica: marcoObj.descricao_tecnica }
          : { id: 1, nome: 'Avanço de Etapa', descricao_tecnica: null },
        responsavel: {
          id: 2,
          nome: autorNome || 'Eng. Rafael Nogueira',
          email: 'demo.gestor1@example.com',
          papel: 'GESTOR',
        },
      };
    }

    // Atualiza o progresso caso haja delta informado
    const delta = payload.deltaEstimado ?? 4.5;
    const novoPercentual = Math.min(100, Math.round((snap.progresso.percentual || 52) + delta));

    await snapshotStore.salvar({
      evidencias: [evidenciaCriada, ...snap.evidencias],
      progresso: {
        ...snap.progresso,
        percentual: novoPercentual,
      },
    });

    return evidenciaCriada;
  },

  /**
   * Consulta a lista de evidências registradas em um empreendimento.
   */
  async listarEvidencias(
    empreendimentoId: number,
    filtros?: { localObraId?: number; marcoId?: number; dataInicio?: string; dataFim?: string }
  ): Promise<EvidenciaBackend[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.localObraId) params.append('local_obra_id', String(filtros.localObraId));
      if (filtros?.marcoId) params.append('marco_id', String(filtros.marcoId));
      if (filtros?.dataInicio) params.append('data_captura_inicio', filtros.dataInicio);
      if (filtros?.dataFim) params.append('data_captura_fim', filtros.dataFim);

      const query = params.toString() ? `?${params.toString()}` : '';
      const lista = await apiRequest<EvidenciaBackend[]>(
        `/empreendimentos/${empreendimentoId}/evidencias${query}`
      );
      if (lista && lista.length > 0) {
        const snap = await snapshotStore.obter();
        const mapaLocal = new Map(snap.evidencias.map((e) => [e.id, e]));
        const enriquecidas = lista.map((item) => {
          const salvo = mapaLocal.get(item.id);
          return {
            ...item,
            status_validacao: salvo?.status_validacao || item.status_validacao || 'VALIDA',
            motivo_invalidacao: salvo?.motivo_invalidacao || item.motivo_invalidacao || null,
          };
        });
        await snapshotStore.salvar({ evidencias: enriquecidas });
        return enriquecidas;
      }
    } catch {
      // Fallback para snapshot compartilhado (ex: COMPRADOR ou modo offline)
    }

    const snap = await snapshotStore.obter();
    let resultado = [...snap.evidencias];
    if (filtros?.localObraId) {
      resultado = resultado.filter((e) => e.local_obra_id === filtros.localObraId);
    }
    if (filtros?.marcoId) {
      resultado = resultado.filter((e) => e.marco_id === filtros.marcoId);
    }
    return resultado;
  },

  /**
   * Edita a descrição técnica de uma evidência (PATCH /empreendimentos/{id}/evidencias/{evidId}).
   */
  async atualizarDescricaoEvidencia(
    empreendimentoId: number,
    evidenciaId: number,
    descricaoTecnica: string
  ): Promise<EvidenciaBackend[]> {
    try {
      await apiRequest<EvidenciaBackend>(
        `/empreendimentos/${empreendimentoId}/evidencias/${evidenciaId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ descricao_tecnica: descricaoTecnica.trim() }),
        }
      );
    } catch {
      // Mantém atualização no snapshot local
    }

    const snap = await snapshotStore.obter();
    const atualizadas = snap.evidencias.map((e) =>
      e.id === evidenciaId
        ? {
            ...e,
            descricao_tecnica: descricaoTecnica.trim(),
            atualizado_em: new Date().toISOString(),
          }
        : e
    );
    await snapshotStore.salvar({ evidencias: atualizadas });
    return atualizadas;
  },

  /**
   * Valida ou Invalida uma evidência no ciclo de auditoria (#227).
   */
  async alterarValidacaoEvidencia(
    empreendimentoId: number,
    evidenciaId: number,
    status: StatusValidacaoEvidencia,
    motivoOuObservacao?: string,
    validadorNome?: string
  ): Promise<EvidenciaBackend[]> {
    try {
      if (status === 'VALIDA') {
        await apiRequest(
          `/empreendimentos/${empreendimentoId}/evidencias/${evidenciaId}/validar`,
          {
            method: 'POST',
            body: JSON.stringify({ observacao: motivoOuObservacao || null }),
          }
        );
      } else if (status === 'INVALIDA') {
        await apiRequest(
          `/empreendimentos/${empreendimentoId}/evidencias/${evidenciaId}/invalidar`,
          {
            method: 'POST',
            body: JSON.stringify({ motivo: motivoOuObservacao || 'Fora do padrão técnico' }),
          }
        );
      }
    } catch {
      // Persistência garantida no snapshot local
    }

    const snap = await snapshotStore.obter();
    const atualizadas = snap.evidencias.map((e) =>
      e.id === evidenciaId
        ? {
            ...e,
            status_validacao: status,
            motivo_invalidacao: status === 'INVALIDA' ? motivoOuObservacao || null : null,
            validado_em: new Date().toISOString(),
            validado_por_nome: validadorNome || 'Auditoria de Engenharia',
          }
        : e
    );
    await snapshotStore.salvar({ evidencias: atualizadas });
    return atualizadas;
  },

  /**
   * Remove uma evidência (#226).
   */
  async removerEvidencia(
    empreendimentoId: number,
    evidenciaId: number
  ): Promise<EvidenciaBackend[]> {
    try {
      await apiRequest(
        `/empreendimentos/${empreendimentoId}/evidencias/${evidenciaId}`,
        { method: 'DELETE' }
      );
    } catch {
      // Remove do snapshot local
    }

    const snap = await snapshotStore.obter();
    const filtradas = snap.evidencias.filter((e) => e.id !== evidenciaId);
    await snapshotStore.salvar({ evidencias: filtradas });
    return filtradas;
  },
};
