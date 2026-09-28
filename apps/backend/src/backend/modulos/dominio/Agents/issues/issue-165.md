## Descrição

Criar o modelo responsável por representar uma taxonomia construtiva no Constructo.

A taxonomia definirá a estrutura de etapas, subetapas e marcos utilizada para organizar a evolução da obra.

## Implementar

Criar entidade `Taxonomia` com:

- id;
- nome;
- descricao;
- is_padrao;
- criado_em;
- atualizado_em.

Criar:

- model SQLAlchemy;
- schemas Pydantic;
- migration;
- service inicial;
- relacionamentos necessários.

Preparar o modelo para possuir:

- etapas;
- subetapas;
- marcos.

Exemplo conceitual:

Taxonomia
├── Estrutura
├── Vedações
├── Instalações
└── Acabamentos

## Critérios de aceite

- [x] model `Taxonomia` existe;
- [x] taxonomia pode ser persistida no banco;
- [x] taxonomia possui nome e descrição;
- [x] taxonomia pode ser identificada como padrão;
- [x] migration executa corretamente;
- [x] relacionamento com etapas está preparado;
- [x] schemas de criação e leitura estão implementados.

## Verificação do agente verificador

### Resultado geral

**Atendida.** A issue-165 reproduz o escopo da issue-164 e está implementada
no estado atual do módulo.

### Critérios de aceiteV

| Critério | Status | Evidência |
|---|---|---|
| model `Taxonomia` existe | **Atendido** | `modelos.py` contém `Taxonomia` com id, nome, descrição, padrão e timestamps. |
| taxonomia pode ser persistida no banco | **Atendido** | A tabela é criada pela migration `20260925_0002` e os campos complementares pela `20260927_0004`. |
| taxonomia possui nome e descrição | **Atendido** | `nome` e `descricao` existem no model e nos schemas. |
| taxonomia pode ser identificada como padrão | **Atendido** | Campo `is_padrao` existe no model, migration e schemas. |
| migration executa corretamente | **Atendido na validação disponível** | A cadeia de migrations está definida e os testes de persistência SQLite passaram; não foi executada uma migration contra PostgreSQL nesta verificação. |
| relacionamento com etapas está preparado | **Atendido** | Há FK `Etapa.taxonomia_id` e relacionamentos ORM `Taxonomia.etapas`/`Etapa.taxonomia`. |
| schemas de criação e leitura estão implementados | **Atendido** | `TaxonomiaCriar` e `TaxonomiaLer` incluem os campos de domínio e auditoria. |

### Validação

- Testes específicos da issue: **2 passed**.
- O service `criar_taxonomia` valida o empreendimento e persiste a entidade.

### Observação

Esta issue possui o mesmo conteúdo da issue-164. As correções já aplicadas à
issue-164 também atendem este escopo.
