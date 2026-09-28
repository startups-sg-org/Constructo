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