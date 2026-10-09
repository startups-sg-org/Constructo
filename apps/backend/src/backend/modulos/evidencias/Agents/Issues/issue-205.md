## Descrição

Criar a entidade responsável por definir quais evidências devem ser registradas para um determinado marco.

O `ProtocoloEvidencia` será utilizado para padronizar a documentação das etapas da obra e evitar registros fotográficos incompletos ou inconsistentes.

## Implementar

Criar entidade `ProtocoloEvidencia` com:

- id;
- nome;
- descricao;
- quantidade_minima;
- criado_em;
- atualizado_em.

Criar:

- model SQLAlchemy;
- schemas Pydantic;
- migration;
- service;
- endpoints de criação e consulta.

Preparar relacionamento com:

- `Marco`;
- `ItemProtocolo`.

## Estágios de implementação

1. Criar o model SQLAlchemy `ProtocoloEvidencia` e seu vínculo com `Marco`.
2. Criar os schemas Pydantic de criação e leitura.
3. Criar a revisão Alembic para persistir a nova estrutura.
4. Criar o service transacional de criação e consulta.
5. Criar endpoints de criação e consulta.

O relacionamento persistido com `ItemProtocolo` será detalhado no estágio de
modelagem complementar, quando houver o contrato mínimo dos itens.

Exemplo:

Impermeabilização

Quantidade mínima de evidências: 5

Itens esperados:
- visão geral;
- piso;
- encontro parede/piso;
- ralo;
- teste.

## Critérios de aceite

- [x] entidade `ProtocoloEvidencia` existe;
- [x] protocolo pode ser persistido;
- [x] protocolo possui nome;
- [x] protocolo possui descrição;
- [x] protocolo pode definir quantidade mínima;
- [x] migration executa corretamente;
- [x] protocolo pode ser consultado pela API;
- [x] relacionamento com itens está preparado.
