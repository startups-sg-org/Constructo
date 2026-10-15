# [FRONT] Construir o explorador de estrutura do empreendimento

## Objetivo

Implementar a área **Estrutura** de um empreendimento específico usando **React, React Bootstrap e Vite**, com organização inspirada no explorador de arquivos do GitHub.

Permitir navegar pela hierarquia de locais da obra, consultar detalhes e executar as operações de cadastro disponíveis no backend.

**A navbar do empreendimento já está construída.** Esta issue contempla somente o conteúdo da aba Estrutura e sua integração com o contexto atual.

## Escopo

- Árvore navegável de locais.
- Breadcrumb do nível selecionado.
- Listagem compacta dos filhos diretos.
- Busca no nível atual.
- Painel de detalhes.
- Criação e edição de locais.
- Exclusão, quando suportada e permitida pelo backend.
- Estados de carregamento, erro e vazio.
- Responsividade e acessibilidade.

Não incluir taxonomias de etapas, contratos, medições, documentos ou reconstrução da navbar.

## 1. Validar o contrato existente

Antes da implementação:

- Identificar como o empreendimento selecionado é obtido pela página.
- Localizar endpoints, tipos e serviços existentes de estrutura.
- Confirmar representação de parentesco, tipos de local e ordenação.
- Confirmar campos obrigatórios e regras de criação, edição e exclusão.
- Identificar as permissões disponíveis.
- Verificar se a API retorna a árvore completa ou os filhos por local.

Usar **bloco/torre → pavimento → unidade** como referência visual, respeitando a hierarquia efetivamente permitida pelo domínio. Não fixar três níveis no componente se o backend aceitar uma estrutura genérica.

**Entrega dessa etapa:** registrar na issue os endpoints utilizados, o formato dos dados e eventuais dependências de backend. Não inventar endpoints ou regras para preencher lacunas.

## 2. Layout da área Estrutura

### Desktop

Organizar o conteúdo em três regiões:

| Região   | Conteúdo                                                     |
| -------- | ------------------------------------------------------------ |
| Esquerda | Árvore recolhível dos locais                                 |
| Centro   | Breadcrumb, busca, ação de criação e listagem do nível atual |
| Direita  | Detalhes do local selecionado                                |

Aplicar superfícies neutras, bordas discretas, espaçamento compacto e destaque consistente para seleção. Reutilizar cores e estilos do Constructo.

Utilizar `Container`, `Row`, `Col`, `Button`, `Table`, `Form`, `Breadcrumb`, `Dropdown` e outros componentes existentes do React Bootstrap conforme necessário.

### Mobile

- Exibir a listagem como conteúdo principal.
- Disponibilizar a árvore em `Offcanvas`.
- Abrir detalhes em `Offcanvas` ou área dedicada.
- Manter nome, tipo e ações essenciais visíveis.
- Evitar depender de uma tabela larga para operar a tela.

## 3. Navegação hierárquica

- Ao abrir a aba, mostrar os locais raiz do empreendimento.
- Ao selecionar um local na árvore, mostrar seus filhos diretos e seus detalhes.
- Permitir expandir e recolher um ramo sem alterar a seleção.
- Ao clicar no nome de um local na listagem, navegar para ele.
- Atualizar breadcrumb, seleção e listagem de forma sincronizada.
- Permitir retornar à raiz e aos ancestrais pelo breadcrumb.
- Manter os ramos expandidos durante atualizações de dados.
- Diferenciar visualmente o local selecionado de um ramo apenas expandido.
- Não mostrar controles de expansão em locais sem filhos.

Quando compatível com o roteamento existente, persistir a seleção em um parâmetro como `?local=<id>`, preservando outros parâmetros. Um acesso direto deve restaurar a seleção; um ID inválido deve apresentar mensagem e permitir retornar à raiz.

## 4. Listagem do nível atual

Exibir uma linha por filho direto, com:

- Nome.
- Tipo do local.
- Quantidade de filhos, quando disponível.
- Menu de ações permitido para o usuário.

A busca deve filtrar **somente os filhos do nível atual**, com indicação clara desse alcance. Não apresentar o campo como busca global da estrutura.

Respeitar a ordenação retornada pelo domínio. Caso não exista ordenação definida, documentar a regra adotada.

Distinguir:

- Empreendimento sem estrutura.
- Local sem filhos.
- Busca sem resultados.

O botão principal acompanha o contexto: **Adicionar bloco**, **Adicionar pavimento**, **Adicionar unidade** ou **Adicionar local**, conforme os tipos aceitos. Se houver vários tipos permitidos, oferecer seleção explícita.

## 5. Painel de detalhes

Apresentar os campos disponíveis no modelo:

- Nome.
- Tipo.
- Local pai ou indicação de raiz.
- Caminho completo na hierarquia.
- Descrição, quando existente.
- Outros atributos relevantes já previstos no domínio.

Disponibilizar ações de edição e exclusão conforme permissões.

Não exibir progresso, situação de execução ou valores financeiros sem uma fonte de dados prevista no escopo.

## 6. Criação e edição

Reutilizar um formulário para criação e edição, com rótulos visíveis e mensagens de validação próximas aos campos.

### Criação

- Preencher o pai com o local atualmente selecionado.
- Na raiz, usar o empreendimento como contexto.
- Restringir tipos às opções permitidas.
- Após sucesso, atualizar árvore e listagem, expandir o pai e selecionar o novo local.

### Edição

- Carregar os valores atuais.
- Permitir alterar somente os campos suportados.
- Após sucesso, atualizar nome, detalhes, árvore e breadcrumb.
- Não permitir reparentear um local sem suporte explícito do backend.

### Comportamento comum

- Validar campos obrigatórios conforme o contrato da API.
- Desabilitar envio durante a requisição.
- Preservar os dados preenchidos em caso de erro.
- Exibir erros de campo e erros gerais.
- Confirmar descarte quando houver alterações não salvas.
- Evitar empilhar modais.

## 7. Exclusão

Implementar apenas se houver endpoint e regra definidos.

- Pedir confirmação mostrando o nome do local.
- Respeitar restrições para locais com filhos ou vínculos.
- Não implementar exclusão em cascata por iniciativa do frontend.
- Exibir a mensagem de bloqueio retornada pelo backend.
- Após sucesso, remover o local da interface e selecionar o pai ou a raiz.



Responsabilidades:

- **Página:** coordenar layout e seleção.
- **Componentes:** apresentar dados e emitir eventos.
- **Hook:** coordenar carregamento, navegação e operações.
- **Serviço:** encapsular chamadas HTTP.

Reutilizar o cliente HTTP, autenticação, notificações e gerenciamento de requisições já adotados. Não introduzir outra biblioteca de estado sem necessidade.

Manter estados distintos para:

- Local selecionado.
- IDs dos ramos expandidos.
- Busca do nível atual.
- Formulário ativo.
- Carregamento e erros das operações.

Usar IDs estáveis como `key`. Evitar duplicar a estrutura em vários estados; derivar filhos e ancestrais a partir da fonte de dados quando possível.

Impedir que respostas antigas sobrescrevam o empreendimento ou local selecionado mais recentemente.

## 9. Estados e acessibilidade

- **Loading inicial:** placeholders compatíveis com árvore e listagem.
- **Erro inicial:** mensagem e ação “Tentar novamente”.
- **Vazio:** explicação contextual e ação de criação, se permitida.
- **Atualização:** manter conteúdo visível e indicar operação em andamento.
- **Falha de operação:** preservar contexto e permitir nova tentativa.

Para acessibilidade:

- Usar botões reais para expandir ramos.
- Informar `aria-expanded` e fornecer nomes aos botões de ícone.
- Manter foco visível e operação por teclado.
- Restaurar o foco ao fechar formulários e painéis.
- Não depender apenas de cor para comunicar seleção ou erro.
- Se usar `role="tree"`, implementar também o comportamento de teclado correspondente.

## Critérios de aceite

- [ ] A tela funciona dentro da aba Estrutura existente.
- [ ] Dados e operações usaAtue como web/.AGENTS/agente-arquiteto/verificador na issue N.
Leia somente os arquivos diretamente relacionados à etapa solicitada.
Seja objetivo, não repita o planejamento e não execute pytest sem autorização.
Altere apenas o escopo informado e registre na issue os arquivos, validações e
pendências restantes.m o empreendimento correto.
- [ ] A árvore representa a hierarquia retornada pela API.
- [ ] Expandir um ramo não altera a seleção.
- [ ] Selecionar um local sincroniza árvore, breadcrumb, filhos e detalhes.
- [ ] A listagem mostra apenas os filhos diretos.
- [ ] A busca informa seu alcance e trata ausência de resultados.
- [ ] Criação e edição atualizam todas as regiões afetadas.
- [ ] Exclusão respeita vínculos e restrições do backend.
- [ ] Ações são exibidas conforme permissões.
- [ ] Loading, erro e diferentes estados vazios são tratados.
- [ ] Trocas rápidas de seleção não exibem dados de respostas antigas.
- [ ] A interface funciona em desktop e celular.
- [ ] A navegação e os formulários funcionam por teclado.
- [ ] Nenhuma funcionalidade fora de Estrutura foi adicionada.

## Validação

Verificar os fluxos com estrutura vazia, múltiplos ramos e diferentes profundidades. Cobrir seleção, navegação por ancestrais, criação, edição, exclusão bloqueada, falha de API e usuário sem permissão de escrita.

Adicionar testes de integração para sincronização da seleção e atualização após operações, utilizando as ferramentas existentes no projeto.

## Dependências

- Contexto e rota do empreendimento disponíveis.
- Contrato de API de estrutura identificado.
- Regras de hierarquia e permissões definidas.
- Navbar e layout do empreendimento existentes.

## Registro do arquiteto/verificador — 2026-10-15

### Contrato confirmado

- Contexto e rota: `:empreendimentoId` é fornecido por
  `admin/empreendimentos/:empreendimentoId/estrutura`; o loader carrega o
  empreendimento e a estrutura em `empreendimentos.loader.ts`.
- Leitura: `GET /empreendimentos/{id}/estrutura-fisica` retorna a árvore
  completa. Cada nó possui `id`, `empreendimento_id`, `parent_id`, `nome`,
  `tipo`, `ordem`, auditoria e `filhos`; o backend ordena irmãos por
  `ordem, id` (`servicos.py`).
- Operações disponíveis: `POST /locais` cria raízes `TORRE`/`BLOCO`; `POST`
  nos recursos `pavimentos` e `unidades` cria os descendentes permitidos;
  `PATCH /locais/{local_id}` altera apenas `nome` e `ordem`. Não há endpoint
  de exclusão.
- Regras e acesso: a hierarquia é raiz (`TORRE`/`BLOCO`) → `PAVIMENTO` →
  `UNIDADE`; unidades não recebem filhos. Backend e rota administrativa
  exigem `ADMIN` ou `GESTOR`.

### Atendidos

- A aba existente usa o empreendimento da rota e a árvore completa da API:
  `router.tsx`, `empreendimentos.loader.ts` e
  `StructureManagementPage.tsx`.
- Árvore, expansão independente da seleção, seleção por `?localId=`, caminho
  hierárquico e detalhes básicos estão presentes em `StructureTree.tsx`,
  `localSelecionado.ts` e `LocationDetails.tsx`.
- Criação de raiz/pavimento/unidade e edição de nome/ordem usam apenas os
  endpoints suportados: `empreendimentos.service.ts`,
  `empreendimentos.action.ts` e `LocationForm.tsx`.
- A árvore usa controles reais com `aria-expanded` e há cobertura focal para
  expansão/seleção e resolução do caminho em `StructureTree.test.tsx` e
  `localSelecionado.test.ts`.

### Parcialmente atendidos

- O conteúdo atual mostra árvore e detalhes em duas colunas; falta a região
  central com breadcrumb, busca limitada aos filhos diretos e listagem
  compacta (`StructureManagementPage.tsx`, `StructureManagementPage.css`).
- A seleção é persistida na URL, mas ID inexistente é tratado como ausência de
  seleção, sem mensagem nem ação explícita para retornar à raiz
  (`localSelecionado.ts`, `StructureManagementPage.tsx`).
- A responsividade empilha as regiões, mas não fornece `Offcanvas` para árvore
  e detalhes no celular (`LocationDetails.css`, `StructureTree.css`).
- O uso de `role="tree"` não implementa a navegação por setas exigida por esse
  padrão; somente Enter e Espaço selecionam (`StructureTreeItem.tsx`).

### Não implementados

- Listagem dos filhos diretos, busca de escopo local e respectivos estados
  vazios não existem.
- Exclusão, confirmação e mensagens de bloqueio não podem ser implementadas
  sem contrato de `DELETE` no backend.
- Placeholders de carregamento, erro inicial com "Tentar novamente", proteção
  contra descarte de formulário e seleção automática do local recém-criado não
  estão presentes.
- Não há testes de integração para sincronização das três regiões nem para
  atualização após operações.

### Riscos ou pendências

- Confirmar com o backend se haverá exclusão e quais restrições/mensagens ela
  expõe antes de adicionar qualquer ação destrutiva.
- Implementar a listagem como próxima etapa, derivando filhos e ancestrais da
  árvore recebida, sem criar endpoints ou níveis genéricos inexistentes.
- Validar em navegador os estados vazio, erro e mobile após a implementação;
  `pytest` não foi executado.

### Validações executadas

- Inspeção estática do contrato nos schemas, rotas e serviços de domínio do
  backend, e do encadeamento rota → loader → serviço → componentes web.
- Leitura dos testes focais existentes de árvore e seleção. Nenhum teste foi
  executado nesta verificação.

### Atualização de implementação — cards Bootstrap

- `StructureManagementPage.tsx` foi organizada em uma `div` de cards com três
  colunas responsivas: árvore, navegação/listagem e detalhes. A marcação usa
  diretamente `row`, `col-*`, `card`, `card-body` e `btn`.
- Validações: ESLint focal e `tsc --noEmit` aprovados. `pytest` não executado.
- Pendente: ajustar os testes de rota que ainda verificam a marcação anterior
  da árvore e concluir a validação visual dos cards em desktop e celular.

### Correção da página Estrutura

- `StructureManagementPage.tsx` mantém a hierarquia de cards e passou a exibir
  apenas dados de estrutura: árvore, breadcrumb, busca de filhos diretos e
  detalhes do local selecionado. Referências indevidas ao resumo de taxonomia,
  protocolos e estados de `DetalhesEmpreendimento` foram removidas.
- Validações: ESLint focal e `tsc --noEmit` aprovados; `pytest` não executado.
- Pendente: reintroduzir criação/edição somente junto às actions já existentes
  e cobrir a composição de cards com testes de rota.

### Refatoração de estilos

- Classes de `StructureManagementPage.tsx` foram renomeadas para o domínio
  `estrutura-gerenciamento`; `StructureManagementPage.css` foi refeito para
  esses seletores, sem depender dos estilos de detalhes do empreendimento.
- Validações: ESLint focal, `tsc --noEmit` e `git diff --check` aprovados.

### Independência dos cards

- Os cards de árvore, lista e detalhes receberam modificadores próprios e o
  grid usa `align-items: start`; cada card passa a usar somente a altura do
  seu conteúdo.
- Validações: ESLint focal, `tsc --noEmit` e `git diff --check` aprovados.

### Posicionamento dos cards

- Em telas a partir de 700px, o card da árvore ocupa a largura da grade e os
  cards de lista e detalhes são renderizados lado a lado.
- Validação: `git diff --check` aprovado.

# Plan

Implementar a área Estrutura na aba existente, reutilizando a árvore e o contrato já disponíveis. A entrega prioriza navegação sincronizada, listagem de filhos diretos, formulários e estados de interface sem criar regras de backend.

## Scope

- In: árvore, breadcrumb, listagem local, busca, detalhes, criação, edição, responsividade e acessibilidade.
- Out: navbar, taxonomias, contratos, medições, documentos e exclusão sem endpoint.

## Action items


[ ] Consolidar o estado de seleção, expansão, busca e formulário em `StructureManagementPage.tsx`.

[ ] Utilzizar a mesma estrutura de cards/constainers em `DetralhesEmpreendimento.tsx`

[ ] Adicionar breadcrumb e listagem dos filhos diretos derivados de `EstruturaLocal`, preservando a ordem retornada pela API.

[ ] Criar busca restrita ao nível atual, com estados distintos para estrutura vazia, local sem filhos e busca sem resultados.

[ ] Adaptar `StructureTree` para expansão controlada e navegação completa por teclado compatível com `role="tree"`.

[ ] Reestruturar desktop em três regiões e adicionar `Offcanvas` para árvore e detalhes em telas móveis.

[ ] Reutilizar `LocationForm` e as actions existentes para criação e edição, selecionando o novo local após sucesso e preservando dados em falhas.

[ ] Tratar ID inválido em `localId`, carregamento, erro com nova tentativa e confirmação de descarte de formulário alterado.

[ ] Adicionar testes de integração para sincronização seleção–breadcrumb–filhos–detalhes e atualização após criação/edição; executar lint, TypeScript e testes focados autorizados.

## Open questions

- O backend disponibilizará `DELETE` e as mensagens de bloqueio para locais com vínculos? sim
- Há campos adicionais de detalhes além dos retornados por `LocalHierarquiaLer`? sim
