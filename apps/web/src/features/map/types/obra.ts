import type { FeatureCollection, Polygon } from 'geojson'

export interface ObraProperties {
  id: string
  nome: string
  municipio: string
<<<<<<< HEAD
  uf: 'TO'
  tipo: 'Residencial' | 'Comercial' | 'Educacional' | 'Saúde' | 'Logística'
  status: 'Em andamento' | 'Planejada'
  progresso: number
  progressoFisico: number
  progressoPlanejado: number
  etapaAtual: string
  ultimaAtualizacao: string
=======
  uf: string
  tipo: TipoObra
  status: StatusObra
>>>>>>> e843e842ea52cf171ab6c9d1d89fc8605dae0142
  descricao: string
  ficticia: true
}
<<<<<<< HEAD
=======
  progressoFisico: number
  progressoPlanejado: number
  etapaAtual: string
  ultimaAtualizacao: string
  descricao: string
  ficticia: true
}
>>>>>>> e843e842ea52cf171ab6c9d1d89fc8605dae0142

export type ObrasGeoJson = FeatureCollection<Polygon, ObraProperties>
