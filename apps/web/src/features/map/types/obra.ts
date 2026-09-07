import type { FeatureCollection, Polygon } from 'geojson'

export interface ObraProperties {
  id: string
  nome: string
  municipio: string
  uf: 'TO'
  tipo: 'Residencial' | 'Comercial' | 'Educacional' | 'Saúde' | 'Logística'
  status: 'Em andamento' | 'Planejada'
  progresso: number
  progressoFisico: number
  progressoPlanejado: number
  etapaAtual: string
  ultimaAtualizacao: string
  descricao: string
  ficticia: true
}

export type ObrasGeoJson = FeatureCollection<Polygon, ObraProperties>
