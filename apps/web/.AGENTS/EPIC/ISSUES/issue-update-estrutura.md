## {FRONT} - update front-end da tela de estrutura 

### Ações de planejamento

- [x] Ler a referência visual e comparar sua composição com a tela de estrutura existente.

Feito: a referência foi decomposta em hierarquia lateral, busca e ações contextuais, lista do nível selecionado e painel de detalhes. Também foram revisados `StructureManagementPage`, `StructureTree`, `StructureList`, `LocationDetails`, `LocationForm`, `UnitBuyerLink`, loaders, actions, services e testes atuais.

- [x] Validar os contratos e as capacidades reais do backend antes de definir o escopo.

Feito: o backend já fornece a árvore completa, criação de torre/bloco, pavimento e unidade, edição de nome/ordem e vínculo/listagem de compradores. As lacunas que impedem funções adicionais da referência foram separadas em “Pendências de backend”, sem bloquear o redesign.

## Plan

Refatorar `/admin/empreendimentos/:empreendimentoId/estrutura` para o painel operacional escuro da referência, com alto grau de semelhança visual e usando Tailwind CSS. A implementação deve adaptar a referência ao shell individual do empreendimento já existente, preservar todas as integrações atuais e exibir apenas dados e ações sustentados pelo backend.

### Scope

- In: `StructureManagementPage`, árvore hierárquica, busca, breadcrumb do local, lista do nível selecionado, painel de detalhes, criação e edição de locais, compradores vinculados, estados vazio/erro/carregamento, responsividade, acessibilidade e testes da rota.
- In: ajustes em componentes compartilhados da árvore e em `src/index.css` somente quando houver um padrão visual realmente reutilizado, seguindo `docs/tailwind-convention.md` e `docs/designs-system.md`.
- Out: duplicar sidebar, topbar, identidade da obra ou navegação horizontal que já pertencem a `LayoutEmpreendimentos`; alterar autenticação, autorização ou regras da hierarquia; inventar identificação, usuários ou ações não retornadas pela API.
- Out: exclusão, movimentação entre pais, desvinculação de comprador e menus de ações sem operação real no backend.

### Dados e operações disponíveis

- `GET /empreendimentos/{id}/estrutura-fisica`: retorna toda a árvore com `id`, `parent_id`, `nome`, `tipo`, `ordem`, datas e `filhos`.
- `POST /empreendimentos/{id}/locais`: cria uma raiz do tipo `TORRE` ou `BLOCO`.
- `POST /empreendimentos/{id}/locais/{parent_id}/pavimentos`: cria um pavimento sob torre ou bloco.
- `POST /empreendimentos/{id}/locais/{parent_id}/unidades`: cria uma unidade sob pavimento.
- `PATCH /empreendimentos/{id}/locais/{local_id}`: altera somente nome e ordem do local.
- `GET` e `POST /empreendimentos/{id}/locais/{unidade_id}/compradores`: listam e vinculam compradores por ID; os nomes e e-mails são atualmente combinados no front com a listagem de usuários.
- A seleção compartilhável por `?localId=` e a validação do local selecionado já existem e devem continuar sendo a fonte de estado da interface.

### Action items

- [x] Mapear a referência para os tokens Tailwind atuais e definir o grid responsivo da área de trabalho: hierarquia fixa, conteúdo central fluido e detalhes laterais no desktop; duas etapas no tablet; painéis empilhados no mobile. Não copiar o shell externo da referência nem criar CSS local para utilitários já cobertos pelo Tailwind.

Feito: a área de trabalho passou a usar os tokens escuros e o painel global `ds-panel`, com grid Tailwind de 208 px/fluido/224 px no desktop, detalhes na segunda linha do tablet e uma coluna no mobile. O CSS local exclusivo desse layout foi removido sem duplicar o shell do empreendimento.

- [x] Refatorar `StructureManagementPage` como orquestrador do novo layout, preservando loader, action, `?localId=`, seleção inválida, busca, expansão, revalidação e estado dos compradores. O título deve ser “Estrutura do empreendimento” com o subtítulo da referência e sem dados demonstrativos.

Feito: `StructureManagementPage` passou a compor semanticamente o cabeçalho e os três painéis da referência, com título, subtítulo, busca e alerta no tema escuro. Loader, action da rota, seleção por `localId`, expansão, revalidação e estado dos compradores foram mantidos sem dados fictícios.

- [x] Refatorar `StructureTree` e `StructureTreeItem` para a hierarquia visual da referência, com ícones por tipo, linhas de ancestralidade, seleção destacada, expansão/recolhimento individual e ação “Expandir tudo/Recolher tudo”, mantendo semântica de árvore, foco visível e navegação por teclado.

Feito: a árvore foi migrada para Tailwind com ícones por tipo, linhas de ancestralidade, destaque do local selecionado e controles individuais e globais de expansão. Também recebeu semântica ARIA de árvore e navegação por setas, Home/End e teclado nativo de botões, sem CSS local.

- [x] Refatorar `StructureList` para a tabela compacta da referência, exibindo apenas os filhos diretos do contexto selecionado, busca por nome, breadcrumb, quantidade real e colunas sustentadas pela API (`Nome`, `Tipo`, `Ordem` e `Ações`). A linha inteira ou seu nome deve selecionar o local sem perder o deep link.

Feito: a lista foi convertida em tabela Tailwind compacta com breadcrumb, contagem real e filtro por nome dos filhos diretos. As colunas agora usam somente nome, tipo e ordem da API, e tanto o nome quanto a ação de detalhes mantêm a seleção por `localId`.

- [x] Reintegrar os fluxos de criação no novo design: torre/bloco na raiz, pavimento em torre/bloco e unidade em pavimento. Abrir o formulário adequado como modal ou painel condicional, reutilizar `cadastrarLocalRaiz`, os schemas atuais e mensagens de validação/sucesso, e atualizar a árvore após salvar sem alterar o backend.

Feito: os três níveis de criação foram integrados em um painel condicional no novo layout, reutilizando a action e as validações existentes. Após o cadastro, a rota revalida a estrutura, expande o local superior quando necessário e exibe a confirmação de sucesso, sem mudanças no backend.

- [x] Refatorar `LocationDetails` e `LocationForm` para o painel “Detalhes do local”, mostrando nome, tipo, local superior, ordem e quantidade real de filhos derivada da árvore. Manter edição de nome/ordem, cancelamento, estado de envio e erros; não apresentar `id` técnico como “Identificação”.

Feito: o painel de detalhes e o formulário de edição foram migrados para o design escuro em Tailwind, exibindo somente nome, tipo, local superior, ordem e a contagem real de filhos. A edição preserva cancelamento, envio, validações e revalidação da árvore, sem expor o `id` técnico.

- [x] Incorporar a visualização e o vínculo de compradores ao detalhe de locais do tipo `UNIDADE`, adaptando `UnitBuyerLink` ao novo design. Preservar busca por nome/e-mail, vínculo por usuário real, estados vazio/carregando/erro/sucesso e ocultar completamente essa área para outros tipos de local.

Feito: compradores vinculados e o formulário de vínculo foram reunidos no painel de detalhes da unidade, com busca por nome/e-mail e seleção de usuário real. Os estados de carregamento, vazio, erro e sucesso foram adaptados ao tema escuro, e a seção permanece ausente nos demais tipos de local.

- [x] Remover dependências visuais de Bootstrap dos componentes refatorados e migrar `StructureManagementPage.css`, `LocationDetails.css` e `StructureTree.css` para Tailwind/classes globais `ds-*`; excluir cada arquivo somente após confirmar que não possui consumidor restante.

Feito: os componentes da estrutura deixaram de usar wrappers e classes visuais do Bootstrap e agora utilizam Tailwind com os utilitários globais `ds-*`. Os três CSS locais foram excluídos após a confirmação de que não restavam imports ou consumidores.

- [ ] Atualizar os testes da rota e dos componentes para cobrir seleção por clique e URL, busca, expansão, criação dos três níveis, edição, compradores por unidade, ausência de filhos, parâmetro inválido e layout acessível; executar os testes relevantes, `pnpm --filter web lint` e `pnpm --filter web build` antes de concluir.

### Pendências de backend validadas

Estas pendências não bloqueiam a refatoração acima. Elas são necessárias apenas para habilitar integralmente elementos ou ações que a referência sugere e não devem ser simuladas no front.

- [ ] Definir com produto e persistir uma `identificacao` de negócio para cada local, distinta do `id` técnico e da `ordem`, caso a coluna “Identificação” da referência deva ser mantida. Isso exige migration, modelo, schemas, rotas e contrato compartilhado.
- [ ] Expor uma rota autenticada para mover um local/reordenar a hierarquia caso essa ação entre no menu contextual. O domínio possui `mover_local`, mas não há endpoint HTTP nem integração no front.
- [ ] Definir regra e endpoint para excluir ou arquivar locais com segurança, considerando filhos, progressos e vínculos existentes, antes de disponibilizar essa ação no menu de reticências.
- [ ] Disponibilizar desvinculação de comprador e, preferencialmente, retornar dados de exibição do comprador no endpoint da unidade; hoje existem somente listagem dos IDs e criação idempotente do vínculo, obrigando o front a combinar a resposta com a listagem geral de usuários.

### Acceptance criteria

- A área de estrutura apresenta alta semelhança com a referência em hierarquia, densidade, tipografia, cores, bordas e composição dos três painéis, sem duplicar o shell da obra.
- Selecionar um item na árvore ou na lista atualiza árvore, lista e detalhes, registra `localId` na URL e restaura a seleção ao abrir um link compartilhado.
- A busca filtra o nível atual; expansão/recolhimento e estados vazio ou inválido permanecem funcionais.
- Criação de torre/bloco, pavimento e unidade, edição de nome/ordem e vínculo/listagem de compradores continuam usando as APIs existentes e revalidam os dados exibidos.
- A interface não usa valores demonstrativos, não apresenta ID técnico como identificação de negócio e não oferece exclusão, movimentação ou desvinculação sem backend correspondente.
- No mobile, os painéis ficam em ordem de leitura lógica e não produzem overflow horizontal; em desktop, o conteúdo usa a largura disponível dentro do container central do shell.
- Os componentes refatorados não importam Bootstrap nem os arquivos CSS locais removidos, e lint, build e testes relevantes passam ao final.




-- utilze a referencia de design
-- utilize a referencia de codigo, adapatando ao sistema com grau de simillaridade alto
-- utilize Sctructpage como  referencia também, como as funções de visualizar os usuarios das unidades já prontas


Código de referencia react+tailwind css


```
"use client";

import React from "react";

function EmpreendimentoEstrutura() {
  return (
    <div className="flex h-full w-full items-start bg-canvas">
      <aside className="flex w-52 flex-none flex-col items-start self-stretch border-r border-solid border-border-muted bg-surface mobile:hidden">
        <div className="flex w-full items-center gap-3 border-b border-solid border-border-muted px-4 py-4">
          <svg
            className="text-body-md font-body-md text-default-font"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 21V3h10v18m0-12h6v12M2 21h20M7 7h4m-4 4h4m-4 4h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeOpacity="1"
            />
          </svg>
          <span className="text-label-md font-label-md text-foreground-strong uppercase">
            CONSTRUCTO
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-1 px-2 py-4 grow">
          <span className="w-full text-overline font-overline text-foreground-muted px-3 pb-2 uppercase">
            MENU PRINCIPAL
          </span>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-hover">
            <svg
              className="text-body-md font-body-md text-foreground-muted"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                d="m12 3-9 7v11h6v-6h6v6h6V10z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <span className="text-label-md font-label-md text-default-font">
              Home
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-hover">
            <svg
              className="text-body-md font-body-md text-foreground-muted"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <ellipse
                cx="9"
                cy="8"
                rx="4"
                ry="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
              <path
                d="M2 21c0-4 3-6 7-6s7 2 7 6m0-17a4 4 0 0 1 0 8m6 9c0-3-2-5-4-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <span className="text-label-md font-label-md text-default-font">
              Usuários
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md bg-surface-hover px-3 py-2 relative">
            <div className="flex w-[3px] flex-none items-start rounded-full bg-accent absolute left-0 top-1 bottom-1" />
            <svg
              className="text-body-md font-body-md text-default-font"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 21V3h10v18m0-12h6v12M2 21h20M7 7h4m-4 4h4m-4 4h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <span className="text-label-md font-label-md text-foreground-strong">
              Empreendimentos
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-hover">
            <svg
              className="text-body-md font-body-md text-foreground-muted"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 2h9l5 5v15H6zm8 0v6h6M9 13h8m-8 4h8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <span className="text-label-md font-label-md text-default-font">
              Contratos
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-hover">
            <svg
              className="text-body-md font-body-md text-foreground-muted"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v16h16M8 16v-6m4 6V6m4 10v-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <span className="text-label-md font-label-md text-default-font">
              Medições
            </span>
          </div>
        </div>
        <div className="flex w-full items-center justify-between border-t border-solid border-border-muted px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-2 w-2 flex-none items-start rounded-full bg-success-700" />
            <span className="text-code-sm font-code-sm text-foreground-muted">
              v2.4.0-sys
            </span>
          </div>
          <svg
            className="text-body-md font-body-md text-foreground-muted"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              ry="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeOpacity="1"
            />
            <path
              d="m7 9 3 3-3 3m5 0h5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeOpacity="1"
            />
          </svg>
        </div>
      </aside>
      <div className="flex min-w-[0px] flex-col items-start self-stretch grow">
        <header className="flex w-full items-center justify-between border-b border-solid border-border-muted bg-surface px-4 py-2.5 gap-4">
          <div className="flex h-8 w-72 flex-none items-center gap-2 rounded-md border border-solid border-border-control bg-canvas px-3 focus-within:border-accent mobile:w-auto mobile:focus-within:border-accent mobile:grow">
            <svg
              className="text-body-sm font-body-sm text-foreground-muted"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <ellipse
                cx="11"
                cy="11"
                rx="7"
                ry="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
              <path
                d="m20 20-4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <input
              className="w-44 flex-none text-body-sm font-body-sm text-default-font outline-none placeholder:text-foreground-muted grow"
              placeholder="Buscar obras, contratos ou medições..."
              value=""
              type="search"
            />
          </div>
          <div className="flex items-center gap-4">
            <svg
              className="text-body-md font-body-md text-default-font"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zm4 5h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <svg
              className="text-body-md font-body-md text-default-font"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <ellipse
                cx="12"
                cy="12"
                rx="9"
                ry="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
              <path
                d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
              <ellipse
                cx="12"
                cy="17"
                rx="1.2"
                ry="1.2"
                fill="currentColor"
                fillOpacity="1"
              />
            </svg>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mobile:hidden">
                <span className="text-label-md font-label-md text-foreground-strong">
                  Marina Albuquerque
                </span>
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  Engenheira Chefe
                </span>
              </div>
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-ref-primary">
                <svg
                  className="text-body-md font-body-md text-brand-200"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <ellipse
                    cx="12"
                    cy="8"
                    rx="4"
                    ry="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                  <path
                    d="M4 21c0-4 4-6 8-6s8 2 8 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </header>
        <main className="flex w-full flex-col items-start gap-4 px-5 pt-3 pb-6 mobile:px-3">
          <div className="flex items-center gap-2">
            <svg
              className="text-body-sm font-body-sm text-foreground-muted"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 21V3h10v18m0-12h6v12M2 21h20M7 7h4m-4 4h4m-4 4h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <span className="text-body-sm font-body-sm text-foreground-muted">
              Empreendimentos
            </span>
            <span className="text-body-sm font-body-sm text-foreground-muted">
              /
            </span>
            <span className="text-label-sm font-label-sm text-foreground-strong">
              Horizonte Corporate
            </span>
          </div>
          <div className="flex w-full items-center justify-between rounded-lg border border-solid border-border-card bg-surface px-3 py-3 gap-4 mobile:flex-col mobile:items-start">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-hover">
                <svg
                  className="text-headline-lg font-headline-lg text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="1"
                    ry="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                  <path
                    d="M12 4v16M6 9h3m-3 4h3m6-4h3m-3 4h3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-headline-xl font-headline-xl text-foreground-strong mobile:text-headline-xl-mobile mobile:font-headline-xl-mobile">
                    Horizonte Corporate
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-accent" />
                    <span className="text-label-sm font-label-sm text-accent">
                      Em andamento
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <svg
                    className="text-body-sm font-body-sm text-foreground-muted"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeOpacity="1"
                    />
                    <ellipse
                      cx="12"
                      cy="10"
                      rx="2.5"
                      ry="2.5"
                      fill="currentColor"
                      fillOpacity="1"
                    />
                  </svg>
                  <span className="text-body-sm font-body-sm text-default-font">
                    Palmas / TO
                  </span>
                  <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                  <svg
                    className="text-body-sm font-body-sm text-foreground-muted"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <ellipse
                      cx="12"
                      cy="12"
                      rx="9"
                      ry="9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeOpacity="1"
                    />
                    <path
                      d="M12 7v5l3 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeOpacity="1"
                    />
                  </svg>
                  <span className="text-body-sm font-body-sm text-default-font">
                    Atualizado em 11 out. 2026
                  </span>
                  <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                  <span className="text-code-sm font-code-sm text-foreground-muted">
                    COD-HZ80-TO
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mobile:w-full mobile:flex-none">
              <div className="flex h-8 items-center gap-2 rounded-md px-3 hover:bg-surface-hover">
                <svg
                  className="text-body-sm font-body-sm text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 3v12m-5-5 5 5 5-5M4 20h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
                <span className="text-label-sm font-label-sm text-default-font">
                  Exportar
                </span>
              </div>
              <div className="flex h-8 items-center gap-2 rounded-md bg-ref-primary px-3 hover:bg-brand-900 mobile:justify-center mobile:hover:bg-brand-900 mobile:grow">
                <svg
                  className="text-body-sm font-body-sm text-brand-50"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="1"
                    ry="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                  <path
                    d="M3 10h18M8 3v4m8-4v4m-8 7h2m4 0h2m-8 3h2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
                <span className="text-label-sm font-label-sm text-brand-50">
                  Nova Medição
                </span>
              </div>
            </div>
          </div>
          <nav className="flex w-full items-center gap-1 rounded-lg border border-solid border-border-muted bg-surface px-1 py-1 overflow-x-auto">
            <div className="flex h-8 items-center gap-2 rounded-md px-3 hover:bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-foreground-muted"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="3"
                  ry="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Visualizar
              </span>
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md px-3 hover:bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-foreground-muted"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 20h4L19 9l-4-4L4 16zm9-13 4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Editar
              </span>
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md bg-surface-hover px-3 shadow-[inset_0px_-2px_0px_0px_#58a6ff] text-accent">
              <svg
                className="text-body-sm font-body-sm text-foreground-strong"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="6"
                  rx="0"
                  ry="0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
                <rect
                  x="14"
                  y="9"
                  width="7"
                  height="6"
                  rx="0"
                  ry="0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
                <rect
                  x="14"
                  y="17"
                  width="7"
                  height="5"
                  rx="0"
                  ry="0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
                <path
                  d="M6.5 9v10H14m-7.5-7H14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-foreground-strong">
                Estrutura
              </span>
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md px-3 hover:bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-foreground-muted"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 5h12l6 7-6 7H3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Taxonomia
              </span>
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md px-3 hover:bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-foreground-muted"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 2h9l5 5v15H6zm8 0v6h6M9 13h8m-8 4h8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Contratos
              </span>
              <span className="text-badge-compact font-badge-compact text-default-font rounded-full bg-neutral-300 px-1.5">
                4
              </span>
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md px-3 hover:bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-foreground-muted"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="1"
                  ry="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
                <path
                  d="M8 16v-4m4 4V8m4 8v-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Medições
              </span>
              <span className="text-badge-compact font-badge-compact text-default-font rounded-full bg-neutral-300 px-1.5">
                18
              </span>
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md px-3 hover:bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-foreground-muted"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 6h7l2 2h9v12H3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Documentos
              </span>
            </div>
          </nav>
          <div className="flex w-full flex-col items-start gap-1 pt-1">
            <h2 className="text-headline-md font-headline-md text-foreground-strong">
              Estrutura do empreendimento
            </h2>
            <span className="text-body-md font-body-md text-foreground-muted">
              Organize blocos, pavimentos e unidades.
            </span>
          </div>
          <div className="flex w-full items-start gap-4 mobile:flex-col">
            <section className="flex w-52 flex-none flex-col items-start gap-2 rounded-lg border border-solid border-border-card bg-surface px-3 py-3 mobile:w-full mobile:flex-none">
              <div className="flex w-full items-center justify-between border-b border-solid border-border-muted pb-2">
                <span className="text-label-md font-label-md text-foreground-strong">
                  Hierarquia
                </span>
                <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-foreground-muted hover:bg-surface-hover">
                  <svg
                    className="text-body-sm font-body-sm text-foreground-muted"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m7 20 5-5 5 5M7 4l5 5 5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-0.5">
                <div className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 hover:bg-surface-hover">
                  <svg
                    className="text-body-sm font-body-sm text-foreground-muted"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                  <svg
                    className="text-body-sm font-body-sm text-default-font"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 21V3h10v18m0-12h6v12M2 21h20M7 7h4m-4 4h4m-4 4h4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                  <span className="text-label-sm font-label-sm text-foreground-strong">
                    Edifício A
                  </span>
                </div>
                <div className="flex w-full flex-col items-start gap-0.5 pl-3">
                  <div className="flex w-full flex-col items-start gap-0.5 border-l border-solid border-border-muted pl-2">
                    <div className="flex w-full items-center gap-1.5 rounded-md bg-surface-selected px-2 py-1.5 relative">
                      <div className="flex w-0.5 flex-none items-start rounded-full bg-accent absolute left-0 top-1 bottom-1" />
                      <svg
                        className="text-body-sm font-body-sm text-accent"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m6 9 6 6 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                      </svg>
                      <svg
                        className="text-body-sm font-body-sm text-accent"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m12 3 9 5-9 5-9-5z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                        <path
                          d="m3 13 9 5 9-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                      </svg>
                      <span className="text-label-sm font-label-sm text-accent">
                        1º Pavimento
                      </span>
                    </div>
                    <div className="flex w-full flex-col items-start gap-0.5 pl-4">
                      <div className="flex w-full flex-col items-start gap-0.5 border-l border-solid border-border-muted pl-2">
                        <div className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-hover">
                          <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                          <span className="text-body-sm font-body-sm text-default-font">
                            Unidade 101
                          </span>
                        </div>
                        <div className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-hover">
                          <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                          <span className="text-body-sm font-body-sm text-default-font">
                            Unidade 102
                          </span>
                        </div>
                        <div className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-hover">
                          <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                          <span className="text-body-sm font-body-sm text-default-font">
                            Unidade 103
                          </span>
                        </div>
                        <div className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-hover">
                          <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                          <span className="text-body-sm font-body-sm text-default-font">
                            Unidade 104
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-surface-hover">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m9 6 6 6-6 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                      </svg>
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m12 3 9 5-9 5-9-5z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                        <path
                          d="m3 13 9 5 9-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                      </svg>
                      <span className="text-label-sm font-label-sm text-default-font">
                        2º Pavimento
                      </span>
                    </div>
                    <div className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-surface-hover">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m9 6 6 6-6 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                      </svg>
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m12 3 9 5-9 5-9-5z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                        <path
                          d="m3 13 9 5 9-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="1"
                        />
                      </svg>
                      <span className="text-label-sm font-label-sm text-default-font">
                        3º Pavimento
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="flex min-w-[0px] flex-col items-start gap-3 rounded-lg border border-solid border-border-card bg-surface px-3 py-3 grow mobile:w-full mobile:min-w-0 mobile:flex-none">
              <div className="flex h-8 w-full flex-none items-center gap-2 rounded-md border border-solid border-border-control bg-surface-muted px-2">
                <svg
                  className="text-body-sm font-body-sm text-foreground-muted"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <ellipse
                    cx="11"
                    cy="11"
                    rx="7"
                    ry="7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                  <path
                    d="m20 20-4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                </svg>
                <input
                  className="w-44 flex-none text-body-sm font-body-sm text-default-font outline-none placeholder:text-[#a3a3a3] grow"
                  placeholder="Buscar local..."
                  value=""
                  type="search"
                />
              </div>
              <div className="flex w-full flex-wrap items-center gap-2">
                <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3 hover:bg-neutral-300">
                  <svg
                    className="text-body-sm font-body-sm text-default-font"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                  <span className="text-label-sm font-label-sm text-default-font">
                    Expandir tudo
                  </span>
                </div>
                <div className="flex h-8 items-center gap-2 rounded-md bg-brand-primary px-3 hover:bg-brand-primary-hover">
                  <svg
                    className="text-body-sm font-body-sm text-white"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 5v14m-7-7h14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                  <span className="text-label-sm font-label-sm text-white">
                    Adicionar unidade
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-label-sm font-label-sm text-default-font">
                    Edifício A
                  </span>
                  <span className="text-label-sm font-label-sm text-foreground-muted">
                    /
                  </span>
                  <span className="text-label-sm font-label-sm text-accent">
                    1º Pavimento
                  </span>
                </div>
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  4 unidades
                </span>
              </div>
              <div className="flex w-full flex-col items-start rounded-md border border-solid border-border-muted overflow-x-auto">
                <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted bg-surface-muted px-3 py-2">
                  <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                  <span className="min-w-[0px] text-overline font-overline text-foreground-muted grow shrink basis-0 uppercase">
                    NOME
                  </span>
                  <span className="w-16 flex-none text-overline font-overline text-foreground-muted uppercase">
                    TIPO
                  </span>
                  <span className="w-24 flex-none text-overline font-overline text-foreground-muted uppercase">
                    IDENTIFICAÇÃO
                  </span>
                  <span className="w-10 flex-none text-overline font-overline text-foreground-muted text-right uppercase">
                    AÇÕES
                  </span>
                </div>
                <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted px-3 py-2.5 hover:bg-surface-hover">
                  <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                  <span className="min-w-[0px] whitespace-nowrap text-label-md font-label-md text-accent grow shrink basis-0">
                    Unidade 101
                  </span>
                  <span className="w-16 flex-none text-body-sm font-body-sm text-foreground-muted">
                    Unidade
                  </span>
                  <span className="w-24 flex-none text-code-sm font-code-sm text-default-font">
                    101
                  </span>
                  <div className="flex w-10 flex-none items-center justify-end">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md hover:bg-neutral-300">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <ellipse
                          cx="5"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="12"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="19"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted px-3 py-2.5 hover:bg-surface-hover">
                  <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                  <span className="min-w-[0px] whitespace-nowrap text-label-md font-label-md text-accent grow shrink basis-0">
                    Unidade 102
                  </span>
                  <span className="w-16 flex-none text-body-sm font-body-sm text-foreground-muted">
                    Unidade
                  </span>
                  <span className="w-24 flex-none text-code-sm font-code-sm text-default-font">
                    102
                  </span>
                  <div className="flex w-10 flex-none items-center justify-end">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md hover:bg-neutral-300">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <ellipse
                          cx="5"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="12"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="19"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted px-3 py-2.5 hover:bg-surface-hover">
                  <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                  <span className="min-w-[0px] whitespace-nowrap text-label-md font-label-md text-accent grow shrink basis-0">
                    Unidade 103
                  </span>
                  <span className="w-16 flex-none text-body-sm font-body-sm text-foreground-muted">
                    Unidade
                  </span>
                  <span className="w-24 flex-none text-code-sm font-code-sm text-default-font">
                    103
                  </span>
                  <div className="flex w-10 flex-none items-center justify-end">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md hover:bg-neutral-300">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <ellipse
                          cx="5"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="12"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="19"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2 px-3 py-2.5 hover:bg-surface-hover">
                  <div className="flex h-3.5 w-3.5 flex-none items-start rounded-sm border border-solid border-border-control bg-surface-muted" />
                  <span className="min-w-[0px] whitespace-nowrap text-label-md font-label-md text-accent grow shrink basis-0">
                    Unidade 104
                  </span>
                  <span className="w-16 flex-none text-body-sm font-body-sm text-foreground-muted">
                    Unidade
                  </span>
                  <span className="w-24 flex-none text-code-sm font-code-sm text-default-font">
                    104
                  </span>
                  <div className="flex w-10 flex-none items-center justify-end">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md hover:bg-neutral-300">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <ellipse
                          cx="5"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="12"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                        <ellipse
                          cx="19"
                          cy="12"
                          rx="1.6"
                          ry="1.6"
                          fill="currentColor"
                          fillOpacity="1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center gap-2">
                <svg
                  className="text-body-sm font-body-sm text-foreground-muted"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <ellipse
                    cx="12"
                    cy="12"
                    rx="9"
                    ry="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                  <path
                    d="M12 11v6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                  <ellipse
                    cx="12"
                    cy="7.5"
                    rx="1.2"
                    ry="1.2"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  Selecione uma unidade para consultar seus detalhes.
                </span>
              </div>
            </section>
            <section className="flex w-56 flex-none flex-col items-start gap-3 rounded-lg border border-solid border-border-card bg-surface px-3 py-3 mobile:w-full mobile:flex-none">
              <div className="flex w-full items-center border-b border-solid border-border-muted pb-2">
                <span className="text-label-md font-label-md text-foreground-strong">
                  Detalhes do local
                </span>
              </div>
              <div className="flex w-full items-center gap-3 rounded-md border border-solid border-border-muted bg-surface-muted px-3 py-3">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-hover">
                  <svg
                    className="text-body-md font-body-md text-default-font"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m12 3 9 5-9 5-9-5z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                    <path
                      d="m3 13 9 5 9-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-headline-sm font-headline-sm text-foreground-strong">
                    1º Pavimento
                  </span>
                  <span className="text-badge-compact font-badge-compact text-default-font rounded-default bg-neutral-300 px-1.5 py-0.5">
                    Pavimento
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start">
                <div className="flex w-full items-center justify-between border-b border-solid border-border-muted py-2">
                  <span className="text-body-sm font-body-sm text-foreground-muted">
                    Local superior
                  </span>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="text-body-sm font-body-sm text-default-font"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 21V3h10v18m0-12h6v12M2 21h20M7 7h4m-4 4h4m-4 4h4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                      />
                    </svg>
                    <span className="text-label-sm font-label-sm text-foreground-strong">
                      Edifício A
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between border-b border-solid border-border-muted py-2">
                  <span className="text-body-sm font-body-sm text-foreground-muted">
                    Identificação
                  </span>
                  <span className="text-code-sm font-code-sm text-foreground-strong">
                    1
                  </span>
                </div>
                <div className="flex w-full items-center justify-between border-b border-solid border-border-muted py-2">
                  <span className="text-body-sm font-body-sm text-foreground-muted">
                    Unidades
                  </span>
                  <span className="text-label-sm font-label-sm text-foreground-strong">
                    4
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center gap-2">
                <div className="flex h-8 items-center justify-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3 grow hover:bg-neutral-300">
                  <svg
                    className="text-body-sm font-body-sm text-default-font"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 20h4L19 9l-4-4L4 16zm9-13 4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                  <span className="text-label-sm font-label-sm text-default-font">
                    Editar local
                  </span>
                </div>
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-hover hover:bg-neutral-300">
                  <svg
                    className="text-body-sm font-body-sm text-default-font"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <ellipse
                      cx="5"
                      cy="12"
                      rx="1.6"
                      ry="1.6"
                      fill="currentColor"
                      fillOpacity="1"
                    />
                    <ellipse
                      cx="12"
                      cy="12"
                      rx="1.6"
                      ry="1.6"
                      fill="currentColor"
                      fillOpacity="1"
                    />
                    <ellipse
                      cx="19"
                      cy="12"
                      rx="1.6"
                      ry="1.6"
                      fill="currentColor"
                      fillOpacity="1"
                    />
                  </svg>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmpreendimentoEstrutura;

```
