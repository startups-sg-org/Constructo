## Descrição (FRONT-END issue)

Criar um checklist visual baseado no protocolo de evidências associado ao marco.

O checklist ajudará o gestor a identificar quais registros já foram feitos e quais ainda precisam ser capturados.

## Implementar

Criar componente:

EvidenceChecklist

Exibir:

- nome do protocolo;
- quantidade mínima;
- quantidade registrada;
- lista de itens;
- status de cada item;
- indicação de obrigatoriedade;
- progresso geral do protocolo.

Exemplo:

Impermeabilização

Evidências:
3 / 5

Checklist:

[✓] Visão geral
[✓] Piso
[ ] Encontro parede/piso
[✓] Ralo
[ ] Teste

Permitir selecionar um item para adicionar evidência relacionada.

## Critérios de aceite

- [ ] checklist é carregado pelo protocolo do marco;
- [ ] itens concluídos são identificados;
- [ ] itens pendentes são identificados;
- [ ] itens obrigatórios são diferenciados;
- [ ] quantidade mínima é exibida;
- [ ] quantidade registrada é exibida;
- [ ] checklist atualiza após novo registro;
- [ ] usuário consegue identificar facilmente o que falta.

## PLANEJAMENTO

### Implementação prevista

- Criar `EvidenceChecklist` em `apps/web/src/componentes/EvidenceChecklist/`,
  com estado de carregamento, erro e seleção de item.
- Adicionar ao service de evidências do front-end as chamadas para listar os
  protocolos/itens do marco, consultar o status por `progresso_marco_id` e
  registrar a evidência vinculada ao item.
- Derivar o estado visual de cada item a partir dos itens do protocolo e da
  lista `itens_pendentes` retornada pelo status; itens ausentes da lista são
  considerados atendidos.
- Exibir nome do protocolo, quantidade registrada/mínima, progresso, itens
  pendentes, itens concluídos e a indicação de obrigatoriedade.
- Após o upload e o registro da evidência no item, recarregar o status do
  protocolo para atualizar o checklist.
- Permitir seleção de um item, mantendo o upload associado ao
  `item_protocolo_id` selecionado.

### Testes e validação

- Testar carregamento de protocolo e status.
- Testar distinção entre item concluído, pendente e opcional.
- Testar quantidade registrada e mínima exibidas.
- Testar atualização após novo registro e tratamento de erro.
- Validar TypeScript/lint e testes do componente quando autorizados. Não
  executar testes Python neste escopo.



### Riscos e limites

- A API de status retorna pendências, não uma lista completa de evidências por
  item; o componente deve combinar `itens` do protocolo com `itens_pendentes`.
- O registro exige primeiro um `arquivo_url` obtido pelo upload e depois o
  endpoint de evidência do item.
- O componente precisa receber `empreendimentoId`, `marcoId` e
  `progressoMarcoId`; sem esses identificadores não é possível consultar o
  checklist correto.

## Criar

- [x] Contratos e chamadas no service de evidências do front-end.[x]
- [x] Componente `EvidenceChecklist` e estilos.[x]
- [x] Fluxo de seleção/upload/registro associado ao item.[x]
- [x] Testes do componente e validações de TypeScript/lint.[x]

## Relatório de verificação

### Itens atendidos

- O front-end já possui um service de upload de evidências e o componente
  `UploadEvidencia`, que podem ser reutilizados.

### Itens não implementados

- O `EvidenceChecklist` ainda não foi montado em uma página concreta do
  front-end; a etapa atual entrega o componente reutilizável e seu wrapper.

### Pendências

A issue permanece parcialmente implementada. Etapas 1 a 4 concluídas: foram
adicionados os tipos de protocolo, item, status e
evidência, além das chamadas para listar protocolos, consultar status e
registrar evidência em item. Nenhum `pytest` foi executado.

Etapa 2 concluída: criado o componente visual `EvidenceChecklist` com progresso,
itens atendidos/pendentes, indicação de obrigatoriedade e seleção opcional de
item.

Etapa 3 concluída: adicionado o fluxo de upload seguido do registro da URL no
item selecionado, com callback para recarregar o status e tratamento de erro.

Etapa 4 concluída: adicionado teste do componente para itens concluídos,
pendentes, opcionais e seleção. ESLint e TypeScript foram validados.
