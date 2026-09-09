# Obras de demonstração em Palmas

`obras.ts` exporta `obrasMock`, uma coleção tipada pela interface `Obra` de
`../domain/obra.ts`. Ela contém seis obras fictícias em andamento, com progresso,
responsável, orçamento em reais, datas ISO (`YYYY-MM-DD`) e informações de localização.
Empresas, valores, cronogramas e intervenções são inventados.

Os seis locais são reais. Os dados e contornos existentes da UFT e da Praça dos
Girassóis foram preservados integralmente. Os demais contornos foram extraídos do
OpenStreetMap sem simplificar ou arredondar as coordenadas da fonte, em 7 de
setembro de 2026.

| Local | Intervenção fictícia | Fonte e escopo do contorno | Posições externas |
| --- | --- | --- | --- |
| UFT | Modernização dos espaços acadêmicos | [Área do câmpus, way 961919966](https://www.openstreetmap.org/way/961919966) | 64 |
| Praça dos Girassóis | Revitalização dos passeios e da iluminação | [Área da praça, relation 3499188](https://www.openstreetmap.org/relation/3499188) | 324 |
| Aeroporto de Palmas — Brigadeiro Lysias Rodrigues | Modernização do terminal de passageiros | [Área aeroportuária, way 949951960](https://www.openstreetmap.org/way/949951960) | 95 |
| UNITINS — Câmpus Graciosa | Reforma de laboratórios e acessibilidade | [Área do câmpus, way 959862428](https://www.openstreetmap.org/way/959862428) | 5 |
| HGP — Hospital Geral de Palmas | Reforma de enfermarias e instalações hospitalares | [Edifício, relation 3424114](https://www.openstreetmap.org/relation/3424114) | 41 |
| Estádio Nilton Santos | Recuperação do gramado e reforma dos vestiários | [Área do estádio, way 254842450](https://www.openstreetmap.org/way/254842450) | 29 |

A UNITINS corresponde ao [Câmpus Graciosa na Quadra 109 Norte, Avenida NS 15,
Lote 09](https://www.unitins.edu.br/nPortal/campus-palmas).
O HGP preserva também os cinco anéis internos da relação, com 9, 5, 21, 9 e 7
posições, que recortam os pátios do preenchimento. Sua geometria representa o
edifício, não todo o terreno hospitalar. O aeroporto usa a área aeroportuária
mapeada, embora a obra fictícia se concentre no terminal. O estádio não abrange
todo o complexo esportivo do entorno.

Os polígonos são referências cartográficas dos locais, não limites de canteiros
reais nem levantamentos topográficos. Preservar as coordenadas da fonte não
garante precisão cadastral ou atualização do mapeamento. Os popups identificam
o caráter fictício das obras e disponibilizam o link e o escopo de cada novo contorno.
Dados © OpenStreetMap contributors, sob [ODbL](https://www.openstreetmap.org/copyright).

Todas as coordenadas seguem a ordem do Leaflet: **[latitude, longitude]**.
O primeiro ponto de cada perímetro se repete ao final para fechar o polígono.
`coordenadas` contém o anel externo; `aneisInternos`, quando presente, contém
os recortes. `escopoCoordenadas` descreve a área representada no popup.

Para acrescentar uma obra, adicione um objeto com ID único em `obrasMock`.
`MapComponent` recebe a coleção pela propriedade obrigatória `obras` — não a
importa diretamente — e deriva dela a contagem, as camadas, os popups e o
enquadramento; apresenta um estado vazio quando a coleção não contém registros.
