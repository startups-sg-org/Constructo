import { apiRequest } from './api';
import {
  achatarLocaisHierarquia,
  PROTOCOLOS_SEED,
  snapshotStore,
} from './demo-seed';
import {
  ContratoObra,
  Empreendimento,
  EmpreendimentoCriarPayload,
  Etapa,
  LocalHierarquia,
  LocalObra,
  Marco,
  ProgressoEmpreendimento,
  StatusContrato,
  StatusMarco,
  Taxonomia,
  TipoLocal,
} from '../types/obras';
import { ProtocoloEvidencia } from '../types/evidencias';

function normalizarProgresso(raw: ProgressoEmpreendimento): ProgressoEmpreendimento {
  const listaEtapas = raw.etapas?.length
    ? raw.etapas
    : raw.macroetapas?.length
      ? raw.macroetapas
      : [];

  return {
    ...raw,
    etapas: listaEtapas,
    macroetapas: listaEtapas,
  };
}

export const obrasService = {
  /**
   * Lista os empreendimentos disponíveis sincronizando com o snapshot local.
   */
  async listarEmpreendimentos(): Promise<Empreendimento[]> {
    try {
      const lista = await apiRequest<Empreendimento[]>('/empreendimentos');
      if (lista && lista.length > 0) {
        await snapshotStore.salvar({ empreendimentos: lista });
        return lista;
      }
    } catch {
      // Fallback para snapshot local (ex: perfil COMPRADOR ou modo offline)
    }
    const snap = await snapshotStore.obter();
    return snap.empreendimentos;
  },

  /**
   * Cadastra um novo empreendimento (POST /empreendimentos/).
   */
  async criarEmpreendimento(payload: EmpreendimentoCriarPayload): Promise<Empreendimento> {
    try {
      const criado = await apiRequest<Empreendimento>('/empreendimentos/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const snap = await snapshotStore.obter();
      await snapshotStore.salvar({
        empreendimentos: [criado, ...snap.empreendimentos],
      });
      return criado;
    } catch {
      const snap = await snapshotStore.obter();
      const novo: Empreendimento = {
        id: Math.max(0, ...snap.empreendimentos.map((e) => e.id)) + 1,
        nome: payload.nome.trim(),
        descricao: payload.descricao || 'Empreendimento registrado via aplicativo de campo.',
        endereco: payload.endereco || 'Canteiro Central',
        status: payload.status || 'EM_ANDAMENTO',
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      };
      await snapshotStore.salvar({
        empreendimentos: [novo, ...snap.empreendimentos],
      });
      return novo;
    }
  },

  /**
   * Busca detalhes cadastrais de um empreendimento.
   */
  async obterEmpreendimento(id: number): Promise<Empreendimento> {
    try {
      return await apiRequest<Empreendimento>(`/empreendimentos/${id}`);
    } catch {
      const snap = await snapshotStore.obter();
      return snap.empreendimentos.find((e) => e.id === id) || snap.empreendimentos[0];
    }
  },

  /**
   * Busca a taxonomia configurada para a obra.
   */
  async obterTaxonomia(empreendimentoId: number): Promise<Taxonomia> {
    return await apiRequest<Taxonomia>(`/empreendimentos/${empreendimentoId}/taxonomia`);
  },

  /**
   * Lista as etapas ativas da taxonomia da obra.
   */
  async listarEtapas(empreendimentoId: number, parentId?: number): Promise<Etapa[]> {
    try {
      const query = parentId !== undefined ? `?parent_id=${parentId}` : '';
      const etapas = await apiRequest<Etapa[]>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas${query}`
      );
      if (etapas && etapas.length > 0) {
        await snapshotStore.salvar({ etapas });
        return etapas;
      }
    } catch {
      // Fallback para snapshot
    }
    const snap = await snapshotStore.obter();
    return snap.etapas;
  },

  /**
   * Cadastra uma nova etapa na taxonomia da obra.
   */
  async criarEtapa(
    empreendimentoId: number,
    dados: { nome: string; descricao_tecnica?: string; descricao_cliente?: string }
  ): Promise<Etapa> {
    const snap = await snapshotStore.obter();
    const novaOrdem = snap.etapas.length + 1;
    try {
      const criada = await apiRequest<Etapa>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas`,
        {
          method: 'POST',
          body: JSON.stringify({
            nome: dados.nome.trim(),
            descricao_tecnica: dados.descricao_tecnica || null,
            descricao_cliente: dados.descricao_cliente || null,
            ordem: novaOrdem,
          }),
        }
      );
      await snapshotStore.salvar({ etapas: [...snap.etapas, criada] });
      return criada;
    } catch {
      const criadaLocal: Etapa = {
        id: Math.max(0, ...snap.etapas.map((e) => e.id)) + 1,
        taxonomia_id: 1,
        parent_id: null,
        nome: dados.nome.trim(),
        descricao_tecnica: dados.descricao_tecnica || 'Etapa técnica cadastrada no canteiro.',
        descricao_cliente: dados.descricao_cliente || 'Nova etapa do cronograma da obra.',
        ordem: novaOrdem,
      };
      await snapshotStore.salvar({ etapas: [...snap.etapas, criadaLocal] });
      return criadaLocal;
    }
  },

  /**
   * Lista os marcos de uma etapa específica.
   */
  async listarMarcos(empreendimentoId: number, etapaId: number): Promise<Marco[]> {
    try {
      const marcos = await apiRequest<Marco[]>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas/${etapaId}/marcos`
      );
      if (marcos && marcos.length > 0) {
        return marcos.map((m) => ({
          ...m,
          status: m.status || 'EM_ANDAMENTO',
        }));
      }
    } catch {
      // Fallback para snapshot
    }
    const snap = await snapshotStore.obter();
    return snap.marcos.filter((m) => m.etapa_id === etapaId);
  },

  /**
   * Cadastra um novo marco em uma etapa.
   */
  async criarMarco(
    empreendimentoId: number,
    etapaId: number,
    dados: { nome: string; descricao_tecnica?: string; descricao_cliente?: string }
  ): Promise<Marco> {
    const snap = await snapshotStore.obter();
    const marcosDaEtapa = snap.marcos.filter((m) => m.etapa_id === etapaId);
    const ordem = marcosDaEtapa.length + 1;

    try {
      const criado = await apiRequest<Marco>(
        `/empreendimentos/${empreendimentoId}/taxonomia/etapas/${etapaId}/marcos`,
        {
          method: 'POST',
          body: JSON.stringify({
            nome: dados.nome.trim(),
            descricao_tecnica: dados.descricao_tecnica || null,
            descricao_cliente: dados.descricao_cliente || null,
            ordem,
          }),
        }
      );
      const enriquecido: Marco = { ...criado, status: 'EM_ANDAMENTO' };
      await snapshotStore.salvar({ marcos: [...snap.marcos, enriquecido] });
      return enriquecido;
    } catch {
      const novoLocal: Marco = {
        id: Math.max(0, ...snap.marcos.map((m) => m.id)) + 1,
        etapa_id: etapaId,
        nome: dados.nome.trim(),
        descricao_tecnica: dados.descricao_tecnica || 'Marco técnico de verificação.',
        descricao_cliente: dados.descricao_cliente || 'Entrega programada no cronograma.',
        ordem,
        status: 'EM_ANDAMENTO',
      };
      await snapshotStore.salvar({ marcos: [...snap.marcos, novoLocal] });
      return novoLocal;
    }
  },

  /**
   * Atualiza o status operacional de um marco (NAO_INICIADO | EM_ANDAMENTO | CONCLUIDO)
   * e recalcula o progresso consolidado da obra.
   */
  async atualizarStatusMarco(
    empreendimentoId: number,
    marcoId: number,
    novoStatus: StatusMarco
  ): Promise<{ marcos: Marco[]; progresso: ProgressoEmpreendimento }> {
    const snap = await snapshotStore.obter();
    const marcosAtualizados = snap.marcos.map((m) =>
      m.id === marcoId ? { ...m, status: novoStatus } : m
    );

    const rotaAcao =
      novoStatus === 'CONCLUIDO'
        ? 'concluir'
        : novoStatus === 'EM_ANDAMENTO'
          ? 'iniciar'
          : 'reabrir';

    try {
      await apiRequest(`/empreendimentos/${empreendimentoId}/progressos/${marcoId}/${rotaAcao}`, {
        method: 'POST',
      });
    } catch {
      // Mantém atualização otimista local
    }

    // Recalcula progresso das etapas com base nos marcos
    const etapasProgresso = snap.etapas.map((etapa) => {
      const mEtapa = marcosAtualizados.filter((m) => m.etapa_id === etapa.id);
      const total = Math.max(mEtapa.length, 1);
      const concluidos = mEtapa.filter((m) => m.status === 'CONCLUIDO').length;
      const emAndamento = mEtapa.filter((m) => m.status === 'EM_ANDAMENTO').length;
      const naoIniciados = total - concluidos - emAndamento;
      const percentual = Math.round(((concluidos + emAndamento * 0.45) / total) * 100);
      const status: StatusMarco =
        concluidos === total
          ? 'CONCLUIDO'
          : concluidos > 0 || emAndamento > 0
            ? 'EM_ANDAMENTO'
            : 'NAO_INICIADO';

      return {
        etapa_id: etapa.id,
        nome: etapa.nome,
        percentual,
        total,
        concluidos,
        em_andamento: emAndamento,
        nao_iniciados: naoIniciados,
        status,
      };
    });

    const totalGlobal = marcosAtualizados.length || 1;
    const concluidosGlobal = marcosAtualizados.filter((m) => m.status === 'CONCLUIDO').length;
    const andamentoGlobal = marcosAtualizados.filter((m) => m.status === 'EM_ANDAMENTO').length;
    const percentualGlobal = Math.min(
      100,
      Math.round(((concluidosGlobal + andamentoGlobal * 0.4) / totalGlobal) * 100)
    );

    const novoProgresso: ProgressoEmpreendimento = {
      empreendimento_id: empreendimentoId,
      percentual: percentualGlobal,
      total: totalGlobal,
      concluidos: concluidosGlobal,
      em_andamento: andamentoGlobal,
      nao_iniciados: totalGlobal - concluidosGlobal - andamentoGlobal,
      status: percentualGlobal >= 100 ? 'CONCLUIDO' : 'EM_ANDAMENTO',
      etapas: etapasProgresso,
      macroetapas: etapasProgresso,
    };

    await snapshotStore.salvar({
      marcos: marcosAtualizados,
      progresso: novoProgresso,
    });

    return { marcos: marcosAtualizados, progresso: novoProgresso };
  },

  /**
   * Consulta o resumo consolidado de progresso da obra e de suas etapas.
   */
  async obterProgresso(empreendimentoId: number): Promise<ProgressoEmpreendimento> {
    try {
      const raw = await apiRequest<ProgressoEmpreendimento>(
        `/empreendimentos/${empreendimentoId}/progresso`
      );
      const normalizado = normalizarProgresso(raw);
      await snapshotStore.salvar({ progresso: normalizado });
      return normalizado;
    } catch {
      const snap = await snapshotStore.obter();
      return normalizarProgresso(snap.progresso);
    }
  },

  /**
   * Lista a árvore hierárquica completa da estrutura física (Bloco -> Pavimento -> Unidade).
   */
  async listarEstruturaFisica(empreendimentoId: number): Promise<LocalHierarquia[]> {
    try {
      const arvore = await apiRequest<LocalHierarquia[]>(
        `/empreendimentos/${empreendimentoId}/estrutura-fisica`
      );
      if (arvore && arvore.length > 0) {
        await snapshotStore.salvar({ estruturaFisica: arvore });
        return arvore;
      }
    } catch {
      // Fallback para snapshot
    }
    const snap = await snapshotStore.obter();
    return snap.estruturaFisica;
  },

  /**
   * Lista todos os locais achatados da obra para seleção rápida em formulários.
   */
  async listarLocais(empreendimentoId: number): Promise<LocalObra[]> {
    const arvore = await this.listarEstruturaFisica(empreendimentoId);
    if (arvore.length > 0) {
      return achatarLocaisHierarquia(arvore);
    }
    try {
      return await apiRequest<LocalObra[]>(`/empreendimentos/${empreendimentoId}/locais`);
    } catch {
      return [];
    }
  },

  /**
   * Cadastra um novo local físico (Torre/Bloco, Pavimento ou Unidade).
   */
  async criarLocalFisico(
    empreendimentoId: number,
    dados: { nome: string; tipo: TipoLocal; parentId?: number | null }
  ): Promise<LocalHierarquia[]> {
    const snap = await snapshotStore.obter();
    try {
      if (!dados.parentId) {
        await apiRequest(`/empreendimentos/${empreendimentoId}/locais`, {
          method: 'POST',
          body: JSON.stringify({
            nome: dados.nome.trim(),
            tipo: dados.tipo === 'TORRE' ? 'TORRE' : 'BLOCO',
            ordem: snap.estruturaFisica.length + 1,
          }),
        });
      } else if (dados.tipo === 'PAVIMENTO') {
        await apiRequest(
          `/empreendimentos/${empreendimentoId}/locais/${dados.parentId}/pavimentos`,
          {
            method: 'POST',
            body: JSON.stringify({ nome: dados.nome.trim(), ordem: 1 }),
          }
        );
      } else {
        await apiRequest(
          `/empreendimentos/${empreendimentoId}/locais/${dados.parentId}/unidades`,
          {
            method: 'POST',
            body: JSON.stringify({ nome: dados.nome.trim(), ordem: 1 }),
          }
        );
      }
      return await this.listarEstruturaFisica(empreendimentoId);
    } catch {
      const novoId = Math.floor(Math.random() * 1000) + 50;
      const novoNo: LocalHierarquia = {
        id: novoId,
        empreendimento_id: empreendimentoId,
        parent_id: dados.parentId || null,
        nome: dados.nome.trim(),
        tipo: dados.tipo,
        ordem: 1,
        filhos: [],
      };

      let novaArvore: LocalHierarquia[];
      if (!dados.parentId) {
        novaArvore = [...snap.estruturaFisica, novoNo];
      } else {
        const inserirFilho = (nos: LocalHierarquia[]): LocalHierarquia[] =>
          nos.map((no) => {
            if (no.id === dados.parentId) {
              return { ...no, filhos: [...(no.filhos || []), novoNo] };
            }
            if (no.filhos?.length) {
              return { ...no, filhos: inserirFilho(no.filhos) };
            }
            return no;
          });
        novaArvore = inserirFilho(snap.estruturaFisica);
      }

      await snapshotStore.salvar({ estruturaFisica: novaArvore });
      return novaArvore;
    }
  },

  /**
   * Lista protocolos de evidência do marco.
   */
  async listarProtocolos(empreendimentoId: number, marcoId?: number): Promise<ProtocoloEvidencia[]> {
    if (marcoId) {
      try {
        const res = await apiRequest<ProtocoloEvidencia[]>(
          `/empreendimentos/${empreendimentoId}/taxonomia/marcos/${marcoId}/protocolos-evidencia`
        );
        if (res && res.length > 0) return res;
      } catch {
        // Fallback seed
      }
      return PROTOCOLOS_SEED.filter((p) => p.marco_id === marcoId);
    }
    return PROTOCOLOS_SEED;
  },

  /**
   * Lista contratos do empreendimento.
   */
  async listarContratos(empreendimentoId: number): Promise<ContratoObra[]> {
    const snap = await snapshotStore.obter();
    return snap.contratos.filter(
      (c) => c.empreendimento_id === empreendimentoId || snap.contratos.length > 0
    );
  },

  /**
   * Cria um novo contrato na obra.
   */
  async criarContrato(
    empreendimentoId: number,
    dados: {
      numero_contrato: string;
      objeto: string;
      fornecedor_nome: string;
      fornecedor_cnpj: string;
      valor_total: number;
    }
  ): Promise<ContratoObra[]> {
    const snap = await snapshotStore.obter();
    const novo: ContratoObra = {
      id: `ctr-${Date.now()}`,
      empreendimento_id: empreendimentoId,
      numero_contrato: dados.numero_contrato.trim() || `CTR-2026/${snap.contratos.length + 30}`,
      objeto: dados.objeto.trim(),
      fornecedor_nome: dados.fornecedor_nome.trim(),
      fornecedor_cnpj: dados.fornecedor_cnpj.trim() || '12.345.678/0001-90',
      valor_total: dados.valor_total || 150000,
      status: 'ATIVO',
      data_inicio: new Date().toLocaleDateString('pt-BR'),
      data_fim_prevista: '30/06/2027',
      percentual_medido: 0,
    };
    const atualizados = [novo, ...snap.contratos];
    await snapshotStore.salvar({ contratos: atualizados });
    return atualizados;
  },

  /**
   * Atualiza status de um contrato.
   */
  async atualizarStatusContrato(contratoId: string, status: StatusContrato): Promise<ContratoObra[]> {
    const snap = await snapshotStore.obter();
    const atualizados = snap.contratos.map((c) =>
      c.id === contratoId
        ? { ...c, status, percentual_medido: status === 'CONCLUIDO' ? 100 : c.percentual_medido }
        : c
    );
    await snapshotStore.salvar({ contratos: atualizados });
    return atualizados;
  },
};
