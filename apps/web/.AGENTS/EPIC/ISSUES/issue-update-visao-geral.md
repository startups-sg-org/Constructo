## {FRONT} - Atualizar o shell individual da obra e a visão geral do empreendimento com Tailwind

### Ações de planejamento

- [x] Ler o código de referência e comparar sua composição com a implementação atual.

Feito: a referência foi decomposta em cabeçalho do empreendimento, navegação por áreas, identificação, resumo estrutural, avanço físico, macroetapas e atividade recente. Também foram revisados `LayoutEmpreendimentos`, `DetalhesEmpreendimento`, os loaders, services, contratos compartilhados, testes de rota e o design system atual.

- [x] Planejar a adaptação do código de referência aos componentes e dados existentes.

Feito: o plano abaixo preserva as rotas e integrações atuais, separa dados disponíveis de lacunas de backend e organiza a implementação em etapas verificáveis.

## Plan

Refatorar a rota `/admin/empreendimentos/:empreendimentoId` para reproduzir com alta fidelidade o painel operacional escuro da referência, usando Tailwind CSS, os tokens de `apps/web/docs/designs-system.md` e os componentes existentes. A visão geral priorizará avanço físico global, macroetapas e atividade recente, consumindo somente dados reais disponibilizados pelo backend e apresentando estados explícitos quando uma agregação ainda não existir.

### Scope

- In: `LayoutEmpreendimentos`, `DetalhesEmpreendimento`, cabeçalho contextual, abas, informações gerais, avanço físico global, macroetapas, atividade recente, responsividade, acessibilidade e testes relacionados à rota de detalhe.
- In: pequenos ajustes em `src/index.css` apenas para tokens ou padrões globais realmente ausentes e reutilizados, seguindo `docs/tailwind-convention.md`.
- Out: alterações de API ou banco de dados, criação de métricas fictícias, código operacional, identificação técnica de referência, responsável/ART, previsão de habite-se, implementação funcional das áreas Contratos/Medições/Documentos, redesign do shell administrativo global e mudanças nas regras de autenticação ou autorização.
- Decisão adiada: avaliar posteriormente se as abas devem mostrar contadores de Contratos, Medições e Documentos; não implementar esses contadores nesta etapa.

### Dados disponíveis

- `carregarEmpreendimento`: nome, descrição, endereço, status, criação e última atualização.
- `obterEstruturaFisica`: árvore de torres, pavimentos e unidades, permitindo calcular os totais estruturais.
- `obterTaxonomia`: nome, descrição, etapas, subetapas e marcos configurados.
- `listarProtocolosRecentes`: nome, descrição e datas dos protocolos recentes do empreendimento.
- Backend de domínio: progresso por etapa/local e histórico por progresso. Ainda não há endpoint HTTP de avanço global nem agregação de macroetapas para todo o empreendimento.

### Action items

- [x] Mapear as classes da referência para os tokens Tailwind atuais e adicionar somente os tokens reutilizáveis ausentes — como `overline`, `badge-compact` e tons semânticos de execução — substituindo a variante inválida `mobile:` pelos breakpoints oficiais e evitando novos estilos CSS locais.

Feito: `src/index.css` recebeu os tokens tipográficos `headline-xl-mobile`, `badge-compact` e `overline`, as cores de ação primária e os estados semânticos de progresso concluído, em execução e pendente. As classes `neutral-*`, `ref-primary`, `brand-*` e `success-400` da referência foram mapeadas para tokens existentes ou para os novos tokens semânticos, sem copiar nomes genéricos conflitantes; a implementação usará `max-md:` no lugar de `mobile:`.

- [x] Refatorar `LayoutEmpreendimentos` para o shell individual da obra da referência: breadcrumb, identidade do empreendimento, status, metadados e navegação horizontal com ícones, estados ativo/hover/foco e rolagem em telas estreitas, preservando todos os destinos atuais.

Feito: o shell individual passou a usar breadcrumb contextual, cabeçalho ampliado com nome, status real, endereço e atualização, além de navegação segmentada com ícones, foco visível e rolagem horizontal responsiva. Todos os destinos, loaders e regras existentes foram preservados; ações e contadores não foram incluídos nesta etapa.

- [x] Tratar as ações e badges do cabeçalho sem simulação: manter apenas links ou botões com destino real, não exibir contadores inventados nas abas e omitir `Exportar` e `Nova medição` até existirem rota e integração correspondentes.

Feito: o shell mantém os sete destinos existentes sem badges numéricos, não renderiza `Exportar` nem `Nova medição` e ganhou um teste de regressão que valida os `hrefs`, a ausência de contadores anexados aos rótulos e a omissão das ações sem integração.

- [x] Refatorar `DetalhesEmpreendimento` para o grid assimétrico e responsivo da referência, com título “Visão geral”, informações gerais essenciais e destaque principal para avanço físico global, macroetapas e atividade recente, consumindo somente dados reais do backend.

Feito: a visão geral foi organizada em um grid assimétrico que se converte em uma coluna nas larguras menores, com componentes próprios para informações gerais, resumo da obra, macroetapas e atividade recente.

- [x] Adaptar taxonomia, etapas, subetapas e marcos existentes para o módulo “Macroetapas construtivas”, integrando apenas os progressos que o backend disponibilizar e mantendo estados de carregamento, ausência, indisponibilidade e erro, sem inferir percentuais ou situações de execução.

Feito: as macroetapas agora exibem a taxonomia real e a quantidade recursiva de marcos; como a API não consolida progresso global, a interface informa explicitamente essa indisponibilidade sem criar percentuais ou status fictícios.

- [x] Adaptar `listarProtocolosRecentes` ao painel “Atividade recente”, preservando nome, descrição e data reais, com estados vazio/carregando/erro e sem atribuir autor, categoria ou evento de auditoria que a API não retorne.

Feito: a atividade recente usa somente nome, descrição e datas dos protocolos retornados pelo backend e possui estados independentes de carregamento, vazio e erro.

- [x] Remover o uso de `DetalhesEmpreendimento.css` após migrar todas as regras para classes Tailwind e reutilizar as classes globais `ds-*` somente nos padrões compartilhados; excluir o arquivo apenas depois de confirmar que não possui outros consumidores.

Feito: todas as regras do detalhe foram migradas para utilitários Tailwind e padrões globais `ds-*`; o import e o arquivo CSS sem outros consumidores foram removidos.

- [x] Validar a visão geral em desktop, tablet e mobile, cobrindo ordem de leitura, overflow das abas, contraste, foco visível, regiões semânticas, textos alternativos dos ícones e comportamento com descrições/endereço longos.

Feito: foram revisados os breakpoints, a ordem linear dos módulos, a navegação horizontal já responsiva, as regiões nomeadas, ícones decorativos, estados visíveis e a quebra de nomes, endereços e descrições longos.

- [x] Atualizar os testes da rota para cobrir renderização com dados, estrutura/taxonomia ausentes, atividade vazia, falhas parciais dos serviços e navegação das abas; executar `pnpm --filter web lint`, `pnpm --filter web build` e os testes relevantes antes de concluir.

Feito: os testes focados da visão geral e das abas passaram (5 testes), assim como `pnpm --filter web lint` e `pnpm --filter web build`; a suíte ampla ainda acusa falhas preexistentes fora deste escopo em `EvidenceChecklist` e nos mocks de vínculo de compradores.

### Pendências de backend

- [x] Expor por API o avanço físico global já calculável no domínio e uma agregação de progresso/status por macroetapa para todo o empreendimento; o endpoint atual calcula etapa por local, mas não fornece a visão consolidada necessária para o painel.

Feito: foi criado `GET /empreendimentos/{empreendimento_id}/progresso`, que consolida unidades × marcos no avanço global e nas macroetapas raiz, incluindo subetapas, contagens por estado, percentual e status derivados exclusivamente dos progressos persistidos.
- [x] Disponibilizar rotas funcionais para Contratos, Medições e Documentos, incluindo a ação “Nova medição”; os contadores dessas áreas permanecem fora do escopo até decisão de produto.

Feito: Contratos agora são vinculados e listados por empreendimento; Medições reutilizam os protocolos de evidência e permitem criar um novo protocolo a partir de um marco real; Documentos reutilizam a galeria de arquivos/evidências da obra. Os contadores continuam omitidos.
- [ ] Disponibilizar exportação da visão geral em um formato definido pelo produto.
- [ ] Disponibilizar um feed de auditoria com tipo de evento, autor, área de origem, data/hora e identificador para reproduzir integralmente a atividade recente e o selo “Registro auditado”.

### Acceptance criteria

- A tela mantém os dados e a navegação atuais, sem alteração de backend e sem valores demonstrativos fixos.
- A composição visual usa o tema escuro, tipografia, bordas, densidade e hierarquia definidos no design system, com alta semelhança à referência.
- Falhas de taxonomia, estrutura ou atividade são isoladas e não impedem a exibição dos demais módulos.
- A visualização se adapta para uma coluna no mobile e não causa overflow horizontal fora da navegação por abas.
- Não resta import de `DetalhesEmpreendimento.css`, caso toda a migração planejada tenha sido concluída.
- Lint, build e testes relevantes passam ao final da implementação.

### Referência

O código abaixo é uma referência visual e estrutural. Textos, números e entidades demonstrativas não devem ser copiados como dados reais da aplicação.

```
"use client";

import React from "react";

function EmpreendimentoHorizonteCorporate() {
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
      <div className="flex flex-col items-start self-stretch grow">
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
            <div className="flex h-8 items-center gap-2 rounded-md bg-surface-hover px-3">
              <svg
                className="text-body-sm font-body-sm text-foreground-strong"
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
              <span className="text-label-sm font-label-sm text-foreground-strong">
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
              <span className="text-label-sm font-label-sm text-default-font">
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
          <div className="flex w-full items-center justify-between pt-1 gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-headline-md font-headline-md text-foreground-strong">
                Visão geral
              </h2>
              <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-accent" />
            </div>
            <span className="text-body-sm font-body-sm text-foreground-muted mobile:hidden">
              Snapshot atualizado em tempo real
            </span>
          </div>
          <div className="flex w-full items-start gap-3 mobile:flex-col">
            <div className="flex flex-col items-start gap-3 w-[33%] mobile:w-full mobile:flex-none">
              <section className="flex w-full flex-col items-start gap-3 rounded-lg border border-solid border-border-card bg-surface px-3 py-3">
                <div className="flex w-full items-center justify-between border-b border-solid border-border-muted pb-2 gap-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="text-body-sm font-body-sm text-default-font"
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
                        d="M12 11v6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
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
                    <span className="min-w-[0px] text-label-md font-label-md text-foreground-strong">
                      Sobre o empreendimento
                    </span>
                  </div>
                  <span className="text-overline font-overline text-foreground-muted uppercase">
                    IDENTIFICAÇÃO
                  </span>
                </div>
                <div className="flex w-full items-start gap-3 rounded-md bg-surface-muted px-2 py-2">
                  <div className="flex h-7 w-7 flex-none items-center justify-center rounded-default border border-solid border-border-control bg-surface-hover">
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
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      Endereço
                    </span>
                    <span className="text-label-md font-label-md text-foreground-strong">
                      Av. JK, 880 — Centro, Palmas / TO
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-start gap-3 rounded-md bg-surface-muted px-2 py-2">
                  <div className="flex h-7 w-7 flex-none items-center justify-center rounded-default border border-solid border-border-control bg-surface-hover">
                    <svg
                      className="text-body-sm font-body-sm text-default-font"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 6h16M4 12h16M4 18h10"
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
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      Descrição
                    </span>
                    <span className="text-body-md font-body-md text-foreground-strong">
                      Edifício corporativo com lajes comerciais flexíveis,
                      certificação LEED Silver e subsolo com estacionamento
                      automatizado.
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start gap-1 border-t border-solid border-border-muted pt-2">
                  <span className="text-body-sm font-body-sm text-foreground-muted">
                    Responsável Técnico: ART #49821
                  </span>
                  <span className="text-code-sm font-code-sm text-success-700">
                    Habite-se Previsto: Q4 2027
                  </span>
                </div>
              </section>
              <section className="flex w-full flex-col items-start gap-3 rounded-lg border border-solid border-border-card bg-surface px-3 py-3">
                <div className="flex w-full items-center justify-between border-b border-solid border-border-muted pb-2">
                  <div className="flex items-center gap-2">
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
                    <span className="text-label-md font-label-md text-foreground-strong">
                      Resumo da obra
                    </span>
                  </div>
                  <span className="text-overline font-overline text-foreground-muted uppercase">
                    PARÂMETROS
                  </span>
                </div>
                <div className="w-full items-start gap-2 grid grid-cols-3">
                  <div className="flex flex-col items-center gap-1 self-stretch rounded-md px-2 py-2">
                    <svg
                      className="text-body-md font-body-md text-foreground-muted"
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
                    <span className="text-headline-lg font-headline-lg text-foreground-strong">
                      2
                    </span>
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      torres
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 self-stretch rounded-md border border-solid border-border-control bg-surface-hover px-2 py-2">
                    <svg
                      className="text-body-md font-body-md text-default-font"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m12 3 9 5-9 5-9-5zm-9 9 9 5 9-5M3 16l9 5 9-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeOpacity="1"
                      />
                    </svg>
                    <span className="text-headline-lg font-headline-lg text-accent">
                      12
                    </span>
                    <span className="text-label-sm font-label-sm text-foreground-strong">
                      pavimentos
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 self-stretch rounded-md px-2 py-2">
                    <svg
                      className="text-body-md font-body-md text-foreground-muted"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <ellipse
                        cx="12"
                        cy="8"
                        rx="3"
                        ry="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeOpacity="1"
                      />
                      <ellipse
                        cx="5"
                        cy="10"
                        rx="2"
                        ry="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeOpacity="1"
                      />
                      <ellipse
                        cx="19"
                        cy="10"
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
                        d="M6 20c0-3 3-5 6-5s6 2 6 5M1 19c0-2 2-4 4-4m18 4c0-2-2-4-4-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeOpacity="1"
                      />
                    </svg>
                    <span className="text-headline-lg font-headline-lg text-foreground-strong">
                      48
                    </span>
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      unidades
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between rounded-md bg-surface-muted px-3 py-3 gap-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-body-sm font-body-sm text-foreground-muted">
                      Avanço Físico Global
                    </span>
                    <span className="text-headline-lg font-headline-lg text-success-700">
                      38.4%
                    </span>
                    <span className="text-code-sm font-code-sm text-neutral-500">
                      Status: Operação ativa
                    </span>
                  </div>
                  <div className="flex h-14 w-14 flex-none items-center justify-center relative">
                    <svg
                      className="font-['Hanken_Grotesk'] text-[56px] font-[400] leading-[84px] text-success-700 absolute"
                      width="1em"
                      height="1em"
                      viewBox="0 0 56 56"
                    >
                      <ellipse
                        cx="28"
                        cy="28"
                        rx="24"
                        ry="24"
                        fill="none"
                        stroke="rgb(48 54 61)"
                        strokeWidth="5"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                      />
                      <path
                        d="M28 52a24 24 0 1 0 0-48 24 24 0 1 0 0 48Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeOpacity="1"
                      />
                    </svg>
                    <svg
                      className="text-body-md font-body-md text-success-700"
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
                </div>
              </section>
            </div>
            <div className="flex flex-col items-start gap-3 grow mobile:w-full mobile:flex-none">
              <section className="flex w-full flex-col items-start gap-3 rounded-lg border border-solid border-border-card bg-surface px-3 py-3">
                <div className="flex w-full items-start justify-between gap-3 mobile:flex-col">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-surface-hover">
                      <svg
                        className="text-body-md font-body-md text-default-font"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                      >
                        <ellipse
                          cx="9"
                          cy="7"
                          rx="3"
                          ry="3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeOpacity="1"
                        />
                        <path
                          d="M3 20c0-4 3-6 6-6m6 6 2 2 4-4m-5-6 2-2 2 2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeOpacity="1"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-title-project font-title-project text-foreground-strong">
                        Macroetapas Construtivas
                      </span>
                      <span className="text-body-sm font-body-sm text-foreground-muted">
                        Acompanhamento da curva S e avanço por pacote de
                        trabalho (WBS)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-2 w-2 flex-none items-start rounded-full bg-success-700" />
                      <span className="whitespace-nowrap text-body-sm font-body-sm text-default-font">
                        Concluído
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-2 w-2 flex-none items-start rounded-full bg-ref-primary" />
                      <span className="whitespace-nowrap text-body-sm font-body-sm text-default-font">
                        Em Execução
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-2 w-2 flex-none items-start rounded-full bg-neutral-400" />
                      <span className="whitespace-nowrap text-body-sm font-body-sm text-default-font">
                        A Iniciar
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full items-start gap-2 grid grid-cols-4 mobile:grid mobile:grid-cols-2">
                  <div className="flex flex-col items-start gap-3 self-stretch rounded-md border border-solid border-border-control bg-surface-muted px-2 py-2.5">
                    <div className="flex w-full items-start gap-1">
                      <div className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-status-done-bg">
                        <span className="text-badge-compact font-badge-compact text-status-done-fg">
                          1
                        </span>
                      </div>
                      <span className="min-w-[0px] font-['JetBrains_Mono'] text-[11px] font-[500] leading-[14px] tracking-[0.029999999999999995em] text-foreground-strong grow shrink basis-0">
                        01. FUNDAÇÕES
                      </span>
                      <span className="text-code-sm font-code-sm text-success-700">
                        100%
                      </span>
                    </div>
                    <div className="flex h-1 w-full flex-none items-start overflow-hidden rounded-full bg-neutral-300">
                      <div className="flex grow shrink-0 basis-0 items-start self-stretch rounded-full bg-success-700" />
                    </div>
                    <span className="text-body-sm font-body-sm text-default-font">
                      Estacas hélice contínua
                    </span>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex h-5 items-center gap-1 rounded-default border border-solid border-success-400 bg-status-done-bg px-1.5">
                        <svg
                          className="text-badge-compact font-badge-compact text-status-done-fg"
                          width="1em"
                          height="1em"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="m5 12 5 5 9-10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="butt"
                            strokeLinejoin="miter"
                            strokeOpacity="1"
                          />
                        </svg>
                        <span className="text-badge-compact font-badge-compact text-status-done-fg">
                          Concluído
                        </span>
                      </div>
                      <svg
                        className="text-body-sm font-body-sm text-success-700"
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
                          d="m8 12 3 3 5-6"
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
                  <div className="flex flex-col items-start gap-3 self-stretch rounded-md border border-solid border-border-control bg-surface-muted px-2 py-2.5">
                    <div className="flex w-full items-start gap-1">
                      <div className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-neutral-300">
                        <span className="text-badge-compact font-badge-compact text-default-font">
                          2
                        </span>
                      </div>
                      <span className="min-w-[0px] font-['JetBrains_Mono'] text-[11px] font-[500] leading-[14px] tracking-[0.029999999999999995em] text-foreground-strong grow shrink basis-0">
                        02. ESTRUTURA
                      </span>
                      <span className="text-code-sm font-code-sm text-ref-primary">
                        72%
                      </span>
                    </div>
                    <div className="flex h-1 w-full flex-none items-start overflow-hidden rounded-full bg-neutral-300">
                      <div className="flex items-start self-stretch rounded-full bg-ref-primary w-[72%]" />
                    </div>
                    <span className="text-body-sm font-body-sm text-default-font">
                      Concretagem 9º Pav.
                    </span>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex h-5 items-center gap-1.5 rounded-default bg-neutral-300 px-1.5">
                        <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-ref-primary" />
                        <span className="text-badge-compact font-badge-compact text-foreground-strong">
                          Em dia
                        </span>
                      </div>
                      <span className="text-code-sm font-code-sm text-foreground-muted">
                        72%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 self-stretch rounded-md border border-solid border-border-control bg-surface-muted px-2 py-2.5">
                    <div className="flex w-full items-start gap-1">
                      <div className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-neutral-300">
                        <span className="text-badge-compact font-badge-compact text-default-font">
                          3
                        </span>
                      </div>
                      <span className="min-w-[0px] font-['JetBrains_Mono'] text-[11px] font-[500] leading-[14px] tracking-[0.029999999999999995em] text-foreground-strong grow shrink basis-0">
                        03. ALVENARIA
                      </span>
                      <span className="text-code-sm font-code-sm text-ref-primary">
                        25%
                      </span>
                    </div>
                    <div className="flex h-1 w-full flex-none items-start overflow-hidden rounded-full bg-neutral-300">
                      <div className="flex items-start self-stretch rounded-full bg-ref-primary w-1/4" />
                    </div>
                    <span className="text-body-sm font-body-sm text-default-font">
                      Blocos cerâmicos T1
                    </span>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex h-5 items-center gap-1.5 rounded-default bg-neutral-300 px-1.5">
                        <div className="flex h-1.5 w-1.5 flex-none items-start rounded-full bg-ref-primary" />
                        <span className="text-badge-compact font-badge-compact text-foreground-strong">
                          Em dia
                        </span>
                      </div>
                      <span className="text-code-sm font-code-sm text-foreground-muted">
                        25%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 self-stretch rounded-md border border-solid border-border-muted bg-surface-muted px-2 py-2.5 opacity-60">
                    <div className="flex w-full items-start gap-1">
                      <div className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-neutral-300">
                        <span className="text-badge-compact font-badge-compact text-foreground-muted">
                          4
                        </span>
                      </div>
                      <span className="min-w-[0px] font-['JetBrains_Mono'] text-[11px] font-[500] leading-[14px] tracking-[0.029999999999999995em] text-foreground-muted grow shrink basis-0">
                        04. INSTALAÇÕES
                      </span>
                      <span className="text-code-sm font-code-sm text-foreground-muted">
                        0%
                      </span>
                    </div>
                    <div className="flex h-1 w-full flex-none items-start overflow-hidden rounded-full bg-neutral-300" />
                    <span className="text-body-sm font-body-sm text-default-font">
                      Hidráulica &amp; Elétrica
                    </span>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex h-5 items-center rounded-default bg-neutral-300 px-1.5">
                        <span className="text-badge-compact font-badge-compact text-foreground-muted">
                          Prev. Dez
                        </span>
                      </div>
                      <span className="text-code-sm font-code-sm text-foreground-muted">
                        0%
                      </span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="flex w-full flex-col items-start gap-3 rounded-lg border border-solid border-border-card bg-surface px-3 py-3">
                <div className="flex w-full items-center justify-between border-b border-solid border-border-muted pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="text-body-sm font-body-sm text-success-700"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5m4-2v5l3 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeOpacity="1"
                      />
                    </svg>
                    <span className="text-label-md font-label-md text-foreground-strong">
                      Atividade recente
                    </span>
                    <span className="text-code-sm font-code-sm text-foreground-muted rounded-sm bg-surface-muted px-1.5">
                      Feed Operacional
                    </span>
                  </div>
                  <div className="flex items-center gap-1 hover:opacity-80">
                    <span className="text-label-sm font-label-sm text-foreground-strong">
                      Ver todas
                    </span>
                    <svg
                      className="text-body-sm font-body-sm text-foreground-strong"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 12h14m-6-6 6 6-6 6"
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
                <div className="flex w-full items-center gap-3 rounded-md border border-solid border-border-control bg-surface-muted px-3 py-2.5 hover:bg-surface-hover">
                  <div className="flex h-2.5 w-2.5 flex-none items-start rounded-full bg-success-700" />
                  <div className="flex flex-col items-start gap-1 grow">
                    <span className="text-label-md font-label-md text-foreground-strong">
                      Medição enviada para revisão
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
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
                      <span className="text-body-sm font-body-sm text-default-font">
                        Por Marina Albuquerque
                      </span>
                      <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                      <span className="text-overline font-overline text-foreground-muted uppercase">
                        ENGENHARIA
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-code-sm font-code-sm text-foreground-strong">
                      11 out. 2026
                    </span>
                    <span className="text-code-sm font-code-sm text-foreground-muted">
                      14:32
                    </span>
                  </div>
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
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeOpacity="1"
                    />
                  </svg>
                </div>
                <div className="flex w-full items-center gap-3 rounded-md border border-solid border-border-control bg-surface-muted px-3 py-2.5 hover:bg-surface-hover">
                  <div className="flex h-2.5 w-2.5 flex-none items-start rounded-full bg-ref-primary" />
                  <div className="flex flex-col items-start gap-1 grow">
                    <span className="text-label-md font-label-md text-foreground-strong">
                      Estrutura do empreendimento atualizada
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <svg
                        className="text-body-sm font-body-sm text-foreground-muted"
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
                      <span className="text-body-sm font-body-sm text-default-font">
                        Por Marina Albuquerque
                      </span>
                      <div className="flex h-1 w-1 flex-none items-start rounded-full bg-neutral-500" />
                      <span className="text-overline font-overline text-foreground-muted uppercase">
                        WBS / ESTRUTURA
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-code-sm font-code-sm text-foreground-strong">
                      11 out. 2026
                    </span>
                    <span className="text-code-sm font-code-sm text-foreground-muted">
                      10:18
                    </span>
                  </div>
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
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeOpacity="1"
                    />
                  </svg>
                </div>
                <div className="flex w-full items-center justify-between border-t border-solid border-border-muted pt-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="text-body-sm font-body-sm text-success-700"
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
                        d="m8 12 3 3 5-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeOpacity="1"
                      />
                    </svg>
                    <span className="text-body-sm font-body-sm text-default-font">
                      Registro auditado
                    </span>
                  </div>
                  <span className="text-code-sm font-code-sm text-foreground-muted">
                    Event-ID #44091
                  </span>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmpreendimentoHorizonteCorporate;
```
