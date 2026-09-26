## Descrição

Criar a página administrativa responsável pela gestão completa da estrutura física de um empreendimento.

Essa página deve reunir as funcionalidades desenvolvidas nas issues anteriores.

## Implementar

Criar rota:

`/admin/empreendimentos/:empreendimentoId/estrutura`

Criar estrutura:

StructureManagementPage
├── StructureHeader
├── StructureTree
│   └── StructureTreeItem
├── LocationDetails
└── LocationForm

Permitir:

- visualizar árvore da obra;
- selecionar local;
- criar torre;
- criar bloco;
- criar pavimento;
- criar unidade;
- editar informações básicas do local;
- atualizar a árvore após alterações.

Utilizar Data Router:

- `loader` para carregar empreendimento e estrutura;
- `action` ou `useFetcher` para criação e edição;
- revalidação após alterações;
- estados de navegação;
- tratamento de erros.

Estrutura visual sugerida:

┌─────────────────────────┬──────────────────────────────┐
│ Estrutura               │ Detalhes                    │
│                         │                              │
│ ▾ Torre A               │ Unidade 704                 │
│   ▾ 7º Pavimento        │                              │
│      701                │ Tipo: Unidade               │
│      702                │                              │
│      703                │ Caminho:                    │
│      704                │ Torre A > 7º > 704          │
│                         │                              │
│ ▸ Torre B               │ [ Editar ]                  │
└─────────────────────────┴──────────────────────────────┘

## Critérios de aceite

- [x] página carrega o empreendimento;
- [x] árvore física é exibida;
- [x] usuário consegue expandir e recolher nós;
- [x] usuário consegue selecionar locais;
- [x] usuário consegue criar torre ou bloco;
- [x] usuário consegue criar pavimento;
- [x] usuário consegue criar unidade;
- [x] árvore é atualizada após alterações;
- [x] loading é exibido durante operações;
- [x] erros são tratados;
- [x] página funciona em desktop e mobile;
- [x] implementação utiliza o Data Router atual da aplicação.

## Planejamento de execução

### Descobertas e decisões

- A rota `/admin/empreendimentos/:empreendimentoId/estrutura` e o loader da
  estrutura já existem no frontend. A tela atual renderiza
  `EstruturaEmpreendimento`, `StructureTree` e detalhes básicos da seleção,
  mas ainda não reúne criação, edição e revalidação em uma página de gestão.
- O backend já possui `GET /empreendimentos/{id}/locais` e criação de raiz,
  pavimento e unidade. Não existe atualmente operação de edição de
  `LocalObra`; para cumprir “editar informações básicas”, será necessário
  definir uma operação dedicada, preferencialmente
  `PATCH /empreendimentos/{id}/locais/{local_id}`, preservando as rotas de
  criação existentes.
- A página deve reutilizar `LocalObra_FromDB_Schema`, os schemas específicos de
  criação e o estado de seleção da issue 162. O tipo do local, o
  `empreendimento_id` e o `parent_id` não podem ser alterados livremente pela
  edição sem uma regra de movimentação explicitamente aprovada.
- A responsabilidade do `agente.md` é o backend do módulo e ele proíbe
  modificar frontend. A execução completa depende, portanto, de um agente de
  frontend; este plano registra os contratos backend e a integração necessária
  sem alterar código de interface nesta etapa.

### Implementação prevista

- Backend — schemas: criar um schema de edição de local, com `extra="forbid"`,
  permitindo somente campos básicos definidos pelo produto, inicialmente
  `nome` e `ordem`, com as mesmas regras de texto não vazio e `ordem >= 0` dos
  schemas existentes. Reutilizar `LocalObra_FromDB_Schema` na resposta.
- Backend — repositório: adicionar busca/atualização de `LocalObra` filtrada
  por `id` e `empreendimento_id`, usando `flush`/`refresh` e conversão para o
  schema de saída. O repositório não deve validar acesso, status do
  empreendimento ou tipo permitido.
- Backend — service: validar empreendimento existente, acesso do usuário,
  estado não inativo, local existente e vínculo do local com o empreendimento
  da rota. Delegar ao repositório somente após essas verificações e impedir
  alteração de `tipo`, `parent_id` ou `empreendimento_id`.
- Backend — rotas: adicionar `PATCH /{id}/locais/{local_id}` protegido por
  `get_usuario_autenticado`, com `AsyncSession` via `get_db` e delegação direta
  ao service. Manter `GET /{id}/locais` e as três operações de criação sem
  quebra de contrato.
- Frontend — página: evoluir `EstruturaEmpreendimento` para uma composição
  `StructureManagementPage` (ou equivalente), com cabeçalho, árvore,
  detalhes e formulário. O formulário deve escolher a operação de criação
  conforme o nó selecionado: torre/bloco na raiz, pavimento sob torre/bloco e
  unidade sob pavimento; unidade não deve oferecer criação de filho.
- Frontend — Data Router: carregar empreendimento e locais usando loaders
  existentes, adicionar `action` ou `useFetcher` para criação/edição e usar
  `useNavigation`/estado do fetcher para loading, sucesso e erro. Após cada
  mutação, revalidar a lista sem perder seleção e nós expandidos quando os IDs
  ainda existirem.
- Frontend — detalhes/formulário: mostrar ID, nome, tipo, empreendimento e
  caminho da seleção; permitir edição apenas dos campos aceitos pelo backend;
  mostrar validações e erros HTTP em português; desabilitar controles durante
  submissão e adaptar o layout para desktop e mobile.
- Frontend — contratos de serviço: adicionar funções tipadas para as três
  criações já existentes e para o novo `PATCH`, todas aceitando `AbortSignal`
  quando aplicável e codificando IDs na URL. Não duplicar regras de hierarquia
  no componente; usar o tipo do nó para selecionar a ação e deixar a validação
  definitiva no backend.

### Testes e validação

- Backend: testar schema de edição com campos extras, nome vazio, ordem
  negativa e tentativa de enviar tipo, pai ou empreendimento; testar edição
  válida, local inexistente, local de outro empreendimento, empreendimento
  inativo e usuário sem acesso.
- Backend: preservar testes de criação de torre/bloco, pavimento e unidade,
  listagem filtrada e regras de pai; testar que a nova rota não permite mudar
  a hierarquia nem criar filho de unidade.
- Frontend: testar loader de empreendimento/estrutura, chamadas de criação e
  edição, URL e payload corretos, propagação de erros e uso do `AbortSignal`.
- Componentes: testar seleção, caminho, ações disponíveis por tipo, formulário
  com campos inválidos, loading, erro, sucesso e revalidação sem perder a
  seleção. Testar lista vazia, pai ausente e nó sem filhos.
- Fluxo integrado: confirmar criação de torre/bloco, pavimento e unidade,
  edição do nome/ordem, atualização visual imediata após revalidação, desktop,
  mobile e acessibilidade básica dos controles.
- Executar testes, lint, formatação e compilação do backend e frontend. No
  backend, verificar também `git diff --check` e a existência de migration ou
  atualização de schema caso o projeto passe a exigir isso para a operação de
  edição.

### Dependências, riscos e limites

- A principal dependência é a decisão do contrato de edição: somente nome e
  ordem devem ser editáveis nesta issue; mover local, alterar tipo ou trocar
  pai fica fora do escopo até existir regra específica.
- As constraints atuais incluem unicidade de nome por empreendimento, não por
  pai. Criações/edições que colidirem devem tratar o erro de persistência
  conforme a convenção do projeto, sem relaxar a constraint sem decisão.
- O frontend existente está parcialmente implementado e precisa ser
  reorganizado sem duplicar a árvore da issue 161 nem o painel de seleção da
  issue 162.
- Não alterar autenticação, empresa, status do empreendimento, migrations
  globais ou módulos não relacionados sem necessidade comprovada. O backend
  deve continuar em `esquemas.py`, `repositorio.py`, `servicos.py`, `rotas.py`
  e testes do módulo; a implementação de UI deve ficar no projeto frontend.
- Os critérios de aceite desta issue não devem ser marcados como concluídos
  pelo planejador.

## Conclusão da execução

Implementação realizada.

Alterações principais:

- criado `LocalObra_UpdateRequest_Schema`, aceitando somente `nome` e `ordem`;
- adicionada a rota `PATCH /empreendimentos/{id}/locais/{local_id}`;
- adicionadas persistência e regras de autorização para edição de locais;
- criada integração frontend para criar torre, bloco, pavimento e unidade;
- adicionada edição de nome e ordem;
- adicionados estados de salvamento, erros, seleção, detalhes e layout
  responsivo.

Arquivos alterados:

- `empreendimento/esquemas.py`;
- `empreendimento/repositorio.py`;
- `empreendimento/servicos.py`;
- `empreendimento/rotas.py`;
- `apps/web/src/features/empreendimentos/empreendimentos.service.ts`;
- `apps/web/src/modulos/empreendimentos/componentes/EstruturaEmpreendimento.tsx`;
- `apps/web/src/modulos/empreendimentos/componentes/StructureTree.css`.

Validação:

- `python3 -m compileall -q empreendimento`: passou;
- `git diff --check`: passou;
- build do frontend não concluiu porque as dependências estão ausentes e o
  ambiente não permite escrita em `node_modules/.tmp`; os erros restantes são
  majoritariamente módulos não instalados (`react-router-dom`, shared e
  demais dependências).
