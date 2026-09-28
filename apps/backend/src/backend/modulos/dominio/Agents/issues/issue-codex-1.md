## Interface visual para configurar a taxonomia do empreendimento

### Objetivo

Criar, no frontend administrativo, uma interface para consultar taxonomias
disponíveis, selecionar uma taxonomia padrão, configurar sua cópia no
empreendimento e abrir o editor visual após a configuração.

### Contexto existente

- O frontend usa React Router Data Router.
- A página de detalhes está em
  `apps/web/src/modulos/empreendimentos/componentes/DetalhesEmpreendimento.tsx`.
- A rota do editor é
  `/admin/empreendimentos/:empreendimentoId/taxonomia`.
- O backend já oferece:

  ```text
  GET  /empreendimentos/{empreendimento_id}/taxonomia
  GET  /empreendimentos/taxonomias/disponiveis
  POST /empreendimentos/{empreendimento_id}/taxonomia/configurar
  ```

- A configuração cria uma cópia vinculada ao empreendimento; a taxonomia
  padrão original não deve ser editada.

## Planejamento de execução

### Descobertas e decisões

- A ação deve ficar associada ao empreendimento atual, nunca a uma taxonomia
  global sem contexto.
- O frontend deve diferenciar três estados:
  - taxonomia vinculada;
  - empreendimento sem taxonomia;
  - carregamento/erro ao consultar a configuração.
- A seleção deve usar somente taxonomias retornadas por
  `listarTaxonomiasDisponiveis`.
- O botão de confirmação deve enviar `origem_taxonomia_id` para o endpoint de
  configuração. O nome e a descrição da cópia podem ser opcionais nesta
  primeira versão.
- Depois de configurar com sucesso, a interface deve revalidar o detalhe do
  empreendimento e oferecer o acesso ao editor da taxonomia vinculada.
- Substituição de uma taxonomia já configurada fica fora desta interface até
  haver regra explícita para não invalidar progressos existentes.

### Implementação prevista

1. **Serviço e contratos frontend**
   - Tipar a resposta de taxonomia disponível com `id`, `nome`, `descricao`,
     `is_padrao`, `empreendimento_id` e `origem_taxonomia_id`.
   - Reutilizar `listarTaxonomiasDisponiveis` e `configurarTaxonomia` em
     `empreendimentos.service.ts`.
   - Normalizar mensagens de erro da API com o padrão de `actionUtils`.

2. **Componente de configuração**
   - Criar `TaxonomyConfiguration.tsx` no módulo de empreendimentos.
   - Receber `empreendimentoId` e o estado atual da taxonomia.
   - Quando não houver vínculo, mostrar:
     - título “Configurar taxonomia”;
     - explicação de que será criada uma cópia para o empreendimento;
     - select ou cards com as taxonomias padrão disponíveis;
     - descrição da taxonomia selecionada;
     - botão “Usar esta taxonomia”.
   - Quando houver vínculo, mostrar nome, origem e botão “Abrir editor de
     taxonomia”.
   - Exibir estado vazio quando não houver taxonomias padrão disponíveis.

3. **Loader/action e atualização**
   - Preferir `useFetcher` para buscar as opções sem navegação adicional ou
     criar loader específico da página caso a lista seja necessária antes da
     renderização.
   - Enviar `POST /empreendimentos/{id}/taxonomia/configurar` com o ID da
     opção selecionada.
   - Desabilitar controles durante o envio e apresentar feedback de sucesso ou
     erro.
   - Após sucesso, revalidar o loader da página ou atualizar o estado local;
     não exibir a cópia como configurada antes da resposta da API.

4. **Integração na página de detalhes**
   - Substituir o texto simples “Nenhuma taxonomia configurada” pelo componente
     de configuração quando não houver vínculo.
   - Manter a informação resumida quando houver vínculo.
   - Garantir que o botão “Editar taxonomia” só apareça/esteja habilitado após
     existir uma taxonomia vinculada.

5. **Acessibilidade e layout**
   - Usar `label` associado ao select/radio group.
   - Informar estados de carregamento e erro com `role="status"` e
     `role="alert"`.
   - Permitir navegação completa por teclado.
   - Adicionar estilos compatíveis com o painel desktop existente, sem criar
     dependência de biblioteca visual nova.

### Testes e validação

- Testar renderização do estado sem taxonomia.
- Testar carregamento e apresentação das taxonomias disponíveis.
- Testar seleção de uma opção e envio do ID correto.
- Testar botão desabilitado durante o envio.
- Testar resposta de sucesso com atualização do nome/origem e link do editor.
- Testar erro da API e ausência de opções disponíveis.
- Testar que o editor não é aberto quando não existe vínculo.
- Testar acesso por teclado e rótulos dos controles principais.
- Executar os testes focados do frontend e `git diff --check`.

### Dependências, riscos e limites

- Depende dos endpoints backend de listagem e configuração estarem disponíveis
  e da sessão do usuário ter permissão ADMIN ou GESTOR vinculado.
- A interface não deve permitir editar a taxonomia padrão diretamente.
- Não implementar nesta issue substituição de taxonomia já utilizada,
  exclusão de vínculo, drag-and-drop ou personalização de etapas/marcos.
- Se o backend retornar `404` para empreendimento sem taxonomia, o frontend
  deve tratar esse status como estado vazio, não como erro fatal da página.
- O fluxo deve preservar a rota atual do editor para não duplicar a lógica de
  edição criada na issue-174.
