## Descrição

Validar o protocolo de evidências antes de permitir a conclusão de um marco.

O objetivo é impedir que um marco seja concluído sem a documentação mínima definida.

## Implementar

Antes da operação de conclusão do marco:

- verificar se existe protocolo associado;
- verificar quantidade mínima;
- verificar itens obrigatórios;
- identificar pendências.

Caso o protocolo esteja incompleto:

- impedir conclusão do marco;
- retornar erro adequado;
- informar quais requisitos ainda não foram atendidos.

Exemplo:

Não foi possível concluir o marco.

Pendências:
- quantidade mínima: 3 de 5 evidências;
- item obrigatório sem evidência: Ralo;
- item obrigatório sem evidência: Teste.

Para marcos sem protocolo:

- permitir conclusão normalmente.

## Critérios de aceite

- [x] marco com protocolo completo pode ser concluído;
- [x] marco com protocolo incompleto não pode ser concluído;
- [x] quantidade mínima é validada;
- [x] itens obrigatórios são validados;
- [x] mensagem informa as pendências;
- [x] marco sem protocolo continua podendo ser concluído;
- [x] validação fica centralizada no service.

## PLANEJAMENTO

### Implementação prevista

- Criar no service de evidências uma validação para conclusão que receba o
  `progresso_marco_id`, localize todos os protocolos associados ao marco e
  consulte quantidade mínima e itens obrigatórios para cada protocolo.
- Considerar o marco válido quando não houver protocolos associados.
- Bloquear a conclusão quando qualquer protocolo estiver incompleto e montar uma
  mensagem com protocolo, quantidade registrada versus mínima e itens pendentes.
- Integrar essa validação a `dominio.servicos.concluir_progresso` sem duplicar a
  regra na rota. A integração deve evitar import circular, usando uma dependência
  tardia ou uma camada de validação compartilhada.
- Manter a rota `POST /{empreendimento_id}/progressos/{progresso_id}/concluir`,
  retornando erro HTTP 400 com as pendências quando a validação falhar.

### Testes e validação

- Testar marco sem protocolo: conclusão permitida.
- Testar um protocolo completo: conclusão permitida.
- Testar quantidade mínima insuficiente: conclusão bloqueada com a pendência.
- Testar item obrigatório pendente: conclusão bloqueada com o nome do item.
- Testar múltiplos protocolos no mesmo marco, incluindo um incompleto.
- Validar lint e sintaxe dos arquivos alterados. Não executar `pytest` sem
  autorização explícita.

### Riscos e limites

- A validação deve usar o progresso do marco correto e não misturar evidências de
  outros locais.
- Um marco com vários protocolos só pode ser concluído quando todos estiverem
  completos.
- A mensagem de erro deve ser estável o suficiente para uso pela API, sem expor
  detalhes internos do banco.
- A integração entre `dominio` e `evidencias` pode causar ciclo de import; esse
  risco deve ser resolvido sem mover regras de persistência para a rota.

## Criar

- [x] Service de validação de conclusão no módulo `evidencias`.
- [x] Integração da validação em `dominio.servicos.concluir_progresso`.
- [x] Tratamento da mensagem de pendências no endpoint de conclusão.
- [x] Testes unitários e de integração dos cenários de aceite.

## Relatório de verificação

### Itens atendidos

- O endpoint de conclusão existente é `POST /{empreendimento_id}/progressos/{progresso_id}/concluir`.
- O service atual valida somente permissões e transição de estado do progresso.
- O service de evidências já expõe consulta de status por protocolo, incluindo
  quantidade mínima e itens obrigatórios pendentes.
- A etapa 1 criou `validar_conclusao_progresso`, que permite marcos sem
  protocolos e agrega pendências de todos os protocolos associados.
- A etapa 2 chama esse service antes da transição para `CONCLUIDO`, usando
  importação tardia para evitar ciclo entre os módulos.
- A etapa 3 documenta a resposta HTTP 400 do endpoint e preserva a mensagem
  detalhada de pendências no campo `detail`.
- A etapa 4 adicionou testes para marco sem protocolo, múltiplos protocolos,
  pendências de quantidade e item obrigatório, além da integração do service na
  conclusão do progresso.

### Pendência

A issue permanece implementada no código e com os cenários de teste escritos.
Falta apenas executar os testes quando houver autorização; isso é uma validação
pendente, não uma funcionalidade não implementada.

Validação realizada: Ruff, compilação Python e `git diff --check`. Nenhum
`pytest` foi executado.
