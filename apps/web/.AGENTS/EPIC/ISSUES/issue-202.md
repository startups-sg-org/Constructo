### FRONT-202 — Implementar a visão geral (Visualizar)

**Objetivo**

Apresentar uma visão rápida e acionável do empreendimento, equivalente à página
inicial de um repositório, sem substituir as áreas especializadas.

**Escopo**

- Rota índice `/admin/empreendimentos/:empreendimentoId`.
- Card “Sobre o empreendimento” com descrição, endereço e datas já fornecidos
  pelo domínio.
- Resumo contextual de estrutura (quantidade de torres e pavimentos), taxonomia  e atividade somente quando os
  dados existentes estiverem disponíveis; não inventar contagens nem eventos.
- Reutilização de `DetalhesEmpreendimento` e `UploadEvidencia` onde fizer
  sentido, mantendo ações de configuração nas abas próprias.
- Links claros para Estrutura, Taxonomia e demais áreas pelo navbar compartilhado.

**Critérios de aceite**

- [ ] A abertura da aba Visualizar exibe nome, situação, descrição, endereço e
  datas do empreendimento.
- [ ] Informações ausentes usam estado de ausência compreensível, sem valores
  fictícios.
- [ ] A visão geral é somente leitura, exceto ações já autorizadas de evidência.
- [ ] O conteúdo funciona como rota índice e mantém a aba Visualizar ativa.
- [ ] Nenhum dado ou comportamento da estrutura/taxonomia é duplicado na visão
  geral.

**Dependências**

- `FRONT-201`.
- Dados e componentes atuais de `DetalhesEmpreendimento`- Está permitido refatorar todo o código de `DetalhesEmpreendimentos`.


Plano da FRONT-202 — visão geral “Visualizar”:

1. Refatorar `DetalhesEmpreendimento` para ser uma página de consulta.
   - Manter `useRouteLoaderData("empreendimento")`.
   - Criar o card “Sobre o empreendimento”.
   - Exibir descrição, endereço, data de criação e atualização.
   - Usar mensagens como “Descrição não informada” quando o dado não existir.
   - Nome e status continuam no shell; não duplicar no card.

2. Remover ações que não pertencem à visão geral.
   - Remover `TaxonomyConfiguration`, pois configurar taxonomia é uma alteração e deve ocorrer na aba Taxonomia.
   - Remover botões de atalho “Editar empreendimento”, “Gerenciar estrutura física” e “Editar taxonomia”; as abas do shell já fazem essa navegação.
   - Manter `UploadEvidencia`, pois a issue permite as ações de evidência já autorizadas.

3. Tratar o resumo opcional de taxonomia.
   - Reutilizar a consulta atual de taxonomia apenas para mostrar seu nome, caso ela exista.
   - Exibir “Nenhuma taxonomia configurada” quando a API responder 404.
   - Não criar contagem de etapas, torres, pavimentos ou atividades enquanto esses dados não forem carregados pela rota.

4. Organizar estilos.
   - Mover os estilos de detalhe hoje misturados em `ListaEmpreendimentos.css` para um CSS próprio de detalhes.
   - Usar os tokens globais (`--cor-superficie`, `--cor-borda`, etc.) e o padrão `lista-dados`.

5. Cobrir com testes.
   - Rota índice mostra shell com nome/status e card com descrição, endereço e datas.
   - Campos ausentes mostram os textos de ausência.
   - Taxonomia existente e taxonomia ausente.
   - Não há botões de edição/configuração na visão geral; upload de evidência continua disponível.
   - A aba “Visualizar” permanece ativa em `/admin/empreendimentos/:id`.

Observação: a rota índice já existe graças à FRONT-201; esta issue concentra-se em melhorar somente o conteúdo renderizado dentro dela.