import { describe, expect, it } from 'vitest'
import { obrasMock } from './obras'

describe('obrasMock', () => {
  it('contém seis obras fictícias em andamento em Palmas, com IDs únicos', () => {
    expect(obrasMock).toHaveLength(6)
    expect(new Set(obrasMock.map((obra) => obra.id)).size).toBe(6)
    for (const obra of obrasMock) {
      expect(obra.municipio).toBe('Palmas')
      expect(obra.uf).toBe('TO')
      expect(obra.ficticia).toBe(true)
      expect(obra.status).toBe('Em andamento')
      expect(obra.progresso).toBeGreaterThan(0)
      expect(obra.progresso).toBeLessThan(100)
      expect(obra.orcamento).toBeGreaterThan(0)
      expect(Date.parse(obra.previsaoConclusao)).toBeGreaterThan(Date.parse(obra.dataInicio))
    }
  })

  it('mantém os polígonos fechados com coordenadas válidas na região de Palmas', () => {
    for (const obra of obrasMock) {
      for (const anel of [obra.coordenadas, ...(obra.aneisInternos ?? [])]) {
        expect(anel.length).toBeGreaterThanOrEqual(4)
        expect(anel[0]).toEqual(anel.at(-1))
        for (const [latitude, longitude] of anel) {
          expect(Number.isFinite(latitude) && Number.isFinite(longitude)).toBe(true)
          expect(latitude).toBeGreaterThan(-10.5)
          expect(latitude).toBeLessThan(-9.9)
          expect(longitude).toBeGreaterThan(-48.5)
          expect(longitude).toBeLessThan(-47.7)
        }
      }
    }
  })

  it('usa contornos cartográficos identificáveis nos seis locais solicitados', () => {
    expect(obrasMock.map((obra) => obra.local)).toEqual([
      'UFT',
      'Praça dos Girassóis',
      'Aeroporto de Palmas — Brigadeiro Lysias Rodrigues',
      'UNITINS — Câmpus Graciosa',
      'HGP — Hospital Geral de Palmas',
      'Estádio Nilton Santos',
    ])
    for (const obra of obrasMock) {
      expect(obra.origemCoordenadas).toBe('OpenStreetMap')
      expect(obra.fonteCoordenadas).toMatch(/^https:\/\/www\.openstreetmap\.org\/(way|relation)\/\d+$/)
    }
    const hospital = obrasMock.find((obra) => obra.local === 'HGP — Hospital Geral de Palmas')
    expect(hospital?.aneisInternos).toHaveLength(5)
  })
})
