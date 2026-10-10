## Descrição

Permitir que determinados itens do protocolo sejam obrigatórios.

A quantidade mínima de fotos não será suficiente quando um item específico exigido ainda não tiver sido documentado.

## Implementar

Utilizar o campo:

`obrigatorio`

em `ItemProtocolo`.

Permitir associar uma evidência registrada a um item do protocolo.

Validar:

- todos os itens obrigatórios devem possuir ao menos uma evidência válida;
- itens opcionais não impedem conclusão;
- quantidade mínima e itens obrigatórios devem ser avaliados separadamente.

Exemplo:

Protocolo: Impermeabilização

- visão geral — obrigatório;
- piso — obrigatório;
- ralo — obrigatório;
- detalhe lateral — opcional.

Mesmo com 5 fotos, o protocolo continuará incompleto caso não exista evidência do ralo.

## Critérios de aceite

- [x] item pode ser marcado como obrigatório;
- [x] evidência pode ser associada a um item;
- [x] item obrigatório sem evidência é identificado;
- [x] item opcional sem evidência não bloqueia o protocolo;
- [x] protocolo considera quantidade mínima;
- [x] protocolo considera itens obrigatórios;
- [x] API retorna quais itens ainda estão pendentes.

## Planejamento

- Adicionar `item_protocolo_id` opcional em `Evidencia`, com FK para
  `itens_protocolo`; validar que item, protocolo e marco pertencem ao mesmo
  `progresso_marco`.
- Contar evidências por item obrigatório separadamente da quantidade total.
  Itens opcionais ausentes não entram como pendência.
- Estender o status do protocolo com `itens_pendentes` e manter
  `quantidade_atendida` independente.
- Ajustar o registro de evidência para receber o item opcional; upload de
  arquivo continua responsável apenas pelo armazenamento.
- Testar item obrigatório pendente, item opcional pendente, item atendido e
  quantidade mínima atendida sem itens obrigatórios atendidos.

### Implementação prevista

- Receber `item_protocolo_id` ao registrar uma evidência e validar o vínculo
  com o protocolo e o marco do progresso.
- Retornar no status a quantidade total, o atendimento do mínimo e a lista de
  itens obrigatórios sem evidência.

### Testes e validação

- Cobrir item obrigatório pendente, opcional pendente e item atendido.
- Confirmar que quantidade mínima e itens pendentes são avaliados separadamente.

### Riscos e limites

- Uma evidência associada a item de outro protocolo ou marco deve ser rejeitada.
- Esta issue não altera o armazenamento nem o upload de arquivos.

## Criar

1. Model e migration da FK `Evidencia.item_protocolo_id`[x].
2. Schemas de registro e status com itens pendentes[x].
3. Consultas no repositório para contar evidências por item[x].
4. Regras e service de validação do protocolo[x].
5. Endpoints para registrar item e consultar status[x].
6. Testes unitários e de integração[x].

## Relatório de verificação

### Itens atendidos

- `ItemProtocolo.obrigatorio` está disponível no model e nos schemas de criação,
  atualização e leitura.[x]
- `Evidencia.item_protocolo_id` foi adicionado como campo opcional, com FK,
  índice e migration `20261010_0015`.
- O endpoint `POST .../protocolos-evidencia/{protocolo_id}/itens/{item_id}/evidencias`
  registra a evidência associada ao item e obtém o usuário pela autenticação.
- O service valida que protocolo e item pertencem ao marco informado e que o
  progresso também pertence ao mesmo marco.[x]
- A consulta de pendências considera somente itens com `obrigatorio = true` e
  exige uma evidência do mesmo item e progresso. Itens opcionais não aparecem
  como pendentes.[x]
- O status mantém a quantidade mínima separada dos itens obrigatórios, por meio
  de `quantidade_atendida`, `itens_obrigatorios_atendidos` e `itens_pendentes`.
- A quantidade mínima conta somente evidências vinculadas aos itens do protocolo
  consultado e ao progresso informado; evidências de outros protocolos não são
  incluídas.
- O registro da evidência confirma que `arquivo_url` pertence a um upload
  persistido no mesmo empreendimento antes de criar o vínculo com o item.
- A API de status retorna os identificadores, nomes e ordem dos itens ainda
  pendentes.
- O lint dos arquivos envolvidos passou e o Alembic reconhece
  `20261010_0015` como único `head`.

### Itens parcialmente atendidos

1. Existem testes para o endpoint de associação e para a separação entre mínimo,
   item obrigatório e item opcional, mas falta teste do service rejeitando uma
   associação com item de outro protocolo/marco.[x]
2. Os testes não foram confirmados nesta verificação. Uma execução focada
   anterior atingiu o limite de 60 segundos sem resultado; por orientação do
   usuário, não foram executados novos comandos `pytest`.[x]

### Itens não implementados

- Nenhum item identificado nesta verificação permanece sem implementação.

### Conclusão

A associação da evidência ao item, a identificação dos itens obrigatórios
pendentes, a contagem mínima isolada por protocolo e o retorno pela API estão
implementados. A issue permanece parcialmente atendida até os cenários de
validação serem confirmados por testes executados.[x]
