## Descrição

Criar os itens que compõem um protocolo de evidência.

Cada item representa um tipo de registro esperado antes que um marco possa ser considerado devidamente documentado.

## Implementar

Criar entidade `ItemProtocolo` com:

- id;
- protocolo_id;
- nome;
- descricao;
- obrigatorio;
- ordem;
- criado_em;
- atualizado_em.

Relacionar:

ProtocoloEvidencia
└── ItemProtocolo

Exemplo:

Protocolo: Impermeabilização

1. Visão geral
2. Piso
3. Encontro parede/piso
4. Ralo
5. Teste

Permitir:

- criar item;
- editar item;
- remover item;
- definir item como obrigatório;
- ordenar itens.

criar :

Criar:

    model SQLAlchemy;
    schemas Pydantic;
    repositorio;
    migration;
    service;
    endpoints básicos.



## Critérios de aceite

- [ ] item pode ser criado;
- [ ] item pertence a um protocolo;
- [ ] item possui nome;
- [ ] item pode ser marcado como obrigatório;
- [ ] item possui ordenação;
- [ ] itens são retornados na ordem correta;
- [ ] exclusão de item não remove o protocolo;
- [ ] protocolo retorna seus itens corretamente.

## Relatório de verificação

### Itens atendidos

- A entidade `ItemProtocolo` foi criada em `modulos.py` com todos os campos
  especificados: identificador, protocolo, nome, descrição, obrigatório,
  ordem e auditoria de criação e atualização.
- O vínculo com `ProtocoloEvidencia` é bidirecional: `ItemProtocolo.protocolo`
  referencia o protocolo e `ProtocoloEvidencia.itens` mantém a coleção ordenada
  por `ordem`.
- Criação, listagem, atualização e remoção estão implementadas no
  `ItensProtocoloRepo` e são orquestradas pelo service após validar que o
  protocolo pertence ao marco informado.
- A criação e a atualização permitem definir `obrigatorio`; o schema também
  valida `ordem >= 0` e nome não vazio.
- A listagem usa ordenação explícita por `ordem` e, como desempate, por `id`.
- A remoção chama `delete` somente para o item. Não há operação que remova o
  protocolo; a FK usa `ON DELETE RESTRICT`.
- Existem endpoints `POST`, `GET`, `PATCH` e `DELETE` sob o caminho aninhado
  de protocolo e item, protegidos para administrador ou gestor.
- A migration `20261009_0012` cria a tabela, FK, índice e constraint. A
  validação estática reconheceu-a como a única head do Alembic.

### Itens parcialmente atendidos

- A resposta de `GET .../protocolos-evidencia` agora inclui `itens`, usando
  carregamento explícito (`selectinload`) e o schema de protocolo com itens.
- Foram adicionados testes de API para itens em `tests/test_pi_evidencias.py`,
  cobrindo criação, listagem ordenada, edição, exclusão e itens aninhados no
  protocolo. Sintaxe e lint passaram, mas a execução focada com `pytest` fica
  bloqueada no primeiro teste com `TestClient`; portanto, o resultado de
  execução não pôde ser confirmado.

### Conclusão

A estrutura, os endpoints e o retorno aninhado de `ItemProtocolo` estão
implementados. Resta desbloquear e executar os testes de API e aplicar a
migration em um banco de validação para encerrar a issue com evidência de
execução.
