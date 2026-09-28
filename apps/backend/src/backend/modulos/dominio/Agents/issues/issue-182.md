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

- [ ] marco pode ser concluído;
- [ ] status muda para `CONCLUIDO`;
- [ ] `concluido_em` é preenchido;
- [ ] `iniciado_em` é preservado;
- [ ] marco já concluído não gera conclusão duplicada;
- [ ] alteração é persistida;
- [ ] API retorna o progresso atualizado.

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
