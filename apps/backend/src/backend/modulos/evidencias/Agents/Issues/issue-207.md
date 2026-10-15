## Descrição

Permitir que um marco possua um protocolo de evidências associado.

Esse vínculo definirá quais registros devem ser coletados durante a execução daquele marco.

## Implementar

Criar relacionamento entre:

Marco
└── ProtocoloEvidencia

Permitir:

- associar protocolo existente a um marco;
- remover associação;
- substituir protocolo;
- consultar protocolo de um marco.

Garantir que:

- um marco possa utilizar um protocolo;
- protocolo continue reutilizável;
- vínculo não altere o protocolo original;
- marcos sem protocolo continuem válidos quando permitido.

Exemplo:

Marco: Impermeabilização concluída

↓

Protocolo:
- visão geral;
- piso;
- encontro parede/piso;
- ralo;
- teste.

## Critérios de aceite

- [ ] protocolo pode ser vinculado a um marco;
- [ ] vínculo é persistido;
- [ ] protocolo pode ser consultado através do marco;
- [ ] associação pode ser removida;
- [ ] associação pode ser substituída;
- [ ] protocolo original não é alterado pelo vínculo;
- [ ] marco sem protocolo possui comportamento definido.

## PLANEJAMENTO

### Descobertas e decisão arquitetural

- Cardinalidade definida: um `Marco` pode ter mais de um
  `ProtocoloEvidencia`, mas cada protocolo pode pertencer a somente um marco.
- O model atual já possui `ProtocoloEvidencia.marco_id` obrigatório, FK para
  `marcos.id`, e portanto representa corretamente essa cardinalidade. Um marco
  sem protocolos também continua válido.
- A associação será tratada como alteração controlada de `marco_id`: associar
  um protocolo existente, removê-lo do marco (sem apagar o protocolo) ou
  transferi-lo para outro marco. O protocolo não pode ficar associado a dois
  marcos simultaneamente.

### Implementação prevista

1. Evoluir os models apenas para explicitar o relacionamento ORM bidirecional
   entre `Marco.protocolos_evidencia` e `ProtocoloEvidencia.marco`, preservando
   a FK existente `ProtocoloEvidencia.marco_id`.
2. Criar schemas para associar ou transferir um protocolo (`marco_id`) e para
   leitura dos protocolos de um marco. A consulta deve retornar lista vazia
   quando o marco ainda não possuir protocolos.
3. Ajustar o repositório para buscar um protocolo, listar os protocolos de um
   marco e atualizar somente `marco_id`; a remoção da associação deve tornar o
   protocolo sem vínculo apenas se a regra de negócio permitir `marco_id`
   anulável. Caso contrário, remoção significa excluir o protocolo, decisão a
   confirmar antes da implementação.
4. Implementar no service as regras transacionais: validar marco e protocolo,
   associar ou transferir, remover a associação conforme a regra definida e
   consultar. A troca não pode editar os demais campos do protocolo nem seus
   itens.
5. Expor endpoints autenticados de administrador ou gestor:
   - `PUT /empreendimentos/{empreendimento_id}/taxonomia/protocolos-evidencia/{protocolo_id}/marco`
     para associar ou transferir, recebendo `marco_id`;
   - `GET` no mesmo caminho para consultar a associação;
   - `DELETE` no mesmo caminho para removê-la.
   Todos devem validar que o marco pertence ao empreendimento e que o usuário
   tem acesso a ele.
6. Criar migration somente se a remoção de associação exigir tornar
   `marco_id` anulável. Para associação e transferência, a coluna e o índice
   já existentes são suficientes.

### Testes e validação

- Testar associação, consulta, substituição e remoção pela API.
- Cobrir marco sem protocolo retornando resposta definida (preferencialmente
  `200` com `null`) e protocolo inexistente retornando `404`.
- Cobrir acesso negado e marco de outro empreendimento.
- Testar que um protocolo transferido deixa de pertencer ao marco anterior e
  não pode aparecer associado a dois marcos.
- Caso seja necessária uma migration para permitir desassociação, aplicá-la em
  banco de validação.

### Riscos e dependências

- A issue diz que a associação pode ser removida, mas `marco_id` é obrigatório
  no model atual. É necessário decidir se remover significa excluir o
  protocolo, transferi-lo para outro marco, ou tornar `marco_id` anulável por
  migration. Essa decisão altera a persistência e os endpoints.
- O requisito original de "protocolo continue reutilizável" conflita com a
  cardinalidade definida agora. O planejamento segue a cardinalidade mais
  recente: protocolo não é reutilizável entre marcos.
