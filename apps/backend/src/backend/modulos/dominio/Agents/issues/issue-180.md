## Descrição

Criar a entidade responsável por representar o estado de um marco em um local específico da obra.

Essa entidade fará a ligação entre a estrutura física do empreendimento e a taxonomia construtiva.

## Implementar

Criar entidade `ProgressoMarco` com:

- id;
- local_obra_id;
- marco_id;
- status;
- iniciado_em;
- concluido_em;
- criado_em;
- atualizado_em.

Relacionar:

LocalObra
└── ProgressoMarco

Marco
└── ProgressoMarco

Garantir que:

- um marco possa existir em diferentes locais;
- cada combinação `local_obra_id + marco_id` seja única;
- o status inicial seja `NAO_INICIADO`.

Criar:

- model SQLAlchemy;
- schemas Pydantic;
- migration;
- service inicial.

## Critérios de aceite

- [ ] entidade `ProgressoMarco` existe;
- [ ] progresso pertence a um `LocalObra`;
- [ ] progresso pertence a um `Marco`;
- [ ] combinação local + marco não pode ser duplicada;
- [ ] status inicial é `NAO_INICIADO`;
- [ ] migration executa corretamente;
- [ ] relacionamentos funcionam corretamente.

## Planejamento de execução

### Descobertas e decisões

- O model `ProgressoMarco`, a tabela, constraints e schemas já existem
  parcialmente no domínio atual; o executor deve auditar o estado real antes de
  duplicar estruturas.
- A combinação `local_obra_id + marco_id` deve permanecer única e o status
  inicial deve usar o enum de progresso definido na issue-179.

### Implementação prevista

- Confirmar/ajustar `ProgressoMarco` e seus relacionamentos com `LocalObra` e
  `Marco`.
- Confirmar timestamps timezone-aware, FK com `RESTRICT`/`CASCADE` coerentes e
  constraint de status/datas.
- Completar `ProgressoMarcoCriar`/`ProgressoMarcoLer` e o service de criação,
  validando que o marco e o local pertencem ao mesmo empreendimento.
- Criar ou ajustar migration sem duplicar tabelas existentes.

### Testes e validação

- Criar progresso válido, consultar após commit e testar duplicidade local/marco.
- Testar marco/local inexistentes e pertencimento a empreendimentos diferentes.
- Testar status padrão `NAO_INICIADO`, FKs, timestamps e relacionamentos ORM.

### Dependências, riscos e limites

- É pré-requisito das issues 181–186.
- Não implementar transições, histórico ou cálculo nesta issue.
- Verificar heads do Alembic antes de gerar migration.
