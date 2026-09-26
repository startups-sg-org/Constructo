## Descrição

Implementar o cadastro de pavimentos dentro de torres ou blocos.

## Implementar

Criar `LocalObra` com:

- tipo `PAVIMENTO`;
- `parent_id` apontando para uma torre ou bloco.

Adicionar ação:

`Adicionar pavimento`

Permitir informar:

- nome;
- ordem.

Validar:

- existência do pai;
- tipo do pai;
- empreendimento do pai.

Atualizar a estrutura visual após criação.

## Critérios de aceite

- [x] usuário consegue criar um pavimento;
- [x] pavimento fica associado à torre ou bloco correto;
- [x] pavimento não pode existir diretamente na raiz;
- [x] pavimento não pode ser filho de outro pavimento;
- [x] pai de outro empreendimento não é aceito;
- [x] pavimento aparece corretamente na árvore.

## Planejamento de execução

### Descobertas e decisões

- A implementação deve permanecer no módulo `empreendimento`, respeitando a
  separação entre schemas, repositório, service e rotas descrita em
  `agente.md`.
- O `LocalObra` existente foi criado para o primeiro nível e hoje aceita
  apenas `TORRE`/`BLOCO` com `parent_id = NULL`. A issue exige evoluir essa
  modelagem para aceitar também `PAVIMENTO`, sem permitir uma hierarquia
  arbitrária.
- O contrato deve usar o empreendimento no caminho e o pai no payload, por
  exemplo `POST /empreendimentos/{empreendimento_id}/locais/{parent_id}/filhos`
  ou o endpoint de locais já existente, desde que o contrato atual seja
  preservado e a intenção de criar um pavimento fique explícita.
- O payload deve conter somente `nome` e `ordem`; `tipo` e `parent_id` devem
  ser definidos pelo caso de uso/rota para impedir que o cliente crie outro
  tipo de local por esse endpoint.

### Modelo e persistência

- Evoluir `TipoLocalObra` para incluir `PAVIMENTO`.
- Remover a restrição de banco que exige `parent_id IS NULL` e substituí-la por
  restrições compatíveis com a árvore: `parent_id` pode ser nulo para os
  locais de primeiro nível, mas o service deve exigir pai para pavimentos.
- Manter `empreendimento_id` obrigatório e garantir que o vínculo composto do
  pai impeça referências a um local de outro empreendimento.
- Avaliar a constraint de unicidade do nome para que a regra continue sendo
  por empreendimento e nível/pai, permitindo o mesmo nome em pais diferentes
  apenas se o contrato atual autorizar.
- Criar a migration necessária somente se esse for o fluxo já adotado pelo
  projeto; não alterar configuração global.

### Schemas

- Criar um schema de request específico para pavimento com `nome` não vazio,
  limite de tamanho e `ordem` inteira maior ou igual a zero.
- Criar ou reutilizar schema de resposta contendo `id`,
  `empreendimento_id`, `parent_id`, `nome`, `tipo` e `ordem`.
- Rejeitar campos extras e não aceitar `tipo`, `empreendimento_id` ou
  `parent_id` no payload quando esses valores forem definidos pela rota.

### Service e regras de negócio

- Buscar o empreendimento e o pai; retornar `404` quando qualquer recurso
  obrigatório não existir.
- Validar o acesso do usuário ao empreendimento antes da criação, usando o
  mecanismo já adotado pelo módulo.
- Validar que o pai pertence ao empreendimento informado; retornar erro de
  conflito ou solicitação inválida conforme a convenção vigente.
- Aceitar como pai somente `TORRE` ou `BLOCO`; rejeitar `PAVIMENTO` e qualquer
  outro tipo.
- Criar o registro com `tipo = PAVIMENTO`, o `empreendimento_id` do caminho e
  o `parent_id` validado, sem confiar nesses valores no payload.
- Impedir criação em empreendimento inativo, mantendo a regra aplicada aos
  locais de primeiro nível.

### Repositório e rotas

- Adicionar métodos de busca do empreendimento e do local pai, além do método
  de criação, mantendo o repositório sem `HTTPException` ou regras de negócio.
- Expor uma rota protegida por `get_usuario_autenticado`, com `AsyncSession`
  via `get_db`, que apenas delegue ao service.
- Atualizar a listagem da estrutura para retornar pavimentos aninhados ou dados
  suficientes para o frontend montar a árvore, sempre filtrando pelo
  empreendimento solicitado.
- Preservar o endpoint de criação de torre/bloco e garantir que a evolução
  não permita enviar `PAVIMENTO` por ele.

### Frontend e atualização da árvore

- Se o agente executor tiver escopo para frontend, adicionar a ação
  `Adicionar pavimento` somente em nós `TORRE` e `BLOCO`.
- Enviar `nome` e `ordem` junto do identificador do empreendimento e do pai
  conforme o contrato definido no backend.
- Atualizar a árvore após sucesso sem perder os locais já carregados e exibir
  erros de pai inválido, acesso negado e empreendimento inexistente.
- Se o agente do módulo não puder alterar frontend, registrar o contrato e os
  pontos de integração para o agente responsável pela interface.

### Testes e validação

- Testar criação válida de pavimento sob torre e sob bloco.
- Testar que o resultado contém `tipo = PAVIMENTO`, o empreendimento correto e
  o `parent_id` informado.
- Testar rejeição de criação sem pai, com pai inexistente, com pai de outro
  empreendimento e com pai que já seja um pavimento.
- Testar nome vazio, ordem negativa, tipo/campos extras e empreendimento
  inativo.
- Testar acesso negado e garantir que a listagem não atravesse o limite do
  empreendimento solicitado.
- Testar regressão da criação de torre/bloco e a montagem/listagem da árvore
  com os dois níveis.
- Executar testes do módulo, lint, compilação e migration/verificação de
  schema conforme as ferramentas disponíveis no projeto.

### Dependências, riscos e limites

- A principal dependência é a evolução da constraint atual de `parent_id`; não
  basta adicionar o enum `PAVIMENTO`.
- A definição final do endpoint deve seguir o contrato já consumido pelo
  frontend e evitar quebra da rota existente de locais.
- Não implementar a issue nesta etapa, não marcar os critérios de aceite e não
  modificar outros módulos sem autorização explícita.
