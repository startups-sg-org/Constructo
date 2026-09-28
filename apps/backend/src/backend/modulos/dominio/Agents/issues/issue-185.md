## Descrição

Criar um histórico das alterações realizadas no progresso dos marcos.

O objetivo é permitir rastrear mudanças de status ao longo do tempo.

## Implementar

Criar entidade de histórico contendo:

- id;
- progresso_marco_id;
- status_anterior;
- status_novo;
- alterado_por;
- alterado_em;
- observacao opcional.

Registrar histórico ao:

- iniciar marco;
- concluir marco;
- reabrir marco.

Permitir consultar o histórico de um progresso específico.

Exemplo:

NAO_INICIADO
↓
EM_ANDAMENTO

EM_ANDAMENTO
↓
CONCLUIDO

CONCLUIDO
↓
EM_ANDAMENTO

## Critérios de aceite

- [ ] alterações de status geram histórico;
- [ ] histórico registra status anterior;
- [ ] histórico registra status novo;
- [ ] usuário responsável é registrado;
- [ ] data da alteração é registrada;
- [ ] histórico não é sobrescrito;
- [ ] histórico pode ser consultado pela API.

## Planejamento de execução

### Descobertas e decisões

- Criar entidade append-only `HistoricoProgressoMarco` ligada a
  `ProgressoMarco`, com status enum, usuário opcional/obrigatório conforme o
  fluxo de autenticação e timestamp UTC.
- Histórico não deve ser atualizado nem apagado por operações comuns.

### Implementação prevista

- Adicionar model, FK, índice por `progresso_marco_id` e migration.
- Criar schemas de leitura e consulta, incluindo observação opcional.
- Centralizar o registro em service chamado por iniciar, concluir e reabrir.
- Criar endpoint de consulta ordenado por `alterado_em` e `id`.
- Validar usuário responsável e acesso ao empreendimento do progresso.

### Testes e validação

- Confirmar as três transições gerando entradas com status anterior/novo,
  usuário, data e observação.
- Confirmar que múltiplas entradas são preservadas e ordenadas.
- Testar consulta de progresso inexistente, acesso negado e histórico vazio.
- Testar rollback: se a transição falhar, seu histórico também não persiste.

### Dependências, riscos e limites

- Depende de 180–184 e deve ser integrada sem duplicar lógica nas rotas.
- Definir se `alterado_por` aceita sistema/NULL para ações automáticas antes da
  migration.
- Não incluir comentários editáveis ou auditoria de outros recursos.

## Relatório de execução

- Criada a entidade append-only `HistoricoProgressoMarco`, com status anterior
  e novo, usuário responsável, timestamp UTC e observação opcional.
- Criada migration `20260927_0010_historico_progresso_marco.py`, incluindo FKs
  e índices para progresso, usuário e data.
- O registro foi centralizado em `alterar_estado`; iniciar, concluir e reabrir
  passam o usuário autenticado e geram uma entrada sem sobrescrever as
  anteriores.
- Criado o endpoint `GET /empreendimentos/{empreendimento_id}/progressos/{progresso_id}/historico`,
  ordenado por data e id e protegido por acesso ao empreendimento.
- Validação realizada: compilação dos módulos alterados e `git diff --check`.
- Testes de integração com banco não foram executados neste ambiente.

## Conclusão

Issue concluída no código. As transições de progresso agora geram histórico
append-only consultável pela API, com responsável, estados e data da alteração.
