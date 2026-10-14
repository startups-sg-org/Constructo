## Descrição

Criar uma interface administrativa para criar e editar protocolos de evidências.

O editor permitirá ao gestor padronizar quais registros devem ser realizados em cada tipo de marco.

## Implementar

Criar página ou componente:

ProtocolEditor

Criar estrutura:

ProtocolEditor
├── ProtocolHeader
├── ProtocolForm
├── ProtocolItemList
│   └── ProtocolItem
└── ProtocolPreview

Permitir:

- criar protocolo;
- editar nome;
- editar descrição;
- definir quantidade mínima;
- adicionar item;
- editar item;
- remover item;
- marcar item como obrigatório;
- alterar ordem dos itens;
- visualizar prévia do checklist.

Integrar com Data Router.

Utilizar:

- loader para carregar protocolo;
- action ou `useFetcher` para alterações;
- revalidação após mudanças.

## Critérios de aceite

- [ ] usuário consegue criar protocolo;
- [ ] usuário consegue editar protocolo;
- [ ] usuário consegue definir quantidade mínima;
- [ ] usuário consegue adicionar itens;
- [ ] usuário consegue editar itens;
- [ ] usuário consegue remover itens;
- [ ] usuário consegue marcar itens obrigatórios;
- [ ] ordem dos itens pode ser alterada;
- [ ] preview reflete as alterações;
- [ ] loading e erros são tratados.

## PLANEJAMENTO

### Implementação prevista

- Criar `ProtocolEditor` em `apps/web/src/modulos/evidencias/componentes/`,
  decompondo a interface em `ProtocolHeader`, `ProtocolForm`,
  `ProtocolItemList`, `ProtocolItem` e `ProtocolPreview` quando a separação
  reduzir complexidade.
- Adicionar ao service de evidências as operações de criar/editar protocolo,
  listar/criar/editar/remover itens e atualizar `quantidade_minima`.
- Criar loader com `empreendimentoId`, `marcoId` e `protocoloId` para carregar o
  protocolo e seus itens; para criação, carregar apenas o contexto do marco.
- Criar action ou `useFetcher` para persistir cada alteração e revalidar o
  loader após sucesso, mantendo loading e erro visíveis.
- Reutilizar os contratos existentes da API:
  `POST/GET /empreendimentos/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia`,
  `PATCH .../{protocolo_id}`, e os endpoints de itens sob
  `.../protocolos-evidencia/{protocolo_id}/itens`.
- Fazer a prévia derivar do mesmo estado usado pelo formulário, incluindo ordem,
  obrigatoriedade e quantidade mínima.

### Testes e validação

- Testar loader de criação e edição.
- Testar action/fetcher para criar, editar e remover protocolo/item.
- Testar edição de quantidade mínima, obrigatoriedade e ordem.
- Testar preview refletindo alterações sem duplicar estado divergente.
- Testar estados de carregamento e erro.
- Validar ESLint e TypeScript. Não executar `pytest` neste escopo.

### Riscos e limites

- A API de protocolo é escopada por marco; o editor deve impedir edição de um
  protocolo fora do `marcoId` informado.
- Alterações de ordem devem enviar `ordem` explícita e preservar a ordenação do
  backend.
- Remover item pode afetar evidências já associadas; a UI deve exibir erro da API
  sem mascará-lo.
- A prévia não deve criar persistência própria nem divergir do estado salvo.

## Criar

1. Contratos, service e loader/action do editor.
2. Componentes `ProtocolEditor`, formulário, lista e preview.
3. Integração da rota no Data Router.
4. Testes do editor e validações de TypeScript/ESLint.

## Relatório de verificação

### Itens atendidos

- O front-end já utiliza Data Router com loaders, actions e `useFetcher` em
  componentes administrativos existentes.
- O backend já oferece endpoints de protocolos e itens necessários ao editor.

### Estado atual

- Contratos, service, loader/action, componentes e preview implementados.
- Rotas de criação e edição integradas ao Data Router no painel administrativo.
- Cinco testes do editor com Data Router e API simulada aprovados.
- Navegação pela taxonomia, listagem, criação e edição disponíveis.

### Pendências

Etapas 1 a 4 implementadas. TypeScript e ESLint aprovados; testes específicos
aprovados. A suíte web tem uma falha fora do editor, detalhada abaixo.
Validação com backend real ainda pendente; nenhum `pytest` foi executado.

## Registro de execução — etapa 1

### Arquivos alterados/criados

- `apps/backend/src/backend/modulos/evidencias/schemas.py`
- `apps/backend/src/backend/modulos/evidencias/repository.py`
- `apps/backend/src/backend/modulos/evidencias/servicos.py`
- `apps/backend/src/backend/modulos/evidencias/routes.py`
- `apps/web/src/features/evidencias/evidencias.service.ts`
- `apps/web/src/features/evidencias/protocolos.loader.ts`
- `apps/web/src/features/evidencias/protocolos.action.ts`

### Entregue

- Contrato de atualização de protocolo agora aceita nome, descrição e quantidade
  mínima; o patch apenas de quantidade mínima permanece compatível.
- Service web cobre criar/editar protocolo e criar/editar/remover itens.
- Loader valida os IDs de rota, carrega o protocolo no marco informado e rejeita
  protocolo fora do marco.
- Action trata criação/edição do protocolo e CRUD dos itens, retornando erros de
  API sem mascará-los.

### Validações e pendências

- Inspeção estática dos contratos e caminhos HTTP concluída.
- Testes e validações TypeScript/ESLint foram deliberadamente adiados para a etapa 4.
- Restam os componentes, a integração da rota e os testes do editor.

## Registro de documentação — etapa 1

- Documentados os cabeçalhos e as funções de
  `apps/web/src/features/evidencias/evidencias.service.ts`,
  `apps/web/src/features/evidencias/protocolos.loader.ts` e
  `apps/web/src/features/evidencias/protocolos.action.ts`.
- Os cabeçalhos distinguem as responsabilidades: service como cliente HTTP,
  loader como preparação de dados da rota e action como processadora das
  mutações de formulário.
- Nenhuma validação automatizada foi executada; os componentes, a rota e os
  testes continuam pendentes das etapas seguintes.

## Registro de execução — etapa 2

### Arquivos criados

- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolEditor.tsx`
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolHeader.tsx`
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolForm.tsx`
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolItemList.tsx`
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolItem.tsx`
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolPreview.tsx`
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolEditor.css`

### Entregue

- Editor de protocolo composto por cabeçalho, formulário, lista de itens,
  item editável e prévia.
- Prévia alimentada pelo mesmo estado controlado do formulário e dos itens,
  incluindo ordem, obrigatoriedade e quantidade mínima.
- Formulários usam `useFetcher`, exibem estados de salvamento e mensagens de
  erro retornadas pela action.

### Validações e pendências

- Inspeção estática do fluxo de estados e dos nomes de intenções concluída.
- TypeScript, ESLint e testes permanecem reservados à etapa 4.
- Resta integrar as rotas do Data Router na etapa 3; até essa integração, os
  componentes não são acessíveis pela aplicação.

## Registro de execução — etapa 3

### Arquivos alterados

- `apps/web/src/router/router.tsx`: registra as duas rotas com `ProtocolEditor`,
  loader e action; exige acesso ADMIN/GESTOR antes de carregar ou alterar dados.
- `apps/web/src/features/evidencias/protocolos.action.ts`: redireciona após criar
  para a URL de edição, fornecendo `protocoloId` às próximas mutações.
- Este arquivo: atualização do estado e registro da etapa.

### Rotas

- Criação: `/admin/empreendimentos/:empreendimentoId/taxonomia/marcos/:marcoId/protocolos/novo`.
- Edição: `/admin/empreendimentos/:empreendimentoId/taxonomia/marcos/:marcoId/protocolos/:protocoloId`.
- Formulários com `useFetcher` enviam para a action da rota atual; a revalidação
  padrão do Data Router permanece habilitada após as mutações.
- Erros de carregamento usam `ErroRota` herdado do painel; a navegação usa
  `FeedbackNavegacao` existente.

### Validações e pendências

- Revisão estática de parâmetros, proteção de acesso e destino após criação.
- `git diff --check` executado sem erros.
- Execução funcional, testes, TypeScript e ESLint pendentes da etapa 4;
  critérios de aceite mantidos desmarcados até a verificação.
- Acesso ao editor por URL direta; atalhos de navegação na taxonomia não foram
  incluídos nesta etapa de registro de rotas.
- Nenhum `pytest` executado.

## Registro de execução — etapa 4 e complemento de navegação

### Arquivos

- `apps/web/src/modulos/empreendimentos/componentes/TaxonomyEditor.tsx`:
  link de protocolos em cada marco.
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolList.tsx`:
  listagem, estado vazio, acesso à criação/edição e retorno à taxonomia.
- `apps/web/src/router/router.tsx`: rota protegida de listagem.
- `apps/web/src/features/evidencias/protocolos.loader.ts`: disponibiliza a
  coleção de protocolos e explicita os parâmetros necessários.
- `apps/web/src/modulos/evidencias/componentes/ProtocolEditor/ProtocolEditor.tsx`:
  retorno à listagem e sincronização com dados persistidos; preserva rascunho
  quando uma revalidação após erro devolve os mesmos dados.
- `ProtocolForm.tsx`, `ProtocolItemList.tsx` e `ProtocolItem.tsx` no mesmo
  diretório: removidos efeitos redundantes de resultados antigos; inclusão e
  remoção passam a depender da revalidação. Formulário de novo item é limpo
  após sucesso. Evita reinserir na tela um item já excluído.
- `ProtocolHeader.tsx`: corrigida referência acessível do título.
- `apps/web/src/features/evidencias/protocolos.test.tsx`: cinco testes de
  integração do editor usando Data Router real e service simulado.

### Fluxo entregue

Empreendimento → Taxonomia → Protocolos de evidências do marco → lista →
Criar protocolo ou Editar. Após criar, redireciona à edição para incluir itens.
O editor permite retornar à lista; a lista permite retornar à taxonomia.

### Validações executadas

- `pnpm --filter web exec tsc -b`: aprovado.
- `pnpm --filter web lint`: aprovado.
- Testes específicos: 5 aprovados, cobrindo criação/redirecionamento/lista,
  edição e prévia, itens/ordem/obrigatoriedade/remoção, loading/erro com
  preservação de rascunho e rejeição de IDs inválidos/protocolo fora do marco.
- `pnpm --filter web test`: 72 aprovados e 1 falha em
  `src/componentes/EvidenceChecklist/EvidenceChecklist.test.tsx:40`.
  Espera texto concatenado “Visão geralObrigatório”, mas encontra “Visão geral”.
  Arquivo e componente não alterados nesta etapa.
- Nenhum `pytest` executado.

### Pendências restantes

- Validar ponta a ponta com backend e banco reais, incluindo persistência,
  permissões e erros ao remover itens com evidências associadas.
- Resolver a falha de EvidenceChecklist no escopo correspondente.
- Critérios de aceite permanecem desmarcados até verificação com API real;
  os testes desta etapa simulam o service HTTP.
