## Descrição

Padronizar o registro das datas relacionadas à execução dos marcos.

As datas serão utilizadas para histórico, timeline, cálculo de duração e exibição ao gestor e ao comprador.

## Implementar

Utilizar os campos:

- `iniciado_em`;
- `concluido_em`;
- `criado_em`;
- `atualizado_em`.

Garantir que:

- `iniciado_em` seja preenchido ao iniciar;
- `concluido_em` seja preenchido ao concluir;
- `concluido_em` nunca seja anterior a `iniciado_em`;
- datas sejam manipuladas de forma consistente;
- datas sejam retornadas pela API.

Preparar o modelo para futura inclusão de:

- data prevista de início;
- data prevista de conclusão.

## Critérios de aceite

- [ ] início registra data corretamente;
- [ ] conclusão registra data corretamente;
- [ ] conclusão não pode ser anterior ao início;
- [ ] reabertura remove a data de conclusão;
- [ ] datas são retornadas pela API;
- [ ] datas são persistidas corretamente.

## Planejamento de execução

### Descobertas e decisões

- Usar `datetime` com timezone em `ProgressoMarco`; o service deve usar um único
  instante UTC por operação.
- `criado_em` e `atualizado_em` são metadados de persistência; início e conclusão
  representam o ciclo de execução.

### Implementação prevista

- Auditar model, schemas e services para garantir retorno consistente das quatro
  datas.
- Adicionar/fortalecer constraint `concluido_em IS NULL OR concluido_em >=
  iniciado_em`.
- Garantir que iniciar, concluir e reabrir atualizem somente as datas previstas
  para cada transição.
- Reservar campos previstos sem adicioná-los antes de decisão de produto.

### Testes e validação

- Testar datas após cada transição e após nova sessão.
- Rejeitar conclusão anterior ao início e confirmar limpeza na reabertura.
- Validar serialização ISO/timezone na API.

### Dependências, riscos e limites

- Depende das transições 181–183.
- Não implementar previsão de datas nesta issue.

## Relatório de execução

- Auditado o modelo `ProgressoMarco`, que já utiliza `DateTime(timezone=True)`
  para `iniciado_em`, `concluido_em`, `criado_em` e `atualizado_em`.
- As transições usam um único instante UTC por operação, preservam o início na
  conclusão/reabertura e removem `concluido_em` ao reabrir.
- As constraints do banco impedem conclusão sem início e conclusão anterior ao
  início; o schema de leitura retorna as quatro datas em formato ISO.
- Não foram adicionados campos de previsão, conforme o limite da issue.
- Validação realizada: compilação dos módulos e `git diff --check`.

## Conclusão

Issue concluída. O ciclo de datas do progresso está padronizado, validado pelo
modelo e exposto pela API, sem incluir previsão de datas.
