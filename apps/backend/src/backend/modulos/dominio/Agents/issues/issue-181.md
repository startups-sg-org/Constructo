## Descrição

Permitir que um marco seja alterado de `NAO_INICIADO` para `EM_ANDAMENTO`.

Essa ação representa o início da execução daquele marco em um local específico da obra.

## Implementar

Criar operação para iniciar um marco.

Ao iniciar:

- alterar status para `EM_ANDAMENTO`;
- preencher `iniciado_em`;
- atualizar `atualizado_em`.

Validar:

- progresso existe;
- status atual é `NAO_INICIADO`;
- marco pertence à taxonomia correta;
- local pertence ao empreendimento correto.

Criar endpoint ou action correspondente.

## Critérios de aceite

- [ ] marco não iniciado pode ser iniciado;
- [ ] status muda para `EM_ANDAMENTO`;
- [ ] `iniciado_em` é preenchido;
- [ ] marco já concluído não pode ser iniciado diretamente;
- [ ] marco já em andamento não gera operação duplicada;
- [ ] API retorna o progresso atualizado;
- [ ] alteração é persistida no banco.

## Planejamento de execução

### Descobertas e decisões

- Reutilizar `alterar_estado` e `validar_transicao` existentes quando
  compatíveis; não criar uma segunda máquina de estados.
- A operação deve ser transacional e protegida por acesso ao empreendimento do
  usuário.

### Implementação prevista

- Criar service/ação explícita de início ou endpoint de transição para
  `ProgressoMarco`.
- Buscar o progresso com lock, validar `NAO_INICIADO`, local, marco e
  empreendimento, preencher `iniciado_em` e atualizar timestamp.
- Retornar schema de leitura com status e datas.
- Mapear inexistência, estado inválido e acesso negado para erros HTTP distintos.

### Testes e validação

- Início válido persiste status e `iniciado_em`.
- Repetição em andamento, conclusão direta e progresso de outro empreendimento
  devem ser rejeitados.
- Confirmar resposta API e leitura em nova sessão.

### Dependências, riscos e limites

- Depende da issue-180 e do enum da issue-179.
- Registro de histórico será implementado na issue-185, mas a operação deve
  deixar um ponto único para dispará-lo.
