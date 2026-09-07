import type { ObrasGeoJson } from '../types/obra'

// Dados inteiramente fictícios para demonstração; não representam obras reais.
// Perímetros sintéticos próximos às sedes municipais, em [longitude, latitude].
// Progresso físico em percentual (0 a 100).
export const obrasPlanejadas = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "OBR-005",
      "properties": {
        "id": "OBR-005",
        "nome": "Residencial Cerrado",
        "municipio": "Paraíso do Tocantins",
        "uf": "TO",
        "tipo": "Residencial",
        "status": "Planejada",
        "progresso": 0,
        "progressoFisico": 0,
        "progressoPlanejado": 10,
        "etapaAtual": "Projetos e Licenciamento",
        "ultimaAtualizacao": "20/08/2026",
        "descricao": "Implantação de conjunto residencial com infraestrutura de acesso.",
        "ficticia": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -48.8884,
              -10.1758
            ],
            [
              -48.886,
              -10.1758
            ],
            [
              -48.886,
              -10.1742
            ],
            [
              -48.8884,
              -10.1742
            ],
            [
              -48.8884,
              -10.1758
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "OBR-006",
      "properties": {
        "id": "OBR-006",
        "nome": "Centro Logístico Guará",
        "municipio": "Guaraí",
        "uf": "TO",
        "tipo": "Logística",
        "status": "Planejada",
        "progresso": 0,
        "progressoFisico": 0,
        "progressoPlanejado": 15,
        "etapaAtual": "Estudo de Viabilidade",
        "ultimaAtualizacao": "15/08/2026",
        "descricao": "Construção de galpão com docas e pátio de movimentação.",
        "ficticia": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -48.5122,
              -8.8348
            ],
            [
              -48.5098,
              -8.8348
            ],
            [
              -48.5098,
              -8.8332
            ],
            [
              -48.5122,
              -8.8332
            ],
            [
              -48.5122,
              -8.8348
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "OBR-007",
      "properties": {
        "id": "OBR-007",
        "nome": "Escola Veredas",
        "municipio": "Colinas do Tocantins",
        "uf": "TO",
        "tipo": "Educacional",
        "status": "Planejada",
        "progresso": 0,
        "progressoFisico": 0,
        "progressoPlanejado": 5,
        "etapaAtual": "Aprovação de Alvará",
        "ultimaAtualizacao": "28/08/2026",
        "descricao": "Construção de unidade escolar com laboratório e refeitório.",
        "ficticia": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -48.4762,
              -8.0608
            ],
            [
              -48.4738,
              -8.0608
            ],
            [
              -48.4738,
              -8.0592
            ],
            [
              -48.4762,
              -8.0592
            ],
            [
              -48.4762,
              -8.0608
            ]
          ]
        ]
      }
    }
  ]
} satisfies ObrasGeoJson
