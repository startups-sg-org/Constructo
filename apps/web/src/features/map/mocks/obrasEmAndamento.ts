import type { ObrasGeoJson } from '../types/obra'

// Dados inteiramente fictícios para demonstração; não representam obras reais.
// Perímetros sintéticos próximos às sedes municipais, em [longitude, latitude].
// Progresso físico em percentual (0 a 100).
export const obrasEmAndamento = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "OBR-001",
      "properties": {
        "id": "OBR-001",
        "nome": "Residencial Ipê",
        "municipio": "Palmas",
        "uf": "TO",
        "tipo": "Residencial",
        "status": "Em andamento",
        "progresso": 65,
        "progressoFisico": 65,
        "progressoPlanejado": 70,
        "etapaAtual": "Estrutura e Alvenaria",
        "ultimaAtualizacao": "05/09/2026",
        "descricao": "Construção de dois blocos residenciais com área de convivência.",
        "ficticia": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -48.3348,
              -10.1848
            ],
            [
              -48.3324,
              -10.1848
            ],
            [
              -48.3324,
              -10.1832
            ],
            [
              -48.3348,
              -10.1832
            ],
            [
              -48.3348,
              -10.1848
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "OBR-002",
      "properties": {
        "id": "OBR-002",
        "nome": "Centro Comercial Norte",
        "municipio": "Araguaína",
        "uf": "TO",
        "tipo": "Comercial",
        "status": "Em andamento",
        "progresso": 40,
        "progressoFisico": 40,
        "progressoPlanejado": 50,
        "etapaAtual": "Fundações e Subsolo",
        "ultimaAtualizacao": "01/09/2026",
        "descricao": "Construção de lojas e estacionamento para um centro comercial.",
        "ficticia": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -48.2084,
              -7.1928
            ],
            [
              -48.206,
              -7.1928
            ],
            [
              -48.206,
              -7.1912
            ],
            [
              -48.2084,
              -7.1912
            ],
            [
              -48.2084,
              -7.1928
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "OBR-003",
      "properties": {
        "id": "OBR-003",
        "nome": "Escola Horizonte",
        "municipio": "Gurupi",
        "uf": "TO",
        "tipo": "Educacional",
        "status": "Em andamento",
        "progresso": 80,
        "progressoFisico": 80,
        "progressoPlanejado": 85,
        "etapaAtual": "Acabamento e Pintura",
        "ultimaAtualizacao": "04/09/2026",
        "descricao": "Construção de salas de aula, biblioteca e quadra coberta.",
        "ficticia": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -49.0685,
              -11.7306
            ],
            [
              -49.0661,
              -11.7306
            ],
            [
              -49.0661,
              -11.729
            ],
            [
              -49.0685,
              -11.729
            ],
            [
              -49.0685,
              -11.7306
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": "OBR-004",
      "properties": {
        "id": "OBR-004",
        "nome": "Clínica Boa Vista",
        "municipio": "Porto Nacional",
        "uf": "TO",
        "tipo": "Saúde",
        "status": "Em andamento",
        "progresso": 25,
        "progressoFisico": 25,
        "progressoPlanejado": 30,
        "etapaAtual": "Terraplenagem e Infraestrutura",
        "ultimaAtualizacao": "02/09/2026",
        "descricao": "Construção de consultórios e salas de atendimento ambulatorial.",
        "ficticia": true
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -48.4152,
              -10.7088
            ],
            [
              -48.4128,
              -10.7088
            ],
            [
              -48.4128,
              -10.7072
            ],
            [
              -48.4152,
              -10.7072
            ],
            [
              -48.4152,
              -10.7088
            ]
          ]
        ]
      }
    }
  ]
} satisfies ObrasGeoJson
