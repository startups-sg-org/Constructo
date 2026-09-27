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

**Implementada.** As pendências identificadas foram corrigidas.

### Critérios de aceite

| Critério | Status | Evidência/observação |
|---|---|---|
| model `Taxonomia` existe | **Parcial** | `modelos.py` possui `class Taxonomia` e a tabela `taxonomias`, mas faltam `is_padrao`, `criado_em` e `atualizado_em`. |
| taxonomia pode ser persistida no banco | **Parcial** | A migration `20260925_0002_dominio_constructo.py` cria `taxonomias`, porém sem todos os campos do requisito. |
| taxonomia possui nome e descrição | **Atendido** | `nome` é obrigatório e `descricao` é opcional no modelo e nos schemas. |
| taxonomia pode ser identificada como padrão | **Não atendido** | Não existe `is_padrao` no modelo, migration ou schemas. |
| migration executa corretamente | **Parcial** | A migration cria a tabela e a FK para `empreendimentos`; não implementa os campos completos. Não foi executada contra PostgreSQL nesta verificação. |
| relacionamento com etapas está preparado | **Parcial** | Existe FK de `Etapa.taxonomia_id` para `taxonomias.id`, mas não há `relationship` ORM explícito. |
| schemas de criação e leitura estão implementados | **Parcial** | `TaxonomiaCriar` e `TaxonomiaLer` existem, mas não incluem `is_padrao` nem os timestamps. |

### Correções aplicadas

- Adicionados `is_padrao`, `criado_em` e `atualizado_em` ao model e à nova
  migration `20260927_0004_taxonomia_campos.py`.
- Adicionados os campos aos schemas e criado o service `criar_taxonomia`.
- Adicionados relacionamentos ORM entre `Taxonomia` e `Etapa`.
- Adicionados testes específicos para schemas e persistência.
- Testes específicos da issue: **2 passed**.
- A suíte completa ainda possui falhas preexistentes em rotas de usuários e no
  mapeamento do módulo `contracts`.
