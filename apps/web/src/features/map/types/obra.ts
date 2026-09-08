export type CoordenadaObra = [latitude: number, longitude: number]

export type TipoObra = 'Educacional' | 'Urbanização' | 'Residencial' | 'Comercial' | 'Saúde' | 'Aeroportuária' | 'Esportiva'
export type StatusObra = 'Em andamento' | 'Paralisada' | 'Concluída'

export interface Obra {
  id: string
  nome: string
  local: string
  municipio: string
  uf: string
  tipo: TipoObra
  status: StatusObra
  descricao: string
  responsavel: string
  progresso: number
  orcamento: number
  dataInicio: string
  previsaoConclusao: string
  coordenadas: CoordenadaObra[]
  /** Pátios e outras áreas excluídas do preenchimento do polígono. */
  aneisInternos?: CoordenadaObra[][]
  escopoCoordenadas?: string
  origemCoordenadas: 'OpenStreetMap' | 'Simulação'
  fonteCoordenadas?: string
  ficticia: boolean
}
  progressoFisico: number
  progressoPlanejado: number
  etapaAtual: string
  ultimaAtualizacao: string
  descricao: string
  ficticia: true
}

export type ObrasGeoJson = FeatureCollection<Polygon, ObraProperties>
