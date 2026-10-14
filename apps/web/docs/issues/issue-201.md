# EPIC-FRONT-02 — Tela de detalhe do empreendimento

## Objetivo da épica

Transformar a tela de um empreendimento em um espaço de trabalho contextual,
inspirado na navegação de um repositório do GitHub: o empreendimento permanece
identificado no cabeçalho enquanto o usuário alterna entre áreas relacionadas.
Cada aba terá uma rota própria, URL compartilhável e integração com a
funcionalidade já existente no projeto.

Esta épica começa após a seleção de um item em `/admin/obras`. A listagem é
escopo da `EPIC-FRONT-01`; esta épica não altera sua tabela, nem cria APIs para
contratos, medições ou documentos que ainda não estejam disponíveis.

## Decisões de navegação e rotas

| Aba | Rota planejada | Integração inicial |
| --- | --- | --- |
| Visualizar | `/admin/empreendimentos/:empreendimentoId` | Visão geral com os dados do empreendimento |
| Editar | `/admin/empreendimentos/:empreendimentoId/editar` | `FormularioEdicaoEmpreendimento` existente |
| Estrutura | `/admin/empreendimentos/:empreendimentoId/estrutura` | `StructureManagementPage` e loader de estrutura existentes |
| Taxonomia | `/admin/empreendimentos/:empreendimentoId/taxonomia` | `TaxonomyEditor` e rotas de protocolos existentes |
| Contratos | `/admin/empreendimentos/:empreendimentoId/contratos` | Adaptador para a funcionalidade de contratos; não duplicar a rota global |
| Medições | `/admin/empreendimentos/:empreendimentoId/medicoes` | Adaptador para a funcionalidade de medições; não criar dados fictícios |
| Documentos | `/admin/empreendimentos/:empreendimentoId/documentos` | Estado explícito até existir módulo/serviço de documentos |

As rotas atuais de edição, estrutura, taxonomia e protocolos devem continuar
funcionando. As rotas globais de contratos e medições podem ser preservadas
durante a transição, mas a navegação contextual deve carregar o
`empreendimentoId` e não perder o contexto do cabeçalho.

## Issues de implementação

### FRONT-201 — Criar o layout compartilhado do empreendimento

**Objetivo**

Criar um shell único para todas as abas, evitando repetição de cabeçalho e
permitindo que o usuário entenda sempre em qual empreendimento está.

**Escopo**

- Cabeçalho com nome do empreendimento, badge de situação, localização e data
  de atualização.
- Breadcrumb `Empreendimentos / {nome}`; o primeiro item retorna para
  `/admin/obras` e o segundo identifica a página atual.
- Navbar contextual com as abas **Visualizar, Editar, Estrutura, Taxonomia,
  Contratos, Medições e Documentos**.
- Aba ativa determinada pela rota atual, com link navegável e indicador visual.
- Área de conteúdo compartilhada para renderizar a aba filha sem duplicar o
  shell.
- Uso dos componentes e tokens React-Bootstrap + Sass já definidos no projeto.

**Critérios de aceite**

- [ ] Todas as sete abas aparecem com os rótulos definidos e apontam para suas
  rotas próprias.
- [ ] O nome e a situação carregados do empreendimento aparecem no cabeçalho
  em qualquer aba.
- [ ] O breadcrumb possui link funcional para a listagem e não perde o
  identificador do empreendimento.
- [ ] A aba ativa tem estado visual e `aria-current`, inclusive ao abrir uma URL
  diretamente ou atualizar a página.
- [ ] O cabeçalho e a navbar não são replicados dentro das páginas filhas.

**Dependências**

- Loader `carregarEmpreendimento` e rota de detalhe existentes.
- `EPIC-FRONT-01` para a navegação de entrada pela listagem.

Planejamento concluído, sem alterações.

<proposed_plan>
# FRONT-201 — Shell compartilhado do empreendimento

## Resumo

Criar `LayoutEmpreendimento` como rota pai de `/admin/empreendimentos/:empreendimentoId`. Ele carregará a identidade da obra uma única vez, exibirá breadcrumb, cabeçalho e navegação por abas, e renderizará a área filha com `Outlet`. Todas as abas passam a manter o mesmo contexto visual e a mesma URL base.

## Alterações

- Criar `modulos/empreendimentos/componentes/LayoutEmpreendimento.tsx` e seu CSS.
  - Ler o empreendimento com `useRouteLoaderData("empreendimento")`.
  - Exibir breadcrumb React-Bootstrap: link “Empreendimentos” para `/admin/obras` e item atual com o nome da obra.
  - Exibir `h1` com nome, `BadgeStatus` mapeado pelos formatters existentes, endereço com fallback “Localização não informada” e “Atualizado em {data}” com fallback já coberto por `formatarDataEmpreendimento`.
  - Usar `Nav`/`Nav.Link` do React-Bootstrap integrado a `NavLink`; usar `end` em Visualizar e manter Taxonomia ativa também nas rotas profundas de protocolos.
  - Criar as sete abas, nesta ordem e destinos: `.` (Visualizar), `editar`, `estrutura`, `taxonomia`, `contratos`, `medicoes`, `documentos`. Cada link deve resultar em `aria-current="page"` quando ativo.

- Reestruturar `router/router.tsx`.
  - Transformar `empreendimentos/:empreendimentoId` em rota pai com `id: "empreendimento"`, `loader: carregarEmpreendimento`, `element: <LayoutEmpreendimento />` e `errorElement: <ErroRota />`.
  - Converter o detalhe atual em rota `index`; mover editar, estrutura e taxonomia para filhos relativos, preservando URLs atuais e respectivas actions/loaders.
  - Manter as rotas de protocolos como descendentes da rota pai para que também recebam o shell e a aba Taxonomia permaneça ativa.
  - Adicionar rotas filhas `contratos`, `medicoes` e `documentos` com componentes temporários de indisponibilidade, sem dados fictícios nem chamada a serviços inexistentes.
  - Preservar as rotas globais `/admin/contratos` e `/admin/medicoes`.

- Evitar repetição da identidade da obra nas páginas filhas.
  - `DetalhesEmpreendimento`: trocar o cabeçalho com nome/badge por um subtítulo de conteúdo (“Dados da obra”), preservando dados, upload e ações existentes.
  - `StructureManagementPage`: remover `StructureHeader`, pois ele repete nome e retorno já oferecidos pelo shell; manter a seção e sua acessibilidade referenciada pelo título de estrutura.
  - `TaxonomyEditor`: alterar o título de “Taxonomia — {nome}” para “Taxonomia”.
  - Não alterar lógica de formulários, estrutura, taxonomia, protocolos ou serviços nesta issue.

- Estilização:
  - Aplicar tokens de `index.css` e classes Bootstrap/Sass; evitar cores e medidas isoladas.
  - Utilizar icons bootstrap
  - Cabeçalho com superfície, borda e boa quebra de texto; nav com separação visual e indicador ativo baseado em cor, borda e peso.
  - Nesta issue, a largura estreita deve preservar links alcançáveis com rolagem horizontal controlada; refinamento responsivo completo fica para FRONT-205.

## Testes

- Ampliar `router/router.test.tsx` para abrir diretamente cada uma das sete URLs e confirmar:
  - nome, badge, localização/data e breadcrumb no shell;
  - link do breadcrumb volta a `/admin/obras`;
  - os sete destinos e rótulos são renderizados;
  - somente a aba correspondente tem `aria-current="page"`, incluindo URL de protocolo para Taxonomia;
  - URL inválida/empreendimento 404 aciona `ErroRota`, sem renderizar shell;
  - páginas de edição, estrutura e taxonomia continuam acessíveis sob as URLs legadas.
- Testar que a navegação de abas muda o `pathname` e preserva `empreendimentoId`.
- Rodar `pnpm --filter web lint` e o teste focado de rotas após a implementação. Não executar a suíte completa sem autorização, conforme o fluxo econômico.

## Sequência didática curta

1. **Rota pai:** uma rota pode carregar dados e renderizar uma “moldura”; `Outlet` é o espaço reservado para a página filha.
2. **Dados compartilhados:** `useRouteLoaderData("empreendimento")` impede que cabeçalho e abas precisem buscar ou receber props repetidas.
3. **Links ativos:** `NavLink` compara a URL atual ao destino e fornece `aria-current`; `end` evita que Visualizar permaneça ativo em todas as subrotas.
4. **CSS sustentável:** Bootstrap fornece a estrutura (`Breadcrumb` e `Nav`) e os tokens globais definem a aparência consistente.

## Premissas

- O layout contextual é introduzido nesta issue, embora a evolução funcional detalhada das abas pertença às issues 202–206.
- “Localização” corresponde ao campo `endereco` já disponível no tipo `Empreendimento`.
- Contratos, Medições e Documentos exibem indisponibilidade explícita até existir integração de domínio.
</proposed_plan>