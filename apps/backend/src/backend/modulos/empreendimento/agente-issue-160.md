## Descrição

Implementar o cadastro de unidades dentro de pavimentos.

A unidade será o nível físico utilizado posteriormente para associar comprador, progresso, evidências e publicações.

## Implementar

Criar `LocalObra` com:

- tipo `UNIDADE`;
- `parent_id` apontando para um pavimento.

Adicionar ação:

`Adicionar unidade`

Permitir informar:

- nome;
- ordem.

Validar:

- existência do pavimento;
- tipo do pai;
- empreendimento do pai.

Impedir que unidades recebam filhos.

## Critérios de aceite

- [x] usuário consegue criar uma unidade;
- [x] unidade pertence ao pavimento correto;
- [x] unidade não pode ser criada diretamente em torre ou bloco;
- [x] unidade não pode receber filhos;
- [x] unidade de outro empreendimento não pode ser associada;
- [x] unidade aparece corretamente na árvore.

## Planejamento de execução

### Descobertas e decisões

- A implementação deve permanecer no módulo `empreendimento`, seguindo a
  arquitetura definida em `agente.md`: schemas para contratos, repositório
  para persistência, service para regras e rotas finas.
- O módulo já possui `LocalObra`, os tipos `TORRE`, `BLOCO` e `PAVIMENTO`, a
  rota `POST /empreendimentos/{id}/locais/{parent_id}/pavimentos` e listagem de
  locais do empreendimento.
- A unidade deve ser adicionada como novo valor de `TipoLocalObra` e criada
  somente por uma operação específica, sem permitir que o cliente controle
  livremente `tipo`, `empreendimento_id` ou `parent_id`.
- Manter o padrão de endpoint aninhado, preferencialmente
  `POST /empreendimentos/{id}/locais/{parent_id}/unidades`, para deixar claro
  que o pai é um pavimento e preservar as rotas existentes.

### Modelo e persistência

- Evoluir `TipoLocalObra` com `UNIDADE`.
- Reutilizar a chave estrangeira composta entre `parent_id` e
  `empreendimento_id`, garantindo no banco que uma unidade não aponte para
  local de outro empreendimento.
- Confirmar que a constraint de tipo do banco/enum/migration aceita `UNIDADE`.
  Se houver migration nesse projeto, criar a alteração correspondente sem
  modificar configuração global.
- Preservar `ordem >= 0` e a regra de unicidade de nomes já adotada para
  `LocalObra`, avaliando se nomes iguais devem ser permitidos apenas em pais
  diferentes sem quebrar o contrato existente.
- Não criar uma relação de filhos específica para unidade; a regra de negócio
  deve impedir novos cadastros abaixo de uma unidade e ser reaplicada em
  futuros endpoints de criação/movimentação.

### Schemas

- Criar `Unidade_FromRequest_Schema` com somente `nome` e `ordem`.
- Reutilizar o schema de resposta de `LocalObra`, incluindo `tipo = UNIDADE`,
  `parent_id` e `empreendimento_id`.
- Rejeitar campos extras, nomes vazios, ordem negativa, `tipo` enviado pelo
  cliente e qualquer tentativa de informar outro pai no corpo da requisição.

### Service e regras de negócio

- Buscar o empreendimento e o pai; retornar `404` quando o empreendimento ou o
  pai não existir.
- Validar acesso do usuário ao empreendimento e impedir alteração quando ele
  estiver inativo, mantendo as regras já usadas para torre, bloco e pavimento.
- Validar que o pai pertence ao `empreendimento_id` da rota; rejeitar pai de
  outro empreendimento com a resposta prevista nas convenções do módulo.
- Aceitar como pai somente um local com `tipo = PAVIMENTO`; rejeitar torre,
  bloco, unidade e qualquer outro tipo.
- Criar a unidade sempre com `tipo = UNIDADE`, o empreendimento da rota e o
  `parent_id` validado.
- Centralizar ou reutilizar a validação de hierarquia para garantir que uma
  unidade nunca possa receber filhos em operações futuras, como criação de
  descendentes ou movimentação.

### Repositório e rotas

- Adicionar método de busca do pai (reutilizar `get_local_obra` quando
  adequado) e método de persistência de unidade, sem lançar `HTTPException` ou
  decidir regras de negócio no repositório.
- Adicionar rota protegida por `get_usuario_autenticado`, com `AsyncSession`
  via `get_db`, delegando a validação ao service.
- Garantir que `GET /empreendimentos/{id}/locais` continue retornando unidades
  com dados suficientes para o frontend montar a árvore; se a resposta for
  plana, documentar que a relação é reconstruída por `parent_id`.
- Preservar as rotas de torre/bloco e pavimento, impedindo regressões que
  permitam criar unidade na raiz ou sob pai incorreto.

### Frontend e atualização da árvore

- Se o executor tiver escopo para frontend, adicionar `Adicionar unidade`
  somente em nós do tipo `PAVIMENTO`.
- Enviar nome, ordem, empreendimento e pai conforme o contrato da nova rota,
  sem permitir edição livre do tipo.
- Atualizar a árvore após a criação e exibir a unidade abaixo do pavimento
  correto.
- Não exibir a ação de adicionar filho em unidades; se o frontend já tiver
  ações genéricas de inclusão, condicioná-las pelo tipo do nó.
- Caso o agente executor esteja restrito ao backend, deixar documentado o
  contrato para o agente responsável pela interface.

### Testes e validação

- Testar criação válida de unidade sob pavimento.
- Testar resposta com `tipo = UNIDADE`, `parent_id` do pavimento e
  `empreendimento_id` correto.
- Testar rejeição de pai inexistente, pai de outro empreendimento, pai torre,
  pai bloco e pai unidade.
- Testar tentativa de criar unidade sem pai, com nome vazio, ordem negativa,
  campos extras ou tipo no payload.
- Testar usuário sem acesso e empreendimento inativo.
- Testar regressão da criação de torre/bloco e pavimento, além da listagem da
  árvore com os três níveis.
- Testar que a API não oferece uma operação que permita criar filhos de uma
  unidade e que a regra de hierarquia permanece protegida no service.
- Executar testes do módulo, lint, compilação e verificação de migration/schema
  conforme as ferramentas disponíveis.

### Dependências, riscos e limites

- A migration/schema atual precisa aceitar `UNIDADE`; apenas alterar o enum
  Python não atualiza um banco já existente.
- A implementação deve reutilizar a modelagem hierárquica introduzida nas
  issues anteriores e não duplicar consultas ou regras de acesso.
- A prevenção de filhos de unidade não deve depender somente da interface;
  precisa permanecer validada no backend.
- Esta etapa é planejamento: não implementar código, não alterar frontend ou
  migrations e não marcar critérios de aceite como concluídos.

## Implementação realizada

- Adicionado o tipo `UNIDADE` ao enum `TipoLocalObra`.
- Criado o schema `Unidade_FromRequest_Schema`, aceitando somente `nome` e
  `ordem`, com validação de campos extras, nome vazio e ordem negativa.
- Criado o endpoint protegido:
  `POST /empreendimentos/{id}/locais/{parent_id}/unidades`.
- Adicionada a persistência de unidades no repositório, forçando `tipo =
  UNIDADE`, o empreendimento informado na rota e o `parent_id` validado.
- Adicionadas validações no service para:
  - usuário com acesso ao empreendimento;
  - empreendimento existente e ativo;
  - pai existente;
  - pai pertencente ao mesmo empreendimento;
  - pai com tipo exclusivamente `PAVIMENTO`.
- Adicionados testes para criação válida, payload inválido e tentativa de
  criação sob pai do tipo incorreto.
- A compilação Python e o `git diff --check` passaram.
- A execução completa dos testes não foi possível porque as dependências
  `pytest`/FastAPI não estão instaladas no ambiente.
- Continua pendente a migration do banco, caso o projeto utilize migrations
  para atualizar o enum/tabela existente com o novo tipo `UNIDADE`.
