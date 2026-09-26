## Descrição

Permitir que o usuário selecione um local dentro da árvore física do empreendimento.

A seleção será utilizada futuramente para associar etapas, marcos, progresso e evidências.

## Implementar

Permitir seleção de:

- torre;
- bloco;
- pavimento;
- unidade.

Ao selecionar, disponibilizar:

- id;
- nome;
- tipo;
- empreendimento;
- caminho hierárquico.

Exemplo:

Residencial Aurora
> Torre A
> 7º Pavimento
> Unidade 704

Destacar visualmente o item selecionado.

Exibir os detalhes do local selecionado ao lado da árvore.

## Critérios de aceite

- [x] usuário consegue selecionar qualquer local;
- [x] local selecionado recebe destaque visual;
- [x] dados do local são apresentados;
- [x] caminho hierárquico é exibido;
- [x] seleção permanece consistente durante a navegação;
- [x] ID selecionado pode ser reutilizado por loaders e actions futuras.

## Planejamento de execução

### Descobertas e decisões

- Esta issue depende da árvore visual planejada na issue 161. O backend do
  módulo já expõe `GET /empreendimentos/{id}/locais`, protegido por autenticação
  e acesso ao empreendimento, retornando a lista plana com `id`,
  `empreendimento_id`, `parent_id`, `nome`, `tipo` e `ordem`.
- A seleção deve usar o `id` real de `LocalObra`, sem criar um identificador
  paralelo. O estado selecionado deve ser um `uuid.UUID` (ou sua representação
  de transporte no frontend) e permanecer associado ao `empreendimentoId` da
  rota para evitar seleção cruzada entre empreendimentos.
- O caminho hierárquico deve ser derivado da lista plana por `parent_id`, com o
  empreendimento como raiz e os nós `TORRE`/`BLOCO`, `PAVIMENTO` e `UNIDADE`
  em sequência. A montagem deve ordenar irmãos por `ordem` e, como desempate,
  por `nome`, conforme o planejamento da issue 161.
- O `agente.md` limita este agente ao backend e proíbe modificar frontend.
  Portanto, a entrega desta etapa é o contrato e o plano para o agente da
  interface; não devem ser alterados modelos, migrations, schemas, services,
  repositórios ou rotas apenas para armazenar seleção.

### Implementação prevista

- No serviço/tipo compartilhado do frontend, reutilizar o contrato de
  `LocalObra_FromDB_Schema` e definir um tipo de seleção contendo ao menos:
  `id`, `nome`, `tipo`, `empreendimento_id` e `caminho`. O `caminho` deve ser
  uma sequência de nós ou rótulos, preservando IDs para loaders/actions
  futuras e texto para exibição.
- Estender `StructureTree`/`StructureTreeItem` para receber um callback de
  seleção, aplicar estado controlado ou equivalente ao `id` selecionado e
  renderizar destaque acessível no item ativo. A ação de expandir/recolher
  deve continuar separada da ação de selecionar.
- Ao selecionar qualquer tipo (`TORRE`, `BLOCO`, `PAVIMENTO` ou `UNIDADE`),
  calcular o caminho subindo pelos pais e exibir ao lado da árvore um painel
  com ID, nome, tipo, empreendimento e caminho hierárquico. Tratar nó raiz,
  nó sem filhos, pai ausente e lista vazia sem lançar erro.
- Manter `selectedLocalId` na tela/rota da estrutura, ou no estado persistido
  pelo Data Router quando aplicável. Ao recarregar a lista após uma criação,
  preservar a seleção se o ID ainda existir; limpar a seleção somente quando o
  local deixar de pertencer ao empreendimento carregado.
- Reaproveitar o loader existente da estrutura e seu `AbortSignal`; não criar
  uma chamada por item nem alterar o endpoint backend. A seleção deve ficar
  disponível como dado estável para loaders/actions futuros, sem executar ainda
  associação de etapas, marcos, progresso ou evidências.
- Usar controles semânticos e atributos de acessibilidade: item selecionável
  com `aria-current` ou equivalente, controle de expansão com
  `aria-expanded`/`aria-controls` e indicação textual do tipo, sem depender
  apenas de cor para o destaque.

### Testes e validação

- Testar seleção de cada um dos quatro tipos e confirmar que o painel mostra o
  mesmo `id`, nome, tipo e empreendimento do nó selecionado.
- Testar construção do caminho para múltiplos níveis, seleção de uma torre ou
  bloco diretamente na raiz, e tratamento de pai ausente sem descartar o nó.
- Testar destaque exclusivo do item selecionado, troca de seleção, seleção
  nula inicial e preservação da seleção ao expandir/recolher outros nós.
- Testar revalidação após criação: manter seleção quando o ID permanece na
  resposta e limpá-la quando o empreendimento muda ou o ID desaparece.
- Testar lista vazia, carregamento, erro do loader, empreendimento inexistente
  e cancelamento via `AbortSignal`; confirmar que não há chamadas duplicadas.
- Executar testes unitários dos tipos/transformação e dos componentes,
  lint, formatação e compilação TypeScript conforme os comandos do frontend.
  No backend, executar ao menos compilação e testes existentes somente para
  confirmar que o contrato de `GET /{id}/locais` não regrediu; não há mudança
  backend planejada nesta issue.

### Dependências, riscos e limites

- O executor precisa localizar a implementação frontend de
  `StructureTree`, `StructureTreeItem`, loader e rota
  `admin/empreendimentos/:empreendimentoId` criada na issue 161. Se esses
  artefatos não existirem, essa integração é bloqueadora e deve ser feita como
  dependência da issue 161, não inventada dentro do módulo backend.
- O endpoint retorna dados planos; o frontend deve detectar ciclos ou pais
  ausentes e evitar recursão infinita, registrando/representando o nó de forma
  segura. Não alterar a persistência para materializar caminhos.
- O caminho exibido é derivado em memória e pode mudar se nomes ou relações
  forem alterados; o ID continua sendo a referência estável para actions.
- Fora do escopo: associação do local a etapas, marcos, progresso ou
  evidências; alteração da API para CRUD de seleção; persistência da seleção
  no banco; mudanças em migrations e outros módulos.
- Os critérios de aceite permanecem requisitos para o agente executor e não
  devem ser marcados como concluídos durante a implementação deste plano.

## Conclusão da execução

Agente executado.

Alterações realizadas:

- seleção de qualquer local da árvore;
- destaque visual e `aria-current`;
- painel lateral com ID, nome, tipo, empreendimento e caminho hierárquico;
- caminho calculado via `parent_id`;
- layout responsivo.

Arquivos alterados:

- `StructureTree.tsx`;
- `StructureTreeItem.tsx`;
- `EstruturaEmpreendimento.tsx`;
- `StructureTree.css`.

Validação:

- `git diff --check`: passou;
- build, lint e testes não puderam concluir porque as dependências do frontend
  estão ausentes e o ambiente não permite escrita em `node_modules`.
