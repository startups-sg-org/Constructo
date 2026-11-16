import AsyncStorage from '@react-native-async-storage/async-storage';
import { UsuarioSessao } from '../types/auth';
import { EvidenciaBackend, ProtocoloEvidencia } from '../types/evidencias';
import {
  ContratoObra,
  Empreendimento,
  Etapa,
  LocalHierarquia,
  LocalObra,
  Marco,
  ProgressoEmpreendimento,
} from '../types/obras';

const CHAVE_SNAPSHOT_LOCAL = '@constructo:enterprise_snapshot_v2';

/**
 * Usuários oficiais alinhados exatamente com apps/backend/scripts/popular_dados_demo.py
 */
export const USUARIOS_DEMO_HOMOLOGADOS: Record<string, UsuarioSessao> = {
  'demo.gestor1@example.com': {
    id: 2,
    cpf: '16899535009',
    nome: 'Rafael',
    sobrenome: 'Nogueira',
    email: 'demo.gestor1@example.com',
    telefone: '(63) 99234-5678',
    canal_preferido: 'whatsapp',
    receber_atualizacoes: true,
    empreendimento: 'Parque das Águas',
    unidade: 'Engenharia Residente',
    ativo: true,
    papel: 'GESTOR',
  },
  'demo.admin@example.com': {
    id: 1,
    cpf: '52998224725',
    nome: 'Marina',
    sobrenome: 'Albuquerque',
    email: 'demo.admin@example.com',
    telefone: '(63) 99123-4567',
    canal_preferido: 'email',
    receber_atualizacoes: true,
    empreendimento: 'Todos os empreendimentos',
    unidade: 'Diretoria Técnica',
    ativo: true,
    papel: 'ADMIN',
  },
  'demo.comprador2@example.com': {
    id: 4,
    cpf: '98765432100',
    nome: 'Beatriz',
    sobrenome: 'Lima',
    email: 'demo.comprador2@example.com',
    telefone: '(63) 99567-8901',
    canal_preferido: 'whatsapp',
    receber_atualizacoes: true,
    empreendimento: 'Parque das Águas',
    unidade: '202',
    ativo: true,
    papel: 'COMPRADOR',
  },
};

export const EMPREENDIMENTOS_SEED: Empreendimento[] = [
  {
    id: 1,
    nome: 'Parque das Águas',
    descricao: 'Conjunto habitacional planejado com dois blocos residenciais e área técnica monitorada.',
    endereco: 'Rua das Acácias, 450 — Araguaína/TO',
    status: 'EM_ANDAMENTO',
    criado_em: '2026-03-10T09:00:00Z',
    atualizado_em: '2026-10-30T16:40:00Z',
  },
  {
    id: 2,
    nome: 'Reserva Horizonte Sul',
    descricao: 'Torre residencial de alto padrão com 18 pavimentos e fundação em hélice contínua.',
    endereco: 'Av. Filadélfia, 1820 — Setor Oeste, Araguaína/TO',
    status: 'PLANEJADO',
    criado_em: '2026-06-15T10:00:00Z',
    atualizado_em: '2026-10-28T11:20:00Z',
  },
];

export const ETAPAS_SEED: Etapa[] = [
  {
    id: 1,
    taxonomia_id: 1,
    parent_id: null,
    nome: 'Fundação',
    descricao_tecnica: 'Execução das fundações profundas, blocos de coroamento e vigas baldrame.',
    descricao_cliente: 'Preparação e concretagem das bases estruturais de sustentação do edifício.',
    ordem: 1,
  },
  {
    id: 2,
    taxonomia_id: 1,
    parent_id: null,
    nome: 'Estrutura',
    descricao_tecnica: 'Execução de pilares, vigas e lajes maciças em concreto armado Fck 35MPa.',
    descricao_cliente: 'Elevação dos andares, pilares e lajes que dão forma aos apartamentos.',
    ordem: 2,
  },
  {
    id: 3,
    taxonomia_id: 1,
    parent_id: null,
    nome: 'Instalações',
    descricao_tecnica: 'Prumadas hidráulicas, eletrodutos, quadros de distribuição e rede lógica.',
    descricao_cliente: 'Infraestrutura elétrica, hidráulica, pontos de ar-condicionado e gás.',
    ordem: 3,
  },
  {
    id: 4,
    taxonomia_id: 1,
    parent_id: null,
    nome: 'Acabamentos',
    descricao_tecnica: 'Revestimentos cerâmicos, impermeabilização, esquadrias, pintura e louças.',
    descricao_cliente: 'Porcelanatos, bancadas em granito, esquadrias de alumínio e pintura final.',
    ordem: 4,
  },
];

export const MARCOS_SEED: Marco[] = [
  {
    id: 1,
    etapa_id: 1,
    nome: 'Fundação iniciada',
    descricao_tecnica: 'Locação topográfica, escavação e armação de estacas e sapatas.',
    descricao_cliente: 'Terreno preparado e início da concretagem das fundações.',
    ordem: 1,
    status: 'CONCLUIDO',
  },
  {
    id: 2,
    etapa_id: 1,
    nome: 'Fundação concluída',
    descricao_tecnica: 'Concretagem de blocos de coroamento, vigas baldrame e impermeabilização.',
    descricao_cliente: 'Base estrutural 100% concluída e impermeabilizada.',
    ordem: 2,
    status: 'CONCLUIDO',
  },
  {
    id: 3,
    etapa_id: 2,
    nome: 'Estrutura iniciada',
    descricao_tecnica: 'Montagem de formas, armaduras de pilares e concretagem do 1º e 2º pavimentos.',
    descricao_cliente: 'Pilares e lajes dos primeiros andares concretados com laudo aprovado.',
    ordem: 1,
    status: 'CONCLUIDO',
  },
  {
    id: 4,
    etapa_id: 2,
    nome: 'Estrutura concluída',
    descricao_tecnica: 'Desforma e cura das lajes superiores, alvenaria de vedação e platibanda.',
    descricao_cliente: 'Estrutura completa dos pavimentos e paredes dos apartamentos erguidas.',
    ordem: 2,
    status: 'EM_ANDAMENTO',
  },
  {
    id: 5,
    etapa_id: 3,
    nome: 'Instalações iniciadas',
    descricao_tecnica: 'Passagem de tubulações de água fria/quente, esgoto e eletrodutos embutidos.',
    descricao_cliente: 'Início das redes hidráulicas e elétricas dentro das unidades.',
    ordem: 1,
    status: 'EM_ANDAMENTO',
  },
  {
    id: 6,
    etapa_id: 3,
    nome: 'Instalações concluídas',
    descricao_tecnica: 'Teste de estanqueidade nas prumadas e cabeamento estruturado.',
    descricao_cliente: 'Redes testadas e aprovadas sem vazamentos ou falhas elétricas.',
    ordem: 2,
    status: 'NAO_INICIADO',
  },
  {
    id: 7,
    etapa_id: 4,
    nome: 'Acabamentos iniciados',
    descricao_tecnica: 'Contrapiso acústico, impermeabilização de áreas molhadas e assentamento.',
    descricao_cliente: 'Aplicação dos pisos, revestimentos de banheiros e cozinha.',
    ordem: 1,
    status: 'NAO_INICIADO',
  },
  {
    id: 8,
    etapa_id: 4,
    nome: 'Acabamentos concluídos',
    descricao_tecnica: 'Pintura acrílica final, instalação de metais, louças e vistoria de entrega.',
    descricao_cliente: 'Imóvel finalizado, limpo e pronto para vistoria de entrega das chaves.',
    ordem: 2,
    status: 'NAO_INICIADO',
  },
];

export const LOCAIS_HIERARQUIA_SEED: LocalHierarquia[] = [
  {
    id: 1,
    empreendimento_id: 1,
    parent_id: null,
    nome: 'Bloco A',
    tipo: 'BLOCO',
    ordem: 1,
    filhos: [
      {
        id: 2,
        empreendimento_id: 1,
        parent_id: 1,
        nome: '1º Pavimento',
        tipo: 'PAVIMENTO',
        ordem: 1,
        filhos: [
          { id: 3, empreendimento_id: 1, parent_id: 2, nome: 'Unidade 101', tipo: 'UNIDADE', ordem: 1, filhos: [] },
          { id: 4, empreendimento_id: 1, parent_id: 2, nome: 'Unidade 102', tipo: 'UNIDADE', ordem: 2, filhos: [] },
        ],
      },
      {
        id: 5,
        empreendimento_id: 1,
        parent_id: 1,
        nome: '2º Pavimento',
        tipo: 'PAVIMENTO',
        ordem: 2,
        filhos: [
          { id: 6, empreendimento_id: 1, parent_id: 5, nome: 'Unidade 201', tipo: 'UNIDADE', ordem: 1, filhos: [] },
          { id: 7, empreendimento_id: 1, parent_id: 5, nome: 'Unidade 202', tipo: 'UNIDADE', ordem: 2, filhos: [] },
        ],
      },
      {
        id: 8,
        empreendimento_id: 1,
        parent_id: 1,
        nome: '3º Pavimento',
        tipo: 'PAVIMENTO',
        ordem: 3,
        filhos: [
          { id: 9, empreendimento_id: 1, parent_id: 8, nome: 'Unidade 301', tipo: 'UNIDADE', ordem: 1, filhos: [] },
          { id: 10, empreendimento_id: 1, parent_id: 8, nome: 'Unidade 302', tipo: 'UNIDADE', ordem: 2, filhos: [] },
        ],
      },
    ],
  },
  {
    id: 11,
    empreendimento_id: 1,
    parent_id: null,
    nome: 'Bloco B',
    tipo: 'BLOCO',
    ordem: 2,
    filhos: [
      {
        id: 12,
        empreendimento_id: 1,
        parent_id: 11,
        nome: '1º Pavimento',
        tipo: 'PAVIMENTO',
        ordem: 1,
        filhos: [
          { id: 13, empreendimento_id: 1, parent_id: 12, nome: 'Unidade 101-B', tipo: 'UNIDADE', ordem: 1, filhos: [] },
          { id: 14, empreendimento_id: 1, parent_id: 12, nome: 'Unidade 102-B', tipo: 'UNIDADE', ordem: 2, filhos: [] },
        ],
      },
    ],
  },
];

export function achatarLocaisHierarquia(arvore: LocalHierarquia[]): LocalObra[] {
  const resultado: LocalObra[] = [];
  function percorrer(nos: LocalHierarquia[], prefixo: string = '') {
    for (const no of nos) {
      const nomeComposto = prefixo ? `${prefixo} • ${no.nome}` : no.nome;
      resultado.push({
        id: no.id,
        empreendimento_id: no.empreendimento_id,
        parent_id: no.parent_id,
        nome: nomeComposto,
        tipo: no.tipo,
        ordem: no.ordem,
      });
      if (no.filhos && no.filhos.length > 0) {
        percorrer(no.filhos, nomeComposto);
      }
    }
  }
  percorrer(arvore);
  return resultado;
}

export const PROGRESSO_SEED: ProgressoEmpreendimento = {
  empreendimento_id: 1,
  percentual: 52,
  total: 16,
  concluidos: 8,
  em_andamento: 4,
  nao_iniciados: 4,
  status: 'EM_ANDAMENTO',
  etapas: [
    { etapa_id: 1, nome: 'Fundação', percentual: 100, concluidos: 2, total: 2, status: 'CONCLUIDO' },
    { etapa_id: 2, nome: 'Estrutura', percentual: 75, concluidos: 1, em_andamento: 1, total: 2, status: 'EM_ANDAMENTO' },
    { etapa_id: 3, nome: 'Instalações', percentual: 35, concluidos: 0, em_andamento: 1, total: 2, status: 'EM_ANDAMENTO' },
    { etapa_id: 4, nome: 'Acabamentos', percentual: 0, concluidos: 0, nao_iniciados: 2, total: 2, status: 'NAO_INICIADO' },
  ],
};

export const EVIDENCIAS_SEED: EvidenciaBackend[] = [
  {
    id: 101,
    empreendimento_id: 1,
    local_obra_id: 1,
    marco_id: 1,
    item_protocolo_id: 1,
    arquivo_url: '/uploads/empreendimentos/1/evidencias/parque-das-aguas-01.jpeg',
    descricao_tecnica:
      'Locação topográfica, gabarito da obra e escavação das sapatas do Bloco A concluídos conforme projeto de fundações.',
    capturado_em: '2026-09-12T10:15:00Z',
    capturado_por: 2,
    criado_em: '2026-09-12T10:16:00Z',
    atualizado_em: '2026-09-12T10:16:00Z',
    status_validacao: 'VALIDA',
    validado_em: '2026-09-12T14:00:00Z',
    validado_por_nome: 'Marina Albuquerque',
    local_obra: { id: 1, nome: 'Bloco A • Fundação Geral', tipo: 'BLOCO', parent_id: null },
    marco: { id: 1, nome: 'Fundação iniciada', descricao_tecnica: 'Escavação e armação' },
    responsavel: { id: 2, nome: 'Eng. Rafael Nogueira', email: 'demo.gestor1@example.com', papel: 'GESTOR' },
  },
  {
    id: 102,
    empreendimento_id: 1,
    local_obra_id: 3,
    marco_id: 2,
    item_protocolo_id: 2,
    arquivo_url: '/uploads/empreendimentos/1/evidencias/parque-das-aguas-02.jpeg',
    descricao_tecnica:
      'Concretagem das vigas baldrame e aplicação de impermeabilização asfáltica dupla camada nos alicerces.',
    capturado_em: '2026-09-25T15:40:00Z',
    capturado_por: 3,
    criado_em: '2026-09-25T15:42:00Z',
    atualizado_em: '2026-09-25T15:42:00Z',
    status_validacao: 'VALIDA',
    validado_em: '2026-09-25T17:30:00Z',
    validado_por_nome: 'Marina Albuquerque',
    local_obra: { id: 3, nome: 'Bloco A • 1º Pavimento', tipo: 'PAVIMENTO', parent_id: 1 },
    marco: { id: 2, nome: 'Fundação concluída', descricao_tecnica: 'Baldrames e impermeabilização' },
    responsavel: { id: 3, nome: 'Eng. Camila Ferreira', email: 'demo.gestor2@example.com', papel: 'GESTOR' },
  },
  {
    id: 103,
    empreendimento_id: 1,
    local_obra_id: 5,
    marco_id: 3,
    item_protocolo_id: 3,
    arquivo_url: '/uploads/empreendimentos/1/evidencias/parque-das-aguas-03.jpeg',
    descricao_tecnica:
      'Conferência de armadura positiva e negativa da laje do 2º pavimento antes do lançamento do concreto usinado.',
    capturado_em: '2026-10-08T11:20:00Z',
    capturado_por: 2,
    criado_em: '2026-10-08T11:22:00Z',
    atualizado_em: '2026-10-08T11:22:00Z',
    status_validacao: 'VALIDA',
    validado_em: '2026-10-08T16:10:00Z',
    validado_por_nome: 'Eng. Rafael Nogueira',
    local_obra: { id: 5, nome: 'Bloco A • 2º Pavimento', tipo: 'PAVIMENTO', parent_id: 1 },
    marco: { id: 3, nome: 'Estrutura iniciada', descricao_tecnica: 'Pilares e lajes' },
    responsavel: { id: 2, nome: 'Eng. Rafael Nogueira', email: 'demo.gestor1@example.com', papel: 'GESTOR' },
  },
  {
    id: 104,
    empreendimento_id: 1,
    local_obra_id: 7,
    marco_id: 4,
    item_protocolo_id: 4,
    arquivo_url: '/uploads/empreendimentos/1/evidencias/parque-das-aguas-04.jpeg',
    descricao_tecnica:
      'Concretagem da laje da Unidade 202 (2º pavimento) finalizada com ensaio de abatimento (Slump Test) e moldagem de corpos de prova aprovados.',
    capturado_em: '2026-10-19T16:05:00Z',
    capturado_por: 2,
    criado_em: '2026-10-19T16:06:00Z',
    atualizado_em: '2026-10-19T16:06:00Z',
    status_validacao: 'VALIDA',
    validado_em: '2026-10-19T18:00:00Z',
    validado_por_nome: 'Marina Albuquerque',
    local_obra: { id: 7, nome: 'Bloco A • 2º Pav • Unidade 202', tipo: 'UNIDADE', parent_id: 5 },
    marco: { id: 4, nome: 'Estrutura concluída', descricao_tecnica: 'Laje e alvenaria estrutural' },
    responsavel: { id: 2, nome: 'Eng. Rafael Nogueira', email: 'demo.gestor1@example.com', papel: 'GESTOR' },
  },
  {
    id: 105,
    empreendimento_id: 1,
    local_obra_id: 7,
    marco_id: 5,
    item_protocolo_id: 5,
    arquivo_url: '/uploads/empreendimentos/1/evidencias/parque-das-aguas-05.jpeg',
    descricao_tecnica:
      'Elevação da alvenaria interna da Unidade 202 e embutimento dos ramais elétricos e prumadas hidrossanitárias.',
    capturado_em: '2026-10-29T14:30:00Z',
    capturado_por: 3,
    criado_em: '2026-10-29T14:32:00Z',
    atualizado_em: '2026-10-29T14:32:00Z',
    status_validacao: 'PENDENTE',
    local_obra: { id: 7, nome: 'Bloco A • 2º Pav • Unidade 202', tipo: 'UNIDADE', parent_id: 5 },
    marco: { id: 5, nome: 'Instalações iniciadas', descricao_tecnica: 'Tubulações e eletrodutos' },
    responsavel: { id: 3, nome: 'Eng. Camila Ferreira', email: 'demo.gestor2@example.com', papel: 'GESTOR' },
  },
];

export const PROTOCOLOS_SEED: ProtocoloEvidencia[] = [
  {
    id: 1,
    marco_id: 2,
    nome: 'Protocolo de Impermeabilização de Baldrame',
    descricao: 'Verificação fotográfica obrigatória de regularização e pintura asfáltica.',
    quantidade_minima: 2,
    itens: [
      { id: 1, protocolo_id: 1, nome: 'Superfície limpa e regularizada', descricao: 'Foto aberta da viga', obrigatorio: true, ordem: 1 },
      { id: 2, protocolo_id: 1, nome: 'Aplicação da 2ª demão asfáltica', descricao: 'Detalhe de cobrimento', obrigatorio: true, ordem: 2 },
    ],
  },
  {
    id: 2,
    marco_id: 4,
    nome: 'Protocolo de Concretagem de Laje',
    descricao: 'Controle tecnológico de concreto estrutural e conferência de armaduras.',
    quantidade_minima: 3,
    itens: [
      { id: 3, protocolo_id: 2, nome: 'Espaçadores e cobrimento de armadura', descricao: 'Mínimo 2,5cm', obrigatorio: true, ordem: 1 },
      { id: 4, protocolo_id: 2, nome: 'Slump Test e moldagem de CP', descricao: 'Registro do ensaio no caminhão betoneira', obrigatorio: true, ordem: 2 },
      { id: 5, protocolo_id: 2, nome: 'Cura úmida pós-concretagem', descricao: 'Visão geral do pano de laje', obrigatorio: false, ordem: 3 },
    ],
  },
];

export const CONTRATOS_SEED: ContratoObra[] = [
  {
    id: 'ctr-001',
    empreendimento_id: 1,
    numero_contrato: 'CTR-2026/014',
    objeto: 'Fornecimento de Concreto Usinado Bombeado Fck 35MPa',
    fornecedor_nome: 'SuperMix Concreto S/A',
    fornecedor_cnpj: '14.892.301/0001-40',
    valor_total: 485000,
    status: 'ATIVO',
    data_inicio: '15/04/2026',
    data_fim_prevista: '20/12/2026',
    percentual_medido: 68,
  },
  {
    id: 'ctr-002',
    empreendimento_id: 1,
    numero_contrato: 'CTR-2026/019',
    objeto: 'Mão de Obra Especializada em Fôrmas e Armação Estrutural',
    fornecedor_nome: 'Vértice Engenharia Estrutural Ltda',
    fornecedor_cnpj: '28.410.992/0001-12',
    valor_total: 320000,
    status: 'ATIVO',
    data_inicio: '02/05/2026',
    data_fim_prevista: '30/11/2026',
    percentual_medido: 75,
  },
  {
    id: 'ctr-003',
    empreendimento_id: 1,
    numero_contrato: 'CTR-2026/027',
    objeto: 'Instalações Hidrossanitárias, Prumadas e Combate a Incêndio',
    fornecedor_nome: 'HidroNorte Instalações Técnicas',
    fornecedor_cnpj: '09.115.740/0001-88',
    valor_total: 215000,
    status: 'ATIVO',
    data_inicio: '10/09/2026',
    data_fim_prevista: '15/03/2027',
    percentual_medido: 32,
  },
  {
    id: 'ctr-004',
    empreendimento_id: 1,
    numero_contrato: 'CTR-2026/004',
    objeto: 'Sondagem SPT, Terraplenagem e Escavação de Fundações',
    fornecedor_nome: 'GeoSolo Fundações e Geotecnia',
    fornecedor_cnpj: '33.601.118/0001-05',
    valor_total: 164000,
    status: 'CONCLUIDO',
    data_inicio: '10/03/2026',
    data_fim_prevista: '30/06/2026',
    percentual_medido: 100,
  },
];

export interface EnterpriseSnapshot {
  empreendimentos: Empreendimento[];
  etapas: Etapa[];
  marcos: Marco[];
  estruturaFisica: LocalHierarquia[];
  progresso: ProgressoEmpreendimento;
  evidencias: EvidenciaBackend[];
  contratos: ContratoObra[];
}

const SNAPSHOT_INICIAL: EnterpriseSnapshot = {
  empreendimentos: EMPREENDIMENTOS_SEED,
  etapas: ETAPAS_SEED,
  marcos: MARCOS_SEED,
  estruturaFisica: LOCAIS_HIERARQUIA_SEED,
  progresso: PROGRESSO_SEED,
  evidencias: EVIDENCIAS_SEED,
  contratos: CONTRATOS_SEED,
};

let memoriaSnapshot: EnterpriseSnapshot = { ...SNAPSHOT_INICIAL };

export const snapshotStore = {
  async obter(): Promise<EnterpriseSnapshot> {
    try {
      const salvo = await AsyncStorage.getItem(CHAVE_SNAPSHOT_LOCAL);
      if (salvo) {
        const parsed = JSON.parse(salvo) as Partial<EnterpriseSnapshot>;
        memoriaSnapshot = {
          empreendimentos: parsed.empreendimentos?.length ? parsed.empreendimentos : EMPREENDIMENTOS_SEED,
          etapas: parsed.etapas?.length ? parsed.etapas : ETAPAS_SEED,
          marcos: parsed.marcos?.length ? parsed.marcos : MARCOS_SEED,
          estruturaFisica: parsed.estruturaFisica?.length ? parsed.estruturaFisica : LOCAIS_HIERARQUIA_SEED,
          progresso: parsed.progresso || PROGRESSO_SEED,
          evidencias: parsed.evidencias?.length ? parsed.evidencias : EVIDENCIAS_SEED,
          contratos: parsed.contratos?.length ? parsed.contratos : CONTRATOS_SEED,
        };
      }
    } catch {
      // Ignora erro de leitura e mantém memória
    }
    return memoriaSnapshot;
  },

  async salvar(parcial: Partial<EnterpriseSnapshot>): Promise<EnterpriseSnapshot> {
    const atual = await this.obter();
    memoriaSnapshot = {
      ...atual,
      ...parcial,
    };
    try {
      await AsyncStorage.setItem(CHAVE_SNAPSHOT_LOCAL, JSON.stringify(memoriaSnapshot));
    } catch {
      // Ignora erro de escrita
    }
    return memoriaSnapshot;
  },
};

