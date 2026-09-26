## Descrição

Implementar o cadastro do primeiro nível da estrutura física de um empreendimento.

## Implementar

Criar `LocalObra` com tipo:

- `TORRE`; ou
- `BLOCO`.

Adicionar ação no frontend:

`Adicionar torre/bloco`

Permitir informar:

- nome;
- tipo;
- ordem.

Garantir:

- vínculo com o empreendimento;
- `parent_id` nulo;
- validação de acesso do usuário.

Criar integração com o endpoint de locais do empreendimento.

## Critérios de aceite

- [x] usuário consegue criar uma torre;
- [x] usuário consegue criar um bloco;
- [x] torre/bloco pertence ao empreendimento correto;
- [x] torre/bloco não possui pai;
- [x] tipo inválido não é aceito;
- [x] novo local aparece na estrutura física após criação.

## Planejamento de execução

### 1. Levantamento e contrato

- Inspecionar os módulos existentes de locais/estrutura física, autenticação e
  banco para reutilizar nomes, dependências e padrões já adotados.
- Confirmar o contrato do endpoint de locais do empreendimento e o formato
  esperado pelo frontend para a ação `Adicionar torre/bloco`.
- Definir o enum `TipoLocalObra` com os valores `TORRE` e `BLOCO`.
- Definir a rota de criação como uma operação aninhada ao empreendimento,
  preferencialmente `POST /empreendimentos/{empreendimento_id}/locais`, com
  resposta representando o local criado.

### 2. Modelo e persistência

- Criar ou adaptar o modelo `LocalObra` com `id`, `empreendimento_id`, `nome`,
  `tipo`, `ordem` e `parent_id`.
- Configurar a chave estrangeira para `empreendimentos`, a relação com o
  empreendimento e a autorrelação de `parent_id` quando ela já fizer parte do
  modelo geral da estrutura física.
- Garantir no banco que `empreendimento_id` seja obrigatório e que o cadastro
  de primeiro nível persista `parent_id = NULL`.
- Se a estrutura de banco exigir migration, registrar a necessidade sem
  alterar migrations/configuração global sem confirmação do fluxo do projeto.

### 3. Schemas e regras de negócio

- Criar schema de request com `nome`, `tipo` e `ordem`, rejeitando campos
  extras, nomes vazios e tipos fora do enum.
- Criar schema de saída com os identificadores, vínculo, tipo, ordem e
  `parent_id`, usando `from_attributes=True`.
- No service, verificar se o empreendimento existe e se o usuário autenticado
  possui acesso a ele, seguindo o mecanismo de autorização já usado no
  projeto.
- Impedir a criação quando o empreendimento não existir, estiver inacessível
  ou estiver em estado que não permita alteração, usando os status HTTP e as
  mensagens em português adotados pelo módulo.
- Forçar `parent_id` nulo no service/repositório; esse valor não deve ser
  controlado pelo payload de criação.
- Definir a regra de `ordem` (tipo, valor mínimo e comportamento quando houver
  conflito) conforme o contrato já existente; não inventar uma regra de
  ordenação incompatível com a estrutura física.

### 4. Repositório e rotas

- Implementar no repositório a busca do empreendimento, a criação do local e
  a consulta/listagem dos locais necessários para atualizar a estrutura física.
- Manter o repositório restrito a consultas, persistência, `flush`/`refresh` e
  conversão para schemas; regras e `HTTPException` ficam no service.
- Adicionar a rota protegida por `get_usuario_autenticado`, com `AsyncSession`
  via `get_db`, delegando toda a lógica ao service.
- Garantir que a consulta da estrutura filtre pelo empreendimento solicitado,
  evitando expor locais de outro empreendimento.

### 5. Testes e verificação

- Testar criação válida de torre e de bloco.
- Testar rejeição de tipo inválido, nome vazio, ordem inválida e campos extras.
- Testar empreendimento inexistente, usuário sem acesso e empreendimento não
  editável.
- Testar que o local criado pertence ao empreendimento correto e possui
  `parent_id` nulo.
- Testar listagem/consulta da estrutura após a criação.
- Executar os testes do módulo, lint e compilação/verificação de tipos conforme
  os comandos do projeto.

### Limites e entrega

- A implementação deste agente fica restrita ao backend do módulo de
  empreendimento; não modificar o frontend, migrations globais ou outros
  módulos sem necessidade explícita.
- Ao concluir, relatar arquivos alterados, endpoint disponibilizado, regras de
  autorização aplicadas e verificações executadas.
