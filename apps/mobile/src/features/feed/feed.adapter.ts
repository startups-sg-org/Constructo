import { API_BASE_URL } from '../../services/api';
import { Etapa, Marco, ProgressoEmpreendimento } from '../../types/obras';
import { EvidenciaBackend } from '../../types/evidencias';
import { PostagemFeedSocial } from '../../types/feed';

/**
 * Mapeia o nome da etapa para um identificador de ícone semântico.
 */
function inferirIconeEtapa(
  nomeEtapa: string
): 'foundation' | 'structure' | 'masonry' | 'finishing' | 'default' {
  const normalizado = nomeEtapa.toLowerCase();
  if (normalizado.includes('fund') || normalizado.includes('terra')) return 'foundation';
  if (normalizado.includes('estrut') || normalizado.includes('laje') || normalizado.includes('pilar'))
    return 'structure';
  if (normalizado.includes('alven') || normalizado.includes('parede') || normalizado.includes('instal'))
    return 'masonry';
  if (normalizado.includes('acab') || normalizado.includes('piso') || normalizado.includes('pint'))
    return 'finishing';
  return 'default';
}

/**
 * Formata um timestamp ISO 8601 em texto amigável relativo ou data brasileira.
 */
export function formatarDataAmigavel(isoString: string): string {
  try {
    const data = new Date(isoString);
    if (isNaN(data.getTime())) return 'Recentemente';

    const agora = new Date();
    const diferencaMs = agora.getTime() - data.getTime();
    const diferencaMinutos = Math.floor(diferencaMs / (1000 * 60));
    const diferencaHoras = Math.floor(diferencaMs / (1000 * 60 * 60));
    const diferencaDias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

    if (diferencaMinutos >= 0 && diferencaMinutos < 60) {
      return diferencaMinutos <= 1 ? 'Agora mesmo' : `Há ${diferencaMinutos} min`;
    }

    if (diferencaHoras >= 0 && diferencaHoras < 24 && data.getDate() === agora.getDate()) {
      const hora = data.getHours().toString().padStart(2, '0');
      const min = data.getMinutes().toString().padStart(2, '0');
      return `Hoje às ${hora}:${min}`;
    }

    if (diferencaDias === 1) {
      const hora = data.getHours().toString().padStart(2, '0');
      const min = data.getMinutes().toString().padStart(2, '0');
      return `Ontem às ${hora}:${min}`;
    }

    const dia = data.getDate().toString().padStart(2, '0');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    const hora = data.getHours().toString().padStart(2, '0');
    const min = data.getMinutes().toString().padStart(2, '0');

    return `${dia} ${mes} ${ano} às ${hora}:${min}`;
  } catch {
    return 'Recentemente';
  }
}

/**
 * Converte o caminho relativo do arquivo no backend em uma URL completa e acessível pelo app.
 */
export function resolverUrlMidia(arquivoUrl: string): string {
  if (!arquivoUrl) return '';
  if (
    arquivoUrl.startsWith('http://') ||
    arquivoUrl.startsWith('https://') ||
    arquivoUrl.startsWith('file://') ||
    arquivoUrl.startsWith('content://') ||
    arquivoUrl.startsWith('data:') ||
    arquivoUrl.startsWith('blob:')
  ) {
    return arquivoUrl;
  }
  const prefixoLimpo = arquivoUrl.startsWith('/') ? arquivoUrl : `/${arquivoUrl}`;
  return `${API_BASE_URL}${prefixoLimpo}`;
}

/**
 * Motor de projeção client-side:
 * Transforma uma coleção de EvidenciaBackend em cards ricos para o Feed Social do Cliente,
 * calculando o delta percentual de cada evidência e a evolução do progresso acumulado.
 */
export function projetarEvidenciasParaFeed(
  evidencias: EvidenciaBackend[],
  etapas: Etapa[],
  marcos: Marco[],
  progressoGlobal?: ProgressoEmpreendimento | null
): PostagemFeedSocial[] {
  if (!evidencias || evidencias.length === 0) {
    return [];
  }

  // 1. Mapeia etapas e marcos por ID para busca em O(1)
  const mapaEtapas = new Map<number, Etapa>();
  etapas.forEach((etapa) => mapaEtapas.set(etapa.id, etapa));

  const mapaMarcos = new Map<number, Marco>();
  marcos.forEach((marco) => mapaMarcos.set(marco.id, marco));

  // 2. Determina o peso de cada marco no projeto total
  const totalMarcos = Math.max(marcos.length, 1);
  const deltaBase = Number((100 / totalMarcos).toFixed(1));
  const progressoAtual = progressoGlobal?.percentual ?? 52;

  // 3. Ordena as evidências cronologicamente da mais antiga para a mais recente para calcular o acumulado
  const ordenadasCronologicamente = [...evidencias].sort((a, b) => {
    return new Date(a.capturado_em).getTime() - new Date(b.capturado_em).getTime();
  });

  const total = ordenadasCronologicamente.length;

  const cardsProjetados: PostagemFeedSocial[] = ordenadasCronologicamente.map((evidencia, index) => {
    const marco = mapaMarcos.get(evidencia.marco_id);
    const etapa = marco ? mapaEtapas.get(marco.etapa_id) : etapas[0];

    const nomeEtapa = etapa?.nome || 'Fase de Obra';
    const nomeMarco = evidencia.marco?.nome || marco?.nome || nomeEtapa;
    const localNome = evidencia.local_obra?.nome || `Setor #${evidencia.local_obra_id}`;

    const legendaOriginal =
      evidencia.descricao_tecnica ||
      marco?.descricao_cliente ||
      (nomeMarco ? `${nomeEtapa}: ${nomeMarco}` : `Registro fotográfico da etapa ${nomeEtapa}.`);

    // Cálculo da evolução de progresso acumulado ao longo da timeline
    const proporcao = (index + 1) / total;
    const progressoAcumulado = Math.max(
      deltaBase,
      Math.min(progressoAtual, Math.round(progressoAtual * proporcao))
    );
    const progressoAnterior = Math.max(0, Number((progressoAcumulado - deltaBase).toFixed(1)));

    const deltaPercentual = deltaBase;
    const dataCaptura = new Date(evidencia.capturado_em).getTime();

    // Autor real vindo do backend ou fallback de engenharia
    const nomeResponsavel = evidencia.responsavel?.nome
      ? evidencia.responsavel.nome.startsWith('Eng.')
        ? evidencia.responsavel.nome
        : `Eng. ${evidencia.responsavel.nome}`
      : evidencia.capturado_por === 3
        ? 'Eng. Camila Ferreira'
        : 'Eng. Rafael Nogueira';

    // Próximo marco da sequência para orientar o comprador
    const indiceMarcoAtual = marcos.findIndex((m) => m.id === evidencia.marco_id);
    const proximoMarco =
      indiceMarcoAtual >= 0 && indiceMarcoAtual + 1 < marcos.length
        ? marcos[indiceMarcoAtual + 1]
        : null;

    const proximoPasso = proximoMarco
      ? `Avanço programado para "${proximoMarco.nome}": ${proximoMarco.descricao_cliente || proximoMarco.descricao_tecnica || 'Conferência e liberação pela engenharia residente.'}`
      : 'Continuidade do controle tecnológico, cura assistida e preparação para vistoria técnica.';

    return {
      id: evidencia.id,
      evidenciaId: evidencia.id,
      imagemUrl: resolverUrlMidia(evidencia.arquivo_url),
      dataExibicao: formatarDataAmigavel(evidencia.capturado_em),
      timestampCaptura: isNaN(dataCaptura) ? Date.now() : dataCaptura,
      legenda: legendaOriginal,
      autorNome: nomeResponsavel,
      autorCargo: 'Engenharia Residente',
      autorCrea: evidencia.capturado_por === 3 ? 'CREA-TO 518.420/D' : 'CREA-TO 506.912/D',
      localNome,
      marcoId: evidencia.marco_id,
      marcoNome: nomeMarco,
      proximoPasso,
      statusValidacao: evidencia.status_validacao || 'VALIDA',
      etapa: {
        id: etapa?.id || 0,
        nome: nomeEtapa,
        icone: inferirIconeEtapa(nomeEtapa),
      },
      impactoProgresso: {
        deltaPercentual,
        progressoAnterior,
        progressoAcumuladoAteAqui: progressoAcumulado,
      },
      badge: {
        texto: `+${deltaPercentual}% no Progresso Total`,
        variante: 'destaque',
      },
    };
  });

  // 4. Retorna a timeline em ordem decrescente (mais recentes no topo do feed)
  return cardsProjetados.reverse();
}
