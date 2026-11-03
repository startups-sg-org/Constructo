import '@/global.css';
import { Platform } from 'react-native';

/**
 * Paleta Oficial do Constructo (Mineral & Industrial) conforme ui-craft / SKILL.md.
 * Sem degradês roxo/azul de IA, sem cinzas genéricos, alto contraste.
 */
export const ConstructoColors = {
  // Fundos e Superfícies (Alinhados ao @theme)
  fundo: '#F5F7F6',            // Alias de conveniência para fundoPainel
  fundoPainel: '#F5F7F6',      // Off-white mineral (constructo-fundo-painel)
  superficie: '#FFFFFF',       // Branco puro elevado (constructo-superficie)
  superficieSutil: '#F8FAF9',  // Superfície secundária (constructo-superficie-sutil)
  superficiePressionada: '#EEF3F1',

  // Marca e Identidade Industrial
  primaria: '#236557',         // Verde Floresta Industrial (constructo-primaria)
  primariaHover: '#194F45',    // Primária pressionada (constructo-primaria-hover)
  primariaSuave: '#E6F2EF',    // Fundo verde mineral suave
  destaque: '#B97200',         // Âmbar / Ocre de obra (constructo-destaque)
  destaqueSuave: '#FEF3C7',    // Fundo âmbar suave

  // Bordas Nítidas (1px sólido)
  borda: '#DFE5E3',            // Borda padrão (constructo-borda)
  bordaSutil: '#EDF1F0',       // Borda sutil de divisão interna
  bordaFoco: '#B9CDC7',        // Borda de foco (constructo-borda-forte)

  // Tipografia de Alto Contraste
  textoForte: '#153B36',       // Texto forte oficial (constructo-texto-forte)
  textoArdosia: '#0F172A',     // Ardósia profundo para números de impacto
  texto: '#263B37',            // Texto principal (constructo-texto)
  textoSuave: '#62706D',       // Texto secundário / rótulos (constructo-texto-suave)
  textoInvertido: '#FFFFFF',

  // Semânticos de Engenharia & Cores Vivas
  sucesso: '#059669',          // Esmeralda vibrante
  sucessoSuave: '#D1FAE5',
  alerta: '#D97706',           // Âmbar dourado
  alertaSuave: '#FEF3C7',
  erro: '#DC2626',             // Vermelho vivo
  erroSuave: '#FEE2E2',

  // Acentos Cromáticos Vivos para Gráficos, KPIs e Badges
  azulTecnico: '#0284C7',      // Azul ciano técnico
  azulSuave: '#E0F2FE',
  laranjaObra: '#EA580C',      // Laranja solar de canteiro
  laranjaSuave: '#FFEDD5',
  roxoContrato: '#7C3AED',     // Roxo nobre / Jurídico / Contratos
  roxoSuave: '#EDE9FE',
  ouro: '#B45309',             // Ouro
  ouroSuave: '#FEF3C7',
  esmeralda: '#059669',
  esmeraldaSuave: '#D1FAE5',
} as const;

export const ConstructoRadius = {
  xs: 6,
  field: 10,       // radiusField: 10px (inputs e botões)
  button: 12,      // botões de ação primária
  card: 16,        // radiusCard: 16px (cartões)
  cardLarge: 20,
  sheet: 24,
  full: 9999,
} as const;

/**
 * Sombras nítidas de baixa difusão (shadowRadius <= 10 conforme SKILL.md).
 */
export const ConstructoShadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  sheet: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;

export const Colors = {
  light: {
    text: ConstructoColors.textoForte,
    background: ConstructoColors.fundoPainel,
    backgroundElement: ConstructoColors.superficieSutil,
    backgroundSelected: ConstructoColors.bordaFoco,
    textSecondary: ConstructoColors.textoSuave,
    tint: ConstructoColors.primaria,
  },
  dark: {
    text: '#ffffff',
    background: '#121816',
    backgroundElement: '#1A2422',
    backgroundSelected: '#243431',
    textSecondary: '#94A3B8',
    tint: '#34D399',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
