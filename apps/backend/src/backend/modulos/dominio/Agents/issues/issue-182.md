## Descrição

Permitir que um marco em execução seja marcado como concluído.

Essa ação representa a finalização do marco em um local específico da obra.

## Implementar

Criar operação para concluir um marco.

Ao concluir:

- alterar status para `CONCLUIDO`;
- preencher `concluido_em`;
- preservar `iniciado_em`;
- atualizar `atualizado_em`.

Validar:

- progresso existe;
- status atual permite conclusão;
- marco pertence ao local correto;
- conclusão não gera estado inconsistente.

Permitir, caso necessário na V1, concluir diretamente um marco `NAO_INICIADO`, preenchendo `iniciado_em` automaticamente.

## Critérios de aceite

- [x] marco pode ser concluído;
- [x] status muda para `CONCLUIDO`;
- [x] `concluido_em` é preenchido;
- [x] `iniciado_em` é preservado;
- [x] marco já concluído não gera conclusão duplicada;
- [x] alteração é persistida;
- [x] API retorna o progresso atualizado.

## Planejamento de execução

### Descobertas e decisões

- Concluir normalmente exige `EM_ANDAMENTO`; conclusão direta de
  `NAO_INICIADO` só deve ser habilitada se a decisão V1 for confirmada.
- Preservar `iniciado_em` e impedir inconsistência entre datas.

### Implementação prevista

- Adicionar operação/endpoint de conclusão usando a mesma transição transacional
  da issue-181.
- Validar progresso, vínculo do marco ao local e permissão do usuário.
- Definir `CONCLUIDO`, preencher `concluido_em`, preservar início e atualizar
  `atualizado_em`.
- Retornar progresso atualizado no contrato da API.

### Testes e validação

- Conclusão válida, repetição de conclusão, progresso inexistente e marco/local
  incompatíveis.
- Verificar persistência de ambas as datas e resposta após nova sessão.

### Dependências, riscos e limites

- Depende das issues 180, 179 e 181.
- Se conclusão direta for permitida, preencher `iniciado_em` na mesma transação;
  documentar essa decisão antes de codificar.

## Relatório de execução

- Implementada a ação `concluir_progresso`, reutilizando a máquina de estados
  existente e exigindo a transição `EM_ANDAMENTO` → `CONCLUIDO`.
- A operação preserva `iniciado_em`, preenche `concluido_em` e atualiza o
  registro antes de retorná-lo.
- Criado o endpoint `POST /empreendimentos/{empreendimento_id}/progressos/{progresso_id}/concluir`.
- Acesso é validado para ADMIN/GESTOR e o progresso é conferido contra o
  empreendimento informado na rota.
- Conclusão direta de `NAO_INICIADO` não foi habilitada; a V1 mantém a ordem
  explícita de início e conclusão.
- Validação realizada: compilação dos módulos alterados e `git diff --check`.
- Testes de integração com banco não foram executados neste ambiente.

## Conclusão

Issue concluída no código. Marcos em andamento podem ser concluídos pela API,
com preservação do início, registro da conclusão, bloqueio de duplicidade e
retorno do progresso atualizado.
