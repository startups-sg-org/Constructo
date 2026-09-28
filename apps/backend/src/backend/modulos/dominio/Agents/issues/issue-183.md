## Descrição

Permitir que um marco concluído seja reaberto quando for necessário corrigir ou continuar uma execução.

## Implementar

Criar operação de reabertura.

Ao reabrir:

- alterar status de `CONCLUIDO` para `EM_ANDAMENTO`;
- limpar `concluido_em`;
- preservar `iniciado_em`;
- atualizar `atualizado_em`.

Registrar a alteração no histórico.

Validar:

- somente marcos concluídos podem ser reabertos;
- progresso deve existir;
- usuário deve possuir permissão adequada.

## Critérios de aceite

- [ ] marco concluído pode ser reaberto;
- [ ] status volta para `EM_ANDAMENTO`;
- [ ] `concluido_em` é removido;
- [ ] `iniciado_em` permanece;
- [ ] ação é registrada no histórico;
- [ ] marco não concluído não pode ser reaberto;
- [ ] alteração é persistida.

## Planejamento de execução

### Descobertas e decisões

- Reabertura deve ser uma transição exclusiva `CONCLUIDO → EM_ANDAMENTO`.
- `iniciado_em` permanece; `concluido_em` vira `NULL`.
- O registro de histórico será criado pela issue-185, mas a operação deve
  fornecer usuário e observação ao mecanismo de auditoria.

### Implementação prevista

- Criar service/endpoint de reabertura com lock e validação de acesso.
- Reutilizar a transição de estado existente, evitando mutação direta em rotas.
- Limpar conclusão, atualizar timestamp e registrar o responsável.

### Testes e validação

- Reabrir progresso concluído e confirmar todas as datas/status após commit.
- Rejeitar progresso não concluído, inexistente, de outro empreendimento ou sem
  permissão.
- Confirmar histórico sem sobrescrever entradas anteriores.

### Dependências, riscos e limites

- Depende de 180–182 e deve ser implementada junto ao contrato de histórico da
  issue-185.
- Não permitir reabertura para `NAO_INICIADO` nesta issue.
