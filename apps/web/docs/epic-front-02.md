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

### FRONT-202 — Implementar a visão geral (Visualizar)

**Objetivo**

Apresentar uma visão rápida e acionável do empreendimento, equivalente à página
inicial de um repositório, sem substituir as áreas especializadas.

**Escopo**

- Rota índice `/admin/empreendimentos/:empreendimentoId`.
- Card “Sobre o empreendimento” com descrição, endereço e datas já fornecidos
  pelo domínio.
- Resumo contextual de estrutura, taxonomia e atividade somente quando os
  dados existentes estiverem disponíveis; não inventar contagens nem eventos.
- Reutilização de `DetalhesEmpreendimento` e `UploadEvidencia` onde fizer
  sentido, mantendo ações de configuração nas abas próprias.
- Links claros para Estrutura, Taxonomia e demais áreas pelo navbar compartilhado.

**Critérios de aceite**

- [ ] A abertura da aba Visualizar exibe nome, situação, descrição, endereço e
  datas do empreendimento.
- [ ] Informações ausentes usam estado de ausência compreensível, sem valores
  fictícios.
- [ ] A visão geral é somente leitura, exceto ações já autorizadas de evidência.
- [ ] O conteúdo funciona como rota índice e mantém a aba Visualizar ativa.
- [ ] Nenhum dado ou comportamento da estrutura/taxonomia é duplicado na visão
  geral.

**Dependências**

- `FRONT-201`.
- Dados e componentes atuais de `DetalhesEmpreendimento`.

### FRONT-203 — Organizar as rotas próprias de cada aba

**Objetivo**

Garantir navegação profunda, URLs compartilháveis e preservação do contexto do
empreendimento em cada área.

**Escopo**

- Converter o detalhe em rota pai com rota índice e filhos para as sete abas.
- Manter compatibilidade com `/editar`, `/estrutura` e `/taxonomia` já usados.
- Preservar as rotas filhas de protocolos sob Taxonomia, incluindo o
  `marcoId` e o destino do protocolo.
- Criar rotas contextuais de Contratos, Medições e Documentos mesmo quando a
  tela inicial for um adaptador, placeholder ou estado vazio.
- Tratar empreendimento inexistente com o mecanismo de erro da rota, sem
  renderizar um shell sem identidade.

**Critérios de aceite**

- [ ] Cada URL da tabela de rotas abre diretamente após refresh.
- [ ] A troca de aba atualiza URL, conteúdo e estado ativo sem recarregar a
  aplicação inteira.
- [ ] Links de protocolos continuam navegando dentro do contexto de Taxonomia.
- [ ] Um identificador inexistente produz estado de erro consistente e permite
  retornar à listagem.
- [ ] Nenhuma aba usa query string como substituto da rota própria.

**Dependências**

- `FRONT-201`.
- Configuração atual de `router.tsx` e loaders existentes.

### FRONT-204 — Integrar funcionalidades existentes e permissões

**Objetivo**

Conectar cada aba ao fluxo disponível sem criar uma segunda implementação das
funcionalidades de domínio.

**Escopo**

- **Editar:** reutilizar `FormularioEdicaoEmpreendimento`, sua action e
  validações.
- **Estrutura:** reutilizar `StructureManagementPage`, `StructureHeader`, loader
  e action de estrutura; remover apenas navegação redundante que conflite com o
  shell.
- **Taxonomia:** reutilizar `TaxonomyEditor`, loaders/actions e protocolos
  aninhados.
- **Contratos e Medições:** criar pontos de integração/adaptadores para os
  módulos existentes; enquanto o serviço contextual não existir, informar a
  indisponibilidade sem dados simulados.
- **Documentos:** preparar a aba e o contrato de integração; exibir estado
  vazio/indisponível até existir módulo de documentos.
- Aplicar permissões no servidor como fonte de verdade e refletir no cliente:
  usuários admitidos no painel podem visualizar conforme autorização; ações de
  alteração ficam disponíveis apenas para perfis autorizados (atualmente
  ADMIN/GESTOR nos fluxos administrativos). Não ampliar o acesso de COMPRADOR
  nesta épica.

**Critérios de aceite**

- [ ] Editar, Estrutura e Taxonomia executam os loaders/actions já existentes,
  sem cópia de regras de negócio.
- [ ] Acesso sem permissão não exibe controles de mutação e recebe o tratamento
  de autorização da aplicação/backend.
- [ ] Contratos, Medições e Documentos deixam claro quando a integração ainda
  não está disponível e não apresentam registros inventados.
- [ ] O usuário não perde o empreendimento atual ao entrar ou sair de uma aba.
- [ ] A remoção de links redundantes não quebra as URLs legadas suportadas.

**Dependências**

- `FRONT-203`.
- Autorização atual (`requireUser`, roles e políticas do backend).
- Serviços existentes de edição, estrutura e taxonomia.

### FRONT-205 — Garantir responsividade e acessibilidade do shell

**Objetivo**

Manter a navegação utilizável em desktop, tablet e celular, sem perder a
identidade do empreendimento nem a descoberta das abas.

**Escopo**

- Cabeçalho em uma ou duas linhas conforme a largura disponível.
- Navbar horizontal em desktop e mecanismo controlado de quebra ou rolagem
  horizontal em telas estreitas, sem cortar rótulos.
- Conteúdo das abas com grids/cards responsivos e sem overflow horizontal não
  intencional.
- Foco visível, ordem de teclado, nomes acessíveis, `aria-current` e contraste
  suficiente para status e aba ativa.
- Respeito à preferência de redução de movimento.

**Critérios de aceite**

- [ ] Em desktop, cabeçalho, breadcrumb e as sete abas são legíveis sem
  sobreposição.
- [ ] Em celular, todas as abas continuam alcançáveis e a aba ativa permanece
  identificável.
- [ ] Nenhum conteúdo essencial depende apenas de hover ou de um menu de três
  pontos.
- [ ] Navegação por teclado alcança breadcrumb, abas e ações autorizadas em
  ordem previsível.
- [ ] Não há rolagem horizontal involuntária no conteúdo principal.

**Dependências**

- `FRONT-201` e `FRONT-202`.
- Tokens de responsividade do tema Bootstrap.

### FRONT-206 — Definir estados de carregamento, erro e indisponibilidade

**Objetivo**

Comunicar claramente o estado do shell e das páginas filhas durante navegação,
falhas de consulta ou ausência de um módulo integrado.

**Escopo**

- Skeleton do cabeçalho/breadcrumb/navbar enquanto `carregarEmpreendimento`
  está pendente.
- Estado pendente específico para cada aba durante seu loader/action.
- Estado de erro com mensagem, ação de tentar novamente quando aplicável e
  retorno para `/admin/obras`.
- Estado vazio separado de erro para ausência de contratos, medições,
  documentos, taxonomia ou resumo opcional.
- Testes de rota e componentes para carregamento, sucesso, ausência, erro,
  permissão e navegação entre abas.

**Critérios de aceite**

- [ ] O usuário não vê um cabeçalho vazio enquanto o empreendimento ainda está
  carregando.
- [ ] Erro do empreendimento impede a renderização de abas sem contexto e
  oferece caminho de recuperação.
- [ ] Erro de uma aba não apaga o cabeçalho compartilhado nem transforma ausência
  de dados em erro técnico.
- [ ] Estados de módulo não integrado explicam a situação e não prometem uma
  ação inexistente.
- [ ] Há cobertura automatizada para rotas diretas, aba ativa, estados e
  permissões, sem alterar os testes existentes de listagem.

**Dependências**

- `FRONT-201` a `FRONT-204`.
- Harness de testes de router/loaders já utilizado pelo projeto.

## Sequência de entrega

`FRONT-201` → `FRONT-202` → `FRONT-203` → `FRONT-204` → `FRONT-205` e
`FRONT-206`.

`FRONT-205` e `FRONT-206` podem ser executadas em paralelo depois que o shell e
as rotas estiverem estáveis. A implementação de integrações futuras de
Contratos, Medições e Documentos deve permanecer separada desta épica quando
exigir novos serviços, contratos de API ou regras de domínio.
