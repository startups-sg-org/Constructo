## {FRONT} - update front-end geral com tailwind e tela de lista empreendimentos


***ações**

- [x] Ler o código no tópico `CÓDIGO`.

Feito: o layout de referência foi comparado com a estrutura existente em `AdminLayout`, `Sidebar`, `Navbar`, `LayoutEmpreendimentos` e `ListaEmpreendimentos`; também foram verificados os tokens atuais em `src/index.css` e a convenção em `docs/tailwind-convention.md`.

- [x] Usar `create-plan` para planejar como quebrar o código em partes e implementá-lo nos componentes já existentes.

- [ ] Usar o design system em `web/docs/design-system.md` para planejar o root CSS do Tailwind.

Plano registrado:

## Plan

O layout de referência será incorporado progressivamente à aplicação existente, preservando rotas, loaders, ações, acessibilidade e comportamento responsivo. A implementação usará Tailwind CSS e os componentes compartilhados atuais, mantendo CSS legado apenas onde ainda houver dependências não migradas.

### Scope

- In: shell administrativo, navegação lateral, cabeçalho, tela de lista de empreendimentos, tokens visuais e validação responsiva.
- Out: mudanças de API, regras de negócio, rotas, substituição obrigatória de `bootstrap-icons` e redesign das telas não relacionadas.

### Action items

- [x] Mapear os tokens do design de referência `web/docs/design-system.md` e aplicar em `src/index.css` e validar nomes/classes disponíveis no Tailwind.

Feito: os tokens de superfície, borda, foreground, accent, status, tipografia e tamanhos do design system foram adicionados ao `@theme` de `src/index.css`. As classes da referência agora possuem aliases Tailwind; a variante `mobile:` não é nativa e deverá ser substituída por breakpoints responsivos padrão na próxima etapa.

- [x] Migrar `AdminLayout`, `Sidebar` e `Navbar` para classes Tailwind, preservando navegação ativa, colapso e comportamento mobile.

Feito: `AdminLayout`, `Sidebar`, `SidebarItem` e `Navbar` passaram a usar classes Tailwind baseadas nos tokens do design system; navegação ativa, recolhimento, foco visível e layout mobile foram preservados. Os imports dos CSS específicos desses componentes foram removidos.

Refeito para alta fidelidade: o shell foi alinhado à referência com sidebar de 240 px segmentada em marca/menu/ambiente, densidade e estados ativos equivalentes, navbar compacta com contexto da empresa, notificações, divisor e conta do usuário, além de conteúdo com espaçamento operacional de 16 px. `UserMenu` e `AdminContent` também foram ajustados por integrarem visualmente esses componentes; backend, loaders, rotas e autenticação não foram alterados.

Ajuste adicional: ícones, marca e rótulos da sidebar e do `UserMenu` foram ampliados em aproximadamente 40%, com espaçamentos e largura do dropdown recalibrados para evitar cortes.

Manutenção: as classes Tailwind do shell foram organizadas em constantes por componente, e a composição condicional foi centralizada no helper `cn`, sem mudanças visuais ou de comportamento.

Estilos globais: padrões repetidos de foco, controles de ícone, itens de menu, painéis, campos escuros, links, tabelas e status foram extraídos para classes `ds-*` em `src/index.css`; as regras de reutilização também foram documentadas.

- [x] Refatorar `LayoutEmpreendimentos` e `ListaEmpreendimentos` para o layout de referência sem alterar loaders, filtros, ordenação ou links.

Feito: a lista e o layout de detalhes passaram a usar as superfícies, bordas, tipografia, estados, controles compactos e navegação por abas do tema escuro em Tailwind. Loaders, busca, filtro, ordenação, CTA e destinos dos links foram preservados; TypeScript e build passaram, e os 30 testes de rota não relacionados à estrutura física continuam aprovados.
- [ ] Ajustar componentes compartilhados e estilos locais somente onde necessário para eliminar conflitos entre CSS legado e Tailwind.
- [ ] Verificar estados vazio, carregamento, erro, foco visível, acessibilidade e responsividade desktop/mobile.
- [ ] Executar `pnpm --filter web lint`, `pnpm --filter web build` e os testes relevantes antes de concluir.

### Open questions

- O `bootstrap-icons` continuará temporariamente ou será substituído por uma biblioteca definida? por enquanto pode utilizar o bootstrap-icons desde que não quebre com o código em tailwind

- A tela de lista deve reproduzir exatamente o tema escuro da referência ou adaptar os tokens ao tema visual atual do produto? deve reproduzir exatamente o tema definido em `web/docs/design-system.md`




## CÓDIGO: 

```
    "use client";

import React from "react";

function Empreendimentos() {
  return (
    <div className="flex h-full w-full items-start bg-canvas">
      <aside className="flex w-60 flex-none flex-col items-start self-stretch border-r border-solid border-border-muted bg-surface mobile:hidden">
        <div className="flex w-full items-center gap-3 border-b border-solid border-border-muted px-4 py-4">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-warning-700 bg-warning-50">
            <span className="text-headline-sm font-headline-sm text-warning-700">
              C
            </span>
          </div>
          <span className="text-title-project font-title-project text-foreground-strong">
            Constructo
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
          <div className="flex w-full items-center gap-3 rounded-md bg-surface-selected px-3 py-2 relative">
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
              <rect
                x="4"
                y="10"
                width="3"
                height="10"
                rx="0"
                ry="0"
                fill="currentColor"
                fillOpacity="1"
              />
              <rect
                x="10.5"
                y="4"
                width="3"
                height="16"
                rx="0"
                ry="0"
                fill="currentColor"
                fillOpacity="1"
              />
              <rect
                x="17"
                y="13"
                width="3"
                height="7"
                rx="0"
                ry="0"
                fill="currentColor"
                fillOpacity="1"
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
              v2.4.8-prod
            </span>
          </div>
          <svg
            className="text-body-md font-body-md text-foreground-muted"
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
        </div>
      </aside>
      <div className="flex flex-col items-start self-stretch grow">
        <header className="flex w-full items-center justify-between border-b border-solid border-border-muted bg-surface px-4 py-3">
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
            <span className="text-body-sm font-body-sm text-default-font">
              Construtora Alpha S.A.
            </span>
          </div>
          <div className="flex items-center gap-5">
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
            <div className="flex h-6 w-px flex-none items-start bg-neutral-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-primary">
                <span className="text-label-sm font-label-sm text-white">
                  MA
                </span>
              </div>
              <div className="flex flex-col items-start mobile:hidden">
                <span className="w-full text-label-md font-label-md text-default-font">
                  Marina Albuquerque
                </span>
                <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                  Minha conta
                </span>
              </div>
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
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
            </div>
          </div>
        </header>
        <main className="flex w-full flex-col items-start gap-4 px-4 pt-2 pb-6">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-code-sm font-code-sm text-foreground-muted">
                constructo /
              </span>
              <span className="text-code-sm font-code-sm text-default-font">
                empreendimentos
              </span>
              <span className="text-code-sm font-code-sm text-foreground-muted rounded-sm border border-solid border-border-control bg-surface-muted px-1.5">
                live-sync
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-done-fg" />
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  1 Concluído
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-progress-fg" />
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  1 Em andamento
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-planned-fg" />
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  1 Planejado
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-inactive-fg" />
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  1 Inativo
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full items-end justify-between border-b border-solid border-border-muted pb-4 gap-4 mobile:flex-col mobile:items-start">
            <div className="flex flex-col items-start gap-1">
              <h1 className="w-full text-headline-xl font-headline-xl text-foreground-strong mobile:text-headline-xl-mobile mobile:font-headline-xl-mobile">
                Empreendimentos
              </h1>
              <span className="w-full text-body-md font-body-md text-foreground-muted">
                Gerencie suas obras em um só lugar com precisão operacional.
              </span>
            </div>
            <div className="flex items-center gap-2 mobile:w-full mobile:flex-none">
              <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3 hover:bg-neutral-300">
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
              <div className="flex h-8 items-center gap-2 rounded-md bg-brand-primary px-3 hover:bg-brand-primary-hover mobile:justify-center mobile:hover:bg-brand-primary-hover mobile:grow">
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
                    strokeWidth="2.5"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
                <span className="text-label-sm font-label-sm text-white">
                  Criar empreendimento
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 mobile:flex-wrap">
            <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-canvas px-3 grow focus-within:border-accent mobile:grow mobile:shrink-0 mobile:basis-0">
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
                className="w-44 flex-none text-body-md font-body-md text-default-font outline-none placeholder:text-foreground-muted grow"
                placeholder="Buscar empreendimento..."
                value=""
                type="search"
              />
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3">
              <svg
                className="text-body-sm font-body-sm text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 6h16M7 12h10m-7 6h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Status
              </span>
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
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
            </div>
            <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3">
              <svg
                className="text-body-sm font-body-sm text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 7h16M4 12h11M4 17h6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-default-font">
                Ordenar
              </span>
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
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
            </div>
            <div className="flex h-8 items-center rounded-md border border-solid border-border-control bg-canvas">
              <div className="flex items-center self-stretch rounded-l-md bg-surface-hover px-2">
                <svg
                  className="text-body-sm font-body-sm text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 6h12M9 12h12M9 18h12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                  <ellipse
                    cx="4"
                    cy="6"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                  <ellipse
                    cx="4"
                    cy="12"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                  <ellipse
                    cx="4"
                    cy="18"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
              <div className="flex items-center self-stretch border-l border-solid border-border-control px-2">
                <svg
                  className="text-body-sm font-body-sm text-foreground-muted"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 6h18M3 12h18M3 18h18"
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
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-body-sm font-body-sm text-foreground-muted">
                4 empreendimentos encontrados
              </span>
              <div className="flex h-3 w-px flex-none items-start bg-neutral-border" />
              <div className="flex items-center gap-1.5 rounded-sm border border-solid border-border-control bg-surface-muted px-1.5 py-0.5">
                <span className="text-code-sm font-code-sm text-default-font">
                  Status: Todos
                </span>
                <svg
                  className="text-body-sm font-body-sm text-foreground-muted"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m6 6 12 12m0-12L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-overline font-overline text-foreground-muted pr-1 uppercase">
                DEMONSTRAÇÃO:
              </span>
              <span className="text-label-sm font-label-sm text-foreground-strong rounded-sm border border-solid border-border-control bg-surface-hover px-1.5 py-0.5">
                Padrão
              </span>
              <span className="text-label-sm font-label-sm text-foreground-muted rounded-sm border border-solid border-border-muted px-1.5 py-0.5">
                Carregando
              </span>
              <span className="text-label-sm font-label-sm text-foreground-muted rounded-sm border border-solid border-border-muted px-1.5 py-0.5">
                Vazio
              </span>
            </div>
          </div>
          <div className="flex w-full items-start gap-2 mobile:flex-col">
            <section className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-lg border border-solid border-border-card bg-surface">
              <div className="flex w-full items-center justify-between border-b border-solid border-border-muted bg-surface-muted px-3 py-2.5">
                <span className="text-overline font-overline text-foreground-muted uppercase">
                  LISTA DE EMPREENDIMENTOS
                </span>
                <span className="text-code-sm font-code-sm text-foreground-muted">
                  4 registros
                </span>
              </div>
              <div className="flex w-full items-start gap-3 border-b border-solid border-border-muted px-3 py-3 hover:bg-surface-hover">
                <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-muted">
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
                </div>
                <div className="flex flex-col items-start gap-1 grow">
                  <span className="w-full text-title-project font-title-project text-foreground-strong">
                    Estação Norte
                  </span>
                  <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                    Projeto em revisão de viabilidade.
                  </span>
                  <div className="flex w-full items-center gap-2">
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
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      Araguaína / TO
                    </span>
                    <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      11 out. 2026
                    </span>
                  </div>
                </div>
                <div className="flex h-5 items-center gap-1.5 rounded-default border border-solid border-neutral-400 bg-status-inactive-bg px-2">
                  <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-inactive-fg" />
                  <span className="text-badge-compact font-badge-compact text-status-inactive-fg">
                    Inativo
                  </span>
                </div>
              </div>
              <div className="flex w-full items-start gap-3 border-b border-solid border-border-muted px-3 py-3 hover:bg-surface-hover">
                <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-muted">
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
                </div>
                <div className="flex flex-col items-start gap-1 grow">
                  <span className="w-full text-title-project font-title-project text-foreground-strong">
                    Vila Cerrado
                  </span>
                  <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                    Empreendimento residencial entregue.
                  </span>
                  <div className="flex w-full items-center gap-2">
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
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      Gurupi / TO
                    </span>
                    <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      11 out. 2026
                    </span>
                  </div>
                </div>
                <div className="flex h-5 items-center gap-1.5 rounded-default border border-solid border-success-400 bg-status-done-bg px-2">
                  <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-done-fg" />
                  <span className="text-badge-compact font-badge-compact text-status-done-fg">
                    Concluído
                  </span>
                </div>
              </div>
              <div className="flex w-full items-start gap-3 border-b border-solid border-border-muted bg-surface-selected px-3 py-3">
                <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-muted">
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
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeOpacity="1"
                    />
                  </svg>
                </div>
                <div className="flex flex-col items-start gap-1 grow">
                  <div className="flex w-full items-center gap-2">
                    <span className="text-title-project font-title-project text-accent">
                      Horizonte Corporate
                    </span>
                    <span className="text-code-sm font-code-sm text-default-font rounded-sm border border-solid border-border-control bg-surface-muted px-1">
                      ATIVO
                    </span>
                  </div>
                  <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                    Edifício corporativo com lajes comerciais.
                  </span>
                  <div className="flex w-full items-center gap-2">
                    <svg
                      className="text-body-sm font-body-sm text-default-font"
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
                    <span className="text-label-sm font-label-sm text-default-font">
                      Palmas / TO
                    </span>
                    <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      11 out. 2026
                    </span>
                  </div>
                </div>
                <div className="flex h-5 items-center gap-1.5 rounded-default border border-solid border-warning-400 bg-status-progress-bg px-2">
                  <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-progress-fg" />
                  <span className="whitespace-nowrap text-badge-compact font-badge-compact text-status-progress-fg">
                    Em andamento
                  </span>
                </div>
              </div>
              <div className="flex w-full items-start gap-3 border-b border-solid border-border-muted px-3 py-3 hover:bg-surface-hover">
                <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-muted">
                  <svg
                    className="text-body-sm font-body-sm text-foreground-muted"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 21V9l5-3 5 3v12m0 0V11l4-2 4 2v10M2 21h20M6 13h4m-4 4h4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeOpacity="1"
                    />
                  </svg>
                </div>
                <div className="flex flex-col items-start gap-1 grow">
                  <span className="w-full text-title-project font-title-project text-foreground-strong">
                    Parque das Águas
                  </span>
                  <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                    Conjunto habitacional com dois blocos.
                  </span>
                  <div className="flex w-full items-center gap-2">
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
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      Araguaína / TO
                    </span>
                    <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      11 out. 2026
                    </span>
                  </div>
                </div>
                <div className="flex h-5 items-center gap-1.5 rounded-default border border-solid border-brand-400 bg-status-planned-bg px-2">
                  <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-planned-fg" />
                  <span className="text-badge-compact font-badge-compact text-status-planned-fg">
                    Planejado
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center justify-between px-3 py-3">
                <span className="text-body-sm font-body-sm text-foreground-muted">
                  Exibindo 1-4 de 4
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-label-sm font-label-sm text-neutral-500 rounded-default border border-solid border-border-muted px-1.5 py-0.5">
                    Anterior
                  </span>
                  <span className="text-label-sm font-label-sm text-foreground-strong rounded-default border border-solid border-default-font px-1.5 py-0.5">
                    1
                  </span>
                  <span className="text-label-sm font-label-sm text-neutral-500 rounded-default border border-solid border-border-muted px-1.5 py-0.5">
                    Próximo
                  </span>
                </div>
              </div>
            </section>
            <aside className="flex grow shrink-0 basis-0 flex-col items-start rounded-lg border border-solid border-border-card bg-surface">
              <div className="flex w-full items-center justify-between rounded-t-lg border-b border-solid border-border-muted bg-surface-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="text-body-md font-body-md text-default-font"
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
                  <span className="text-label-md font-label-md text-default-font">
                    Pré-visualização do Empreendimento
                  </span>
                </div>
                <span className="text-code-sm font-code-sm text-foreground-muted rounded-sm border border-solid border-border-control bg-surface px-1.5 py-0.5">
                  EMP-00107
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
                <div className="flex w-full items-start gap-3 border-b border-solid border-border-muted pb-4">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-muted">
                    <svg
                      className="text-headline-md font-headline-md text-default-font"
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
                  </div>
                  <div className="flex flex-col items-start gap-1 grow">
                    <span className="w-full text-headline-md font-headline-md text-foreground-strong">
                      Horizonte Corporate
                    </span>
                    <div className="flex w-full flex-wrap items-center gap-2">
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
                      <span className="text-label-sm font-label-sm text-default-font">
                        Palmas / TO
                      </span>
                      <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                      <span className="text-body-sm font-body-sm text-foreground-muted">
                        Atualizado em 11 out. 2026
                      </span>
                    </div>
                  </div>
                  <div className="flex h-5 items-center gap-1.5 rounded-default border border-solid border-warning-400 bg-status-progress-bg px-2">
                    <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-status-progress-fg" />
                    <span className="whitespace-nowrap text-badge-compact font-badge-compact text-status-progress-fg">
                      Em andamento
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start gap-2 border-b border-solid border-border-muted pb-4">
                  <span className="w-full text-overline font-overline text-foreground-muted uppercase">
                    DESCRIÇÃO DO EMPREENDIMENTO
                  </span>
                  <div className="flex w-full items-start rounded-md border border-solid border-border-control bg-surface-muted px-3 py-2.5">
                    <span className="self-stretch text-body-md font-body-md text-default-font">
                      Edifício corporativo com lajes comerciais.
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start gap-2 border-b border-solid border-border-muted pb-4">
                  <span className="w-full text-overline font-overline text-foreground-muted uppercase">
                    AÇÕES RÁPIDAS
                  </span>
                  <div className="w-full items-start gap-2 grid grid-cols-2 mobile:grid mobile:grid-cols-1">
                    <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-accent bg-status-planned-bg px-3">
                      <svg
                        className="text-body-sm font-body-sm text-accent"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M14 4h6v6m0-6-9 9m7 1v6H4V6h6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeOpacity="1"
                        />
                      </svg>
                      <span className="text-label-sm font-label-sm text-foreground-strong">
                        Abrir empreendimento
                      </span>
                    </div>
                    <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3 hover:bg-neutral-300">
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
                        Editar informações
                      </span>
                    </div>
                    <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3 hover:bg-neutral-300">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="8"
                          y="8"
                          width="12"
                          height="12"
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
                          d="M16 4H6a2 2 0 0 0-2 2v10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeOpacity="1"
                        />
                      </svg>
                      <span className="text-label-sm font-label-sm text-default-font">
                        Duplicar dados
                      </span>
                    </div>
                    <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-border-control bg-surface-hover px-3 hover:border-danger-border hover:bg-danger-bg">
                      <svg
                        className="text-body-sm font-body-sm text-danger"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="5"
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
                          d="M5 9v11h14V9m-9 4h4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeOpacity="1"
                        />
                      </svg>
                      <span className="text-label-sm font-label-sm text-default-font">
                        Arquivar obra
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start gap-2">
                  <span className="w-full text-overline font-overline text-foreground-muted uppercase">
                    DIRETRIZES &amp; MÓDULOS VINCULADOS
                  </span>
                  <div className="flex w-full items-start gap-3 rounded-md border border-solid border-border-control bg-surface-muted px-3 py-3">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-default bg-surface-hover">
                      <svg
                        className="text-body-sm font-body-sm text-accent"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m3 17 6-6 4 4 8-8m-6 0h6v6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeOpacity="1"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start gap-0.5 grow">
                      <span className="w-full text-label-md font-label-md text-foreground-strong">
                        Auditoria Ativa
                      </span>
                      <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                        Todas as alterações de status alimentam relatórios de
                        governança ESG e compliance.
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full items-start gap-3 rounded-md border border-solid border-border-control bg-surface-muted px-3 py-3">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-default bg-surface-hover">
                      <svg
                        className="text-body-sm font-body-sm text-warning-700"
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
                    </div>
                    <div className="flex flex-col items-start gap-0.5 grow">
                      <span className="w-full text-label-md font-label-md text-foreground-strong">
                        Estrutura EAP
                      </span>
                      <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                        Vincule pacotes de trabalho e marcos contratuais com
                        rastreio de medições em campo.
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full items-start gap-3 rounded-md border border-solid border-border-control bg-surface-muted px-3 py-3">
                    <div className="flex h-6 w-6 flex-none items-center justify-center rounded-default bg-surface-hover">
                      <svg
                        className="text-body-sm font-body-sm text-success-700"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M4 12a8 8 0 0 1 14-5.3m2 5.3a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeOpacity="1"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start gap-0.5 grow">
                      <span className="w-full text-label-md font-label-md text-foreground-strong">
                        Integração ERP
                      </span>
                      <span className="w-full text-body-sm font-body-sm text-foreground-muted">
                        Sincronização bidirecional em tempo real para ordens de
                        serviço e centros de custos.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Empreendimentos;

```
