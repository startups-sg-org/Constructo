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

## Relatório de verificação

### Itens atendidos

- A entidade `ProtocoloEvidencia` está em `modulos.py`, com `id`, `nome`,
  `descricao`, `quantidade_minima`, `criado_em` e `atualizado_em`.
- A persistência está implementada pela migration `20261009_0011`, que cria
  `protocolos_evidencia`, sua FK para `marcos`, índice e a restrição de
  `quantidade_minima >= 1`.
- Os schemas de criação e leitura existem em `schemas.py`; o schema de criação
  exige nome e quantidade mínima maior ou igual a 1.
- Há service e repositório para criar e listar protocolos, com validação de
  existência do marco.
- A API expõe `POST` e `GET` em
  `/empreendimentos/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia`.
  As rotas estão registradas em `backend.main` e exigem administrador ou gestor.
- O vínculo persistido com `Marco` existe por `marco_id` e pela relação ORM
  `ProtocoloEvidencia.marco`.

### Itens parcialmente atendidos

- A migration está coerente com o model por inspeção estática, mas sua execução
  contra um banco não foi verificada nesta avaliação.

### Itens não implementados ou divergentes

- Não existe entidade, tabela ou relacionamento `ItemProtocolo` no módulo.
  Portanto, o relacionamento com itens não está preparado no código, embora a
  própria issue indique que sua persistência ficará para uma modelagem futura.
- O teste de contrato HTTP está em `tests/test_pi_evidencias.py`; ainda falta
  cobertura de integração da persistência real e de cenários de erro.

### Conclusão

A issue está substancialmente implementada para `ProtocoloEvidencia` e seu
vínculo com `Marco`. Para considerá-la integralmente concluída, falta definir
o contrato mínimo de `ItemProtocolo`, preparar seu relacionamento e adicionar
testes focados; a migration também deve ser aplicada em um banco de validação.
