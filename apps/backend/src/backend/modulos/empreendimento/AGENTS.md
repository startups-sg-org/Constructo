Criar LocalObra #156
Closed
Task
Closed
Criar LocalObra
#156
Task
Description
@jcarlos721
jcarlos721
opened 7h ago
Member
Descrição

Criar a entidade responsável por representar os diferentes locais físicos de um empreendimento.

LocalObra permitirá representar torre, bloco, pavimento e unidade utilizando a mesma estrutura.
Implementar

Criar entidade LocalObra com:

    id;
    nome;
    tipo;
    empreendimento_id;
    parent_id;
    ordem;
    criado_em;
    atualizado_em.

Criar enum:

    TORRE;
    BLOCO;
    PAVIMENTO;
    UNIDADE.

Configurar relacionamentos:

Empreendimento
└── LocalObra

LocalObra
└── LocalObra filho

Utilizar parent_id para representar a hierarquia.

Criar:

    model SQLAlchemy;
    schemas Pydantic;
    migration;
    service inicial.

Critérios de aceite

    model LocalObra existe;
    LocalObra pertence a um empreendimento;
    LocalObra pode possuir um pai;
    LocalObra pode possuir filhos;
    tipo utiliza enum;
    migration executa corretamente;
    relacionamentos funcionam no banco.




##############################################


mplementar hierarquia de locais #157
Closed
Task
Closed
Implementar hierarquia de locais
#157
Task
Description
@jcarlos721
jcarlos721
opened 7h ago
Member
Descrição

Implementar as regras de negócio responsáveis pela hierarquia da estrutura física do empreendimento.
Implementar

Permitir a estrutura:

Empreendimento
├── Torre
│ └── Pavimento
│ └── Unidade
└── Bloco
└── Pavimento
└── Unidade

Aplicar regras:

    torre não possui pai;
    bloco não possui pai;
    pavimento deve possuir torre ou bloco como pai;
    unidade deve possuir pavimento como pai;
    unidade não pode possuir filhos;
    pai e filho devem pertencer ao mesmo empreendimento;
    impedir ciclos;
    impedir combinações inválidas de tipos.

Exemplos inválidos:

Unidade
└── Torre

Pavimento
└── Pavimento

Torre
└── Unidade

Centralizar as validações na camada de service.
Critérios de aceite

    estruturas válidas podem ser criadas;
    estruturas inválidas são bloqueadas;
    pai e filho precisam pertencer ao mesmo empreendimento;
    ciclos não podem ser criados;
    unidade não aceita filhos;
    mensagens de erro são compreensíveis;
    regras não ficam duplicadas nas rotas.

%
@#############################################################
mplementar hierarquia de locais #157
Closed
Task
Closed
Implementar hierarquia de locais
#157
Task
Description
@jcarlos721
jcarlos721
opened 7h ago
Member
Descrição

Implementar as regras de negócio responsáveis pela hierarquia da estrutura física do empreendimento.
Implementar

Permitir a estrutura:

Empreendimento
├── Torre
│ └── Pavimento
│ └── Unidade
└── Bloco
└── Pavimento
└── Unidade

Aplicar regras:

    torre não possui pai;
    bloco não possui pai;
    pavimento deve possuir torre ou bloco como pai;
    unidade deve possuir pavimento como pai;
    unidade não pode possuir filhos;
    pai e filho devem pertencer ao mesmo empreendimento;
    impedir ciclos;
    impedir combinações inválidas de tipos.

Exemplos inválidos:

Unidade
└── Torre

Pavimento
└── Pavimento

Torre
└── Unidade

Centralizar as validações na camada de service.
Critérios de aceite

    estruturas válidas podem ser criadas;
    estruturas inválidas são bloqueadas;
    pai e filho precisam pertencer ao mesmo empreendimento;
    ciclos não podem ser criados;
    unidade não aceita filhos;
    mensagens de erro são compreensíveis;
    regras não ficam duplicadas nas rotas.