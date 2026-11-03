import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnvioEvidenciaPayload } from '../types/evidencias';
import { ItemFilaOffline } from '../types/offline';
import { evidenciasService } from './evidencias.service';

const CHAVE_STORAGE_FILA_OFFLINE = '@constructo:fila_evidencias_offline';

export const offlineService = {
  /**
   * Armazena uma evidência na fila local para envio posterior quando houver rede.
   */
  async enfileirar(payload: EnvioEvidenciaPayload): Promise<ItemFilaOffline> {
    const itens = await this.listarPendentes();

    const novoItem: ItemFilaOffline = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: new Date().toISOString(),
      tentativas: 0,
      payload,
    };

    itens.push(novoItem);
    await AsyncStorage.setItem(CHAVE_STORAGE_FILA_OFFLINE, JSON.stringify(itens));
    return novoItem;
  },

  /**
   * Lista todas as evidências pendentes de envio.
   */
  async listarPendentes(): Promise<ItemFilaOffline[]> {
    try {
      const serializado = await AsyncStorage.getItem(CHAVE_STORAGE_FILA_OFFLINE);
      if (!serializado) return [];
      return JSON.parse(serializado) as ItemFilaOffline[];
    } catch (erro) {
      console.warn('[offlineService] Erro ao ler fila offline:', erro);
      return [];
    }
  },

  /**
   * Remove um item da fila após envio com sucesso.
   */
  async removerItem(id: string): Promise<void> {
    const itens = await this.listarPendentes();
    const filtrados = itens.filter((item) => item.id !== id);
    await AsyncStorage.setItem(CHAVE_STORAGE_FILA_OFFLINE, JSON.stringify(filtrados));
  },

  /**
   * Executa a sincronização de todos os itens pendentes na fila.
   */
  async sincronizar(): Promise<{ enviados: number; falhas: number }> {
    const itens = await this.listarPendentes();
    if (itens.length === 0) {
      return { enviados: 0, falhas: 0 };
    }

    let enviados = 0;
    let falhas = 0;

    for (const item of itens) {
      try {
        await evidenciasService.enviarEvidencia(item.payload);
        await this.removerItem(item.id);
        enviados++;
      } catch (erro) {
        falhas++;
        console.warn(`[offlineService] Falha ao sincronizar item ${item.id}:`, erro);
        // Atualiza contagem de tentativas e erro
        item.tentativas += 1;
        item.erroUltimaTentativa = erro instanceof Error ? erro.message : 'Erro desconhecido';
      }
    }

    // Se houver falhas, persiste as tentativas atualizadas
    if (falhas > 0) {
      const itensRestantes = await this.listarPendentes();
      await AsyncStorage.setItem(CHAVE_STORAGE_FILA_OFFLINE, JSON.stringify(itensRestantes));
    }

    return { enviados, falhas };
  },
};
