import {
  formatarDataAmigavel,
  projetarEvidenciasParaFeed,
  resolverUrlMidia,
} from '../feed.adapter';
import { EvidenciaBackend } from '../../../types/evidencias';
import { Etapa, Marco, ProgressoEmpreendimento } from '../../../types/obras';

describe('feed.adapter - Motor de Projeção Client-Side', () => {
  const etapasMock: Etapa[] = [
    {
      id: 1,
      taxonomia_id: 10,
      parent_id: null,
      nome: 'Fundação e Contenção',
      descricao_tecnica: 'Estacas e blocos',
      descricao_cliente: 'Bases sólidas do edifício',
      ordem: 1,
    },
    {
      id: 2,
      taxonomia_id: 10,
      parent_id: null,
      nome: 'Estrutura e Alvenaria',
      descricao_tecnica: 'Concretagem de lajes',
      descricao_cliente: 'Paredes e andares tomando forma',
      ordem: 2,
    },
  ];

  const marcosMock: Marco[] = [
    { id: 101, etapa_id: 1, nome: 'Estacas Concluídas', descricao_tecnica: null, descricao_cliente: null, ordem: 1 },
    { id: 102, etapa_id: 1, nome: 'Blocos Concretados', descricao_tecnica: null, descricao_cliente: null, ordem: 2 },
    { id: 103, etapa_id: 2, nome: 'Laje 1º Pavimento', descricao_tecnica: null, descricao_cliente: null, ordem: 3 },
    { id: 104, etapa_id: 2, nome: 'Laje 2º Pavimento', descricao_tecnica: null, descricao_cliente: null, ordem: 4 },
  ];

  const evidenciasMock: EvidenciaBackend[] = [
    {
      id: 1,
      empreendimento_id: 14,
      local_obra_id: 1,
      marco_id: 101,
      item_protocolo_id: null,
      arquivo_evidencia_id: 1,
      arquivo_url: '/uploads/empreendimentos/14/evidencias/foto1.jpg',
      descricao_tecnica: 'Perfuração e armação de estacas concluída.',
      capturado_em: '2026-10-01T10:00:00Z',
      capturado_por: 5,
      criado_em: '2026-10-01T10:05:00Z',
      atualizado_em: '2026-10-01T10:05:00Z',
    },
    {
      id: 2,
      empreendimento_id: 14,
      local_obra_id: 1,
      marco_id: 103,
      item_protocolo_id: null,
      arquivo_evidencia_id: 2,
      arquivo_url: '/uploads/empreendimentos/14/evidencias/foto2.jpg',
      descricao_tecnica: 'Concretagem da laje finalizada.',
      capturado_em: '2026-10-24T14:30:00Z',
      capturado_por: 5,
      criado_em: '2026-10-24T14:35:00Z',
      atualizado_em: '2026-10-24T14:35:00Z',
    },
  ];

  const progressoMock: ProgressoEmpreendimento = {
    empreendimento_id: 14,
    percentual: 50,
    etapas: [
      { etapa_id: 1, nome: 'Fundação e Contenção', percentual: 100 },
      { etapa_id: 2, nome: 'Estrutura e Alvenaria', percentual: 50 },
    ],
  };

  test('deve projetar evidências para o formato de feed social em ordem decrescente', () => {
    const feed = projetarEvidenciasParaFeed(
      evidenciasMock,
      etapasMock,
      marcosMock,
      progressoMock
    );

    expect(feed).toHaveLength(2);
    // Mais recente no topo
    expect(feed[0].id).toBe(2);
    expect(feed[1].id).toBe(1);

    // Verifica montagem da URL completa
    expect(feed[0].imagemUrl).toContain('/uploads/empreendimentos/14/evidencias/foto2.jpg');
    expect(feed[0].badge.texto).toMatch(/\+\d+(\.\d+)?% no Progresso Total/);
  });

  test('deve calcular delta percentual baseado no total de marcos da obra', () => {
    // 4 marcos -> 100 / 4 = 25% por marco
    const feed = projetarEvidenciasParaFeed(
      evidenciasMock,
      etapasMock,
      marcosMock,
      progressoMock
    );

    expect(feed[0].impactoProgresso.deltaPercentual).toBe(25);
    expect(feed[0].badge.texto).toBe('+25% no Progresso Total');
  });

  test('deve resolver URLs relativas corretamente', () => {
    const urlAbsoluta = 'https://meu-storage.s3.amazonaws.com/foto.jpg';
    expect(resolverUrlMidia(urlAbsoluta)).toBe(urlAbsoluta);

    const urlRelativa = '/uploads/foto.jpg';
    expect(resolverUrlMidia(urlRelativa)).toContain('/uploads/foto.jpg');
  });

  test('deve formatar data amigável corretamente', () => {
    const dataIso = new Date().toISOString();
    const texto = formatarDataAmigavel(dataIso);
    expect(['Agora mesmo', 'Há 0 min', 'Hoje']).toContain(texto.split(' ')[0]);
  });
});
