## {FRONT} - Construir a tela de taxonomia baseada na referencia de código 


-- Adapatar a referencia de código para sistema e design atual

# Plan

Refatorar a rota de taxonomia para reproduzir a referência no shell atual do empreendimento, usando Tailwind e dados reais já fornecidos pelo backend. O foco será transformar o editor atual — hoje com formulários dispersos — em uma interface de navegação, conteúdo e detalhes, sem inventar operações inexistentes.

## Scope

- In: tela `/admin/empreendimentos/:empreendimentoId/taxonomia`, árvore de etapas/subetapas/marcos, busca, seleção, detalhes, criação, edição, configuração de taxonomia disponível, responsividade, acessibilidade e testes.
- Out: múltiplas taxonomias personalizadas simultâneas por empreendimento, exclusão, movimentação/reordenação por arrastar, alteração de protocolos e mudanças no backend.

## Action items

[ ] Validar os contratos atuais de taxonomia e registrar o escopo real: um empreendimento possui uma taxonomia personalizada, configurável a partir de um modelo padrão; etapas, subetapas e marcos possuem criação e edição.

[ ] Refatorar `TaxonomyEditor.tsx` como orquestrador do layout de três áreas da referência: navegação lateral, árvore central e painel de detalhes, preservando `carregarTaxonomia` e `alterarTaxonomia`.

[ ] Criar a navegação da taxonomia com busca por nome, resumo real de etapas e ação de configuração baseada em `TaxonomyConfiguration` quando ainda não houver taxonomia no empreendimento.

[ ] Reestruturar a árvore de etapas, subetapas e marcos com expansão individual, ordenação real, ícones por tipo, destaque do item selecionado, contagens derivadas e link de protocolos apenas para marcos.

[ ] Implementar o painel de detalhes do item selecionado com nome, tipo, descrições técnica e do cliente, ordem e ações contextuais sustentadas pela API.

[ ] Substituir os formulários sempre visíveis por formulário condicional de criação ou edição, reutilizando a action atual para etapa, subetapa e marco, com validação, carregamento, erro, sucesso e revalidação após salvar.

[ ] Migrar `TaxonomyEditor.css` e `TaxonomyConfiguration.css` para Tailwind e utilitários `ds-*`, removendo os arquivos locais somente após confirmar que não possuem consumidores.

[ ] Atualizar `taxonomia.loader.ts` e `taxonomia.action.ts` para tipar respostas, tratar ausência de taxonomia e preservar erros de campo ou de API sem dados demonstrativos.

[ ] Adicionar testes de rota e componentes para busca, seleção, expansão, criação, edição, ausência de taxonomia, estado vazio, erros, link de protocolos, teclado e responsividade; executar lint, build e verificações focadas.

## Open questions

- A ação “Nova taxonomia” deve aparecer apenas quando não houver taxonomia configurada, usando os modelos padrão já disponíveis no backend.



```
"use client";

import React from "react";

function EmpreendimentoTaxonomia() {
  return (
    <div className="flex h-full w-full items-start gap-4 bg-canvas px-6 py-6 mobile:flex-col mobile:px-3 mobile:py-4">
      <section className="flex w-[300px] flex-none flex-col items-start gap-3 mobile:w-full mobile:flex-none">
        <div className="flex w-full flex-col items-start gap-1">
          <h2 className="text-headline-md font-headline-md text-foreground-strong">
            Taxonomias
          </h2>
          <span className="text-body-sm font-body-sm text-foreground-muted">
            Organize as etapas, subetapas e marcos da obra.
          </span>
        </div>
        <div className="flex w-full items-center gap-2">
          <div className="flex h-8 min-w-[0px] items-center gap-2 rounded-md border border-solid border-border-control bg-canvas px-2 grow focus-within:border-accent">
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
                strokeLinecap="round"
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <input
              className="min-w-[0px] grow shrink-0 basis-0 text-body-sm font-body-sm text-default-font outline-none placeholder:text-foreground-muted"
              placeholder="Buscar taxonomias..."
              value=""
              type="search"
            />
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
                strokeLinejoin="miter"
                strokeOpacity="1"
              />
            </svg>
            <span className="whitespace-nowrap text-label-sm font-label-sm text-white">
              Nova taxonomia
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border border-solid border-border-card bg-surface">
          <div className="flex w-full items-center justify-between border-b border-solid border-border-muted bg-surface-muted px-3 py-2">
            <span className="text-body-sm font-body-sm text-foreground-muted">
              Nome da taxonomia
            </span>
            <span className="text-body-sm font-body-sm text-foreground-muted">
              Etapas
            </span>
          </div>
          <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted bg-surface-selected px-3 py-2.5 relative">
            <div className="flex w-0.5 flex-none items-start bg-accent absolute left-0 top-0 bottom-0" />
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
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-accent"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 8-9-5-9 5v8l9 5 9-5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
                <path
                  d="m3 8 9 5 9-5m-9 5v8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
              </svg>
            </div>
            <div className="flex min-w-[0px] flex-col items-start overflow-hidden grow shrink basis-0">
              <span className="w-full whitespace-nowrap text-title-project font-title-project text-foreground-strong">
                Execução da obra
              </span>
              <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                Etapas e subetapas da execução
              </span>
            </div>
            <span className="whitespace-nowrap text-code-sm font-code-sm text-default-font">
              12 etapas
            </span>
          </div>
          <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted px-3 py-2.5 hover:bg-surface-hover">
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
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
                <ellipse
                  cx="7.5"
                  cy="11"
                  rx="1.2"
                  ry="1.2"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="10"
                  cy="7"
                  rx="1.2"
                  ry="1.2"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="7.5"
                  rx="1.2"
                  ry="1.2"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
            </div>
            <div className="flex min-w-[0px] flex-col items-start overflow-hidden grow shrink basis-0">
              <span className="w-full whitespace-nowrap text-title-project font-title-project text-foreground-strong">
                Acabamentos
              </span>
              <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                Revestimentos, pinturas e louças
              </span>
            </div>
            <span className="whitespace-nowrap text-code-sm font-code-sm text-foreground-muted">
              8 etapas
            </span>
          </div>
          <div className="flex w-full items-center gap-2 px-3 py-2.5 hover:bg-surface-hover">
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
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-hover">
              <svg
                className="text-body-sm font-body-sm text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 2 4 14h7l-1 8 9-12h-7z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
              </svg>
            </div>
            <div className="flex min-w-[0px] flex-col items-start overflow-hidden grow shrink basis-0">
              <span className="w-full whitespace-nowrap text-title-project font-title-project text-foreground-strong">
                Instalações
              </span>
              <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                Instalações elétricas, hidráulicas
              </span>
            </div>
            <span className="whitespace-nowrap text-code-sm font-code-sm text-foreground-muted">
              10 etapas
            </span>
          </div>
        </div>
      </section>
      <section className="flex min-w-[0px] flex-col items-start self-stretch overflow-hidden rounded-lg border border-solid border-border-card bg-surface grow mobile:w-full mobile:min-w-0 mobile:flex-none">
        <div className="flex w-full items-center justify-between border-b border-solid border-border-muted px-4 py-3 gap-4 mobile:flex-col mobile:items-start">
          <div className="flex min-w-[0px] items-center gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-solid border-border-control bg-surface-hover">
              <svg
                className="text-headline-md font-headline-md text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 8-9-5-9 5v8l9 5 9-5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
                <path
                  d="m3 8 9 5 9-5m-9 5v8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <h3 className="text-headline-md font-headline-md text-foreground-strong">
                  Execução da obra
                </h3>
                <span className="text-code-sm font-code-sm text-foreground-muted rounded-default border border-solid border-border-control bg-surface-muted px-1.5">
                  #TX-01
                </span>
              </div>
              <span className="text-body-sm font-body-sm text-foreground-muted">
                Estação Norte
              </span>
            </div>
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
                Editar
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
              <span className="text-label-sm font-label-sm text-white">
                Adicionar etapa
              </span>
            </div>
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md hover:bg-surface-hover">
              <svg
                className="text-body-md font-body-md text-foreground-muted"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="m6 6 12 12m0-12L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                  strokeOpacity="1"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex w-full items-end gap-1 border-b border-solid border-border-muted px-3">
          <div className="flex h-10 items-center px-3 shadow-[inset_0px_-2px_0px_0px_#58a6ff]">
            <span className="text-label-md font-label-md text-accent">
              Etapas e marcos
            </span>
          </div>
          <div className="flex h-10 items-center px-3 hover:bg-surface-hover">
            <span className="text-label-md font-label-md text-default-font">
              Descrição
            </span>
          </div>
          <div className="flex h-10 items-center px-3 hover:bg-surface-hover">
            <span className="text-label-md font-label-md text-default-font">
              Histórico
            </span>
          </div>
        </div>
        <div className="flex w-full items-stretch grow mobile:flex-col">
          <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0 mobile:w-full mobile:min-w-0 mobile:flex-none">
            <div className="flex w-full items-center justify-between border-b border-solid border-border-muted bg-surface-muted px-3 py-2">
              <span className="text-body-sm font-body-sm text-foreground-muted">
                Etapa / marco
              </span>
              <span className="w-24 flex-none text-body-sm font-body-sm text-foreground-muted">
                Tipo
              </span>
            </div>
            <div className="flex w-full flex-col items-start border-b border-solid border-border-muted bg-surface-selected py-1 relative">
              <div className="flex w-0.5 items-start bg-accent absolute left-0 top-0 bottom-0" />
              <div className="flex w-full items-center gap-2 px-3 py-1.5">
                <svg
                  className="text-body-sm font-body-sm text-default-font"
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
                  className="text-body-sm font-body-sm text-foreground-muted"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <ellipse
                    cx="9"
                    cy="6"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                  <ellipse
                    cx="15"
                    cy="6"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                  <ellipse
                    cx="9"
                    cy="12"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                  <ellipse
                    cx="15"
                    cy="12"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                  <ellipse
                    cx="9"
                    cy="18"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                  <ellipse
                    cx="15"
                    cy="18"
                    rx="1.5"
                    ry="1.5"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
                <svg
                  className="text-body-md font-body-md text-accent"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m21 8-9-5-9 5v8l9 5 9-5z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                  <path
                    d="m3 8 9 5 9-5m-9 5v8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                </svg>
                <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0">
                  <span className="w-full whitespace-nowrap text-label-md font-label-md text-foreground-strong">
                    Fundação
                  </span>
                  <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                    Escavação, concretagem e liberação
                  </span>
                </div>
                <div className="flex w-24 flex-none items-center">
                  <span className="text-badge-compact font-badge-compact text-status-planned-fg rounded-default border border-solid border-brand-300 bg-status-planned-bg px-1.5 py-0.5">
                    Etapa
                  </span>
                </div>
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
              <div className="flex w-full flex-col items-start pl-5">
                <div className="flex w-full flex-col items-start gap-0.5 border-l border-solid border-border-control pl-2">
                  <div className="flex w-full items-center gap-2 rounded-md pl-1 pr-3 py-1.5 hover:bg-surface-hover">
                    <div className="flex h-px w-3 flex-none items-start bg-border-control" />
                    <svg
                      className="text-body-sm font-body-sm text-foreground-muted"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <ellipse
                        cx="9"
                        cy="6"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="6"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="9"
                        cy="12"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="12"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="9"
                        cy="18"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="18"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                    </svg>
                    <svg
                      className="text-body-sm font-body-sm text-default-font"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m21 8-9-5-9 5v8l9 5 9-5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                      />
                      <path
                        d="m3 8 9 5 9-5m-9 5v8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                      />
                    </svg>
                    <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0">
                      <span className="w-full whitespace-nowrap text-label-md font-label-md text-foreground-strong">
                        Escavação
                      </span>
                      <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                        Movimentação de terra e nivelamento
                      </span>
                    </div>
                    <div className="flex w-24 flex-none items-center">
                      <span className="text-badge-compact font-badge-compact text-default-font rounded-default border border-solid border-border-control bg-surface-hover px-1.5 py-0.5">
                        Subetapa
                      </span>
                    </div>
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
                  <div className="flex w-full items-center gap-2 rounded-md pl-1 pr-3 py-1.5 hover:bg-surface-hover">
                    <div className="flex h-px w-3 flex-none items-start bg-border-control" />
                    <svg
                      className="text-body-sm font-body-sm text-foreground-muted"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <ellipse
                        cx="9"
                        cy="6"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="6"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="9"
                        cy="12"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="12"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="9"
                        cy="18"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="18"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                    </svg>
                    <svg
                      className="text-body-sm font-body-sm text-default-font"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m21 8-9-5-9 5v8l9 5 9-5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                      />
                      <path
                        d="m3 8 9 5 9-5m-9 5v8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                      />
                    </svg>
                    <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0">
                      <span className="w-full whitespace-nowrap text-label-md font-label-md text-foreground-strong">
                        Concretagem
                      </span>
                      <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                        Concretagem da base e sapatas
                      </span>
                    </div>
                    <div className="flex w-24 flex-none items-center">
                      <span className="text-badge-compact font-badge-compact text-default-font rounded-default border border-solid border-border-control bg-surface-hover px-1.5 py-0.5">
                        Subetapa
                      </span>
                    </div>
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
                  <div className="flex w-full items-center gap-2 rounded-md pl-1 pr-3 py-1.5 hover:bg-surface-hover">
                    <div className="flex h-px w-3 flex-none items-start bg-border-control" />
                    <svg
                      className="text-body-sm font-body-sm text-foreground-muted"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <ellipse
                        cx="9"
                        cy="6"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="6"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="9"
                        cy="12"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="12"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="9"
                        cy="18"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                      <ellipse
                        cx="15"
                        cy="18"
                        rx="1.5"
                        ry="1.5"
                        fill="currentColor"
                        fillOpacity="1"
                      />
                    </svg>
                    <svg
                      className="text-body-sm font-body-sm text-accent"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M6 3h12l4 6-10 12L2 9z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                      />
                      <path
                        d="M2 9h20M12 21 8 9l4-6 4 6z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="butt"
                        strokeLinejoin="round"
                        strokeOpacity="1"
                      />
                    </svg>
                    <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0">
                      <span className="w-full whitespace-nowrap text-label-md font-label-md text-foreground-strong">
                        Fundação liberada
                      </span>
                      <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                        Base da obra concluída e liberada
                      </span>
                    </div>
                    <div className="flex w-24 flex-none items-center">
                      <span className="text-badge-compact font-badge-compact text-status-planned-fg rounded-default border border-solid border-brand-300 bg-status-planned-bg px-1.5 py-0.5">
                        Marco
                      </span>
                    </div>
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
            </div>
            <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted px-3 py-2.5 hover:bg-surface-hover">
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
                <ellipse
                  cx="9"
                  cy="6"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="6"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="9"
                  cy="12"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="12"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="9"
                  cy="18"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="18"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
              <svg
                className="text-body-md font-body-md text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 8-9-5-9 5v8l9 5 9-5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
                <path
                  d="m3 8 9 5 9-5m-9 5v8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
              </svg>
              <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0">
                <span className="w-full whitespace-nowrap text-label-md font-label-md text-foreground-strong">
                  Estrutura
                </span>
                <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                  Pilares, vigas e lajes.
                </span>
              </div>
              <div className="flex w-24 flex-none items-center">
                <span className="text-badge-compact font-badge-compact text-default-font rounded-default border border-solid border-border-control bg-surface-hover px-1.5 py-0.5">
                  Etapa
                </span>
              </div>
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
            <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted px-3 py-2.5 hover:bg-surface-hover">
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
                <ellipse
                  cx="9"
                  cy="6"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="6"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="9"
                  cy="12"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="12"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="9"
                  cy="18"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="18"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
              <svg
                className="text-body-md font-body-md text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 8-9-5-9 5v8l9 5 9-5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
                <path
                  d="m3 8 9 5 9-5m-9 5v8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
              </svg>
              <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0">
                <span className="w-full whitespace-nowrap text-label-md font-label-md text-foreground-strong">
                  Alvenaria
                </span>
                <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                  Paredes e divisórias.
                </span>
              </div>
              <div className="flex w-24 flex-none items-center">
                <span className="text-badge-compact font-badge-compact text-default-font rounded-default border border-solid border-border-control bg-surface-hover px-1.5 py-0.5">
                  Etapa
                </span>
              </div>
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
            <div className="flex w-full items-center gap-2 border-b border-solid border-border-muted px-3 py-2.5 hover:bg-surface-hover">
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
                <ellipse
                  cx="9"
                  cy="6"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="6"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="9"
                  cy="12"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="12"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="9"
                  cy="18"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
                <ellipse
                  cx="15"
                  cy="18"
                  rx="1.5"
                  ry="1.5"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
              <svg
                className="text-body-md font-body-md text-default-font"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 8-9-5-9 5v8l9 5 9-5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
                <path
                  d="m3 8 9 5 9-5m-9 5v8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
              </svg>
              <div className="flex min-w-[0px] flex-col items-start grow shrink basis-0">
                <span className="w-full whitespace-nowrap text-label-md font-label-md text-foreground-strong">
                  Instalações elétricas
                </span>
                <span className="w-full whitespace-nowrap text-body-sm font-body-sm text-foreground-muted">
                  Infraestrutura elétrica da edificação
                </span>
              </div>
              <div className="flex w-24 flex-none items-center">
                <span className="text-badge-compact font-badge-compact text-default-font rounded-default border border-solid border-border-control bg-surface-hover px-1.5 py-0.5">
                  Etapa
                </span>
              </div>
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
            <div className="flex min-h-[96px] w-full items-start grow" />
            <div className="flex w-full items-center gap-2 border-t border-solid border-border-muted px-3 py-3">
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
                  d="M12 11v6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
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
              <span className="text-body-sm font-body-sm text-foreground-muted">
                Selecione uma etapa ou marco para consultar os detalhes.
              </span>
            </div>
          </div>
          <aside className="flex w-[260px] flex-none flex-col items-start gap-4 border-l border-solid border-border-muted px-4 py-4 mobile:w-full mobile:flex-none mobile:border-l-0 mobile:border-t">
            <div className="flex w-full flex-col items-start gap-2">
              <span className="text-overline font-overline text-foreground-muted uppercase">
                DETALHES DA ETAPA
              </span>
              <div className="flex items-center gap-2">
                <svg
                  className="text-headline-sm font-headline-sm text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m21 8-9-5-9 5v8l9 5 9-5z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                  <path
                    d="m3 8 9 5 9-5m-9 5v8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    strokeOpacity="1"
                  />
                </svg>
                <span className="text-headline-sm font-headline-sm text-foreground-strong">
                  Fundação
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-1.5">
              <span className="text-label-sm font-label-sm text-foreground-muted">
                Descrição técnica
              </span>
              <div className="flex h-14 w-full flex-none items-start rounded-md border border-solid border-border-control bg-canvas px-3 py-2">
                <span className="text-body-sm font-body-sm text-default-font">
                  Preparação da base da obra.
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-1.5">
              <span className="text-label-sm font-label-sm text-foreground-muted">
                Descrição para o cliente
              </span>
              <div className="flex h-14 w-full flex-none items-start rounded-md border border-solid border-border-control bg-canvas px-3 py-2">
                <span className="text-body-sm font-body-sm text-default-font">
                  Execução da fundação do edifício.
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-1.5">
              <span className="text-label-sm font-label-sm text-foreground-muted">
                Ordem
              </span>
              <div className="flex h-8 w-24 flex-none items-center rounded-md border border-solid border-border-control bg-canvas pl-3 pr-1">
                <span className="text-code-sm font-code-sm text-default-font grow">
                  1
                </span>
                <div className="flex h-6 w-5 flex-none flex-col items-center justify-center rounded-sm bg-surface-hover">
                  <svg
                    className="text-badge-compact font-badge-compact text-default-font"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m6 15 6-6 6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                  <svg
                    className="text-badge-compact font-badge-compact text-default-font"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="1"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex w-full items-start grow" />
            <div className="flex w-full flex-col items-start gap-1 border-t border-solid border-border-muted pt-3">
              <div className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 hover:bg-surface-hover">
                <svg
                  className="text-body-sm font-body-sm text-accent"
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
                <span className="text-label-md font-label-md text-accent">
                  Editar etapa
                </span>
              </div>
              <div className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 hover:bg-surface-hover">
                <svg
                  className="text-body-sm font-body-sm text-accent"
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
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
                <span className="text-label-md font-label-md text-accent">
                  Adicionar subetapa
                </span>
              </div>
              <div className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 hover:bg-surface-hover">
                <svg
                  className="text-body-sm font-body-sm text-accent"
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
                    strokeLinejoin="miter"
                    strokeOpacity="1"
                  />
                </svg>
                <span className="text-label-md font-label-md text-accent">
                  Adicionar marco
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default EmpreendimentoTaxonomia;

```

# Plan

Refatorar a rota de taxonomia para reproduzir a referência no shell atual do empreendimento, usando Tailwind e dados reais já fornecidos pelo backend. O foco será transformar o editor atual em uma interface de navegação, conteúdo e detalhes, sem criar operações que a API não oferece.

## Scope

- In: tela `/admin/empreendimentos/:empreendimentoId/taxonomia`, árvore de etapas, subetapas e marcos, busca, seleção, detalhes, criação, edição, configuração da taxonomia disponível, responsividade, acessibilidade e testes.
- Out: múltiplas taxonomias personalizadas simultâneas por empreendimento, exclusão, movimentação ou reordenação por arrastar, alteração de protocolos e mudanças no backend.

## Action items

- [x] Validar os contratos atuais de taxonomia e registrar o escopo real: um empreendimento possui uma taxonomia personalizada, configurável a partir de um modelo padrão; etapas, subetapas e marcos possuem criação e edição.

  Feito: confirmado que o backend mantém uma única taxonomia personalizada por empreendimento, copia um modelo padrão na configuração, limita a hierarquia V1 a etapa e subetapa e oferece criação e edição de etapas e marcos.

- [x] Refatorar `TaxonomyEditor.tsx` como orquestrador do layout de três áreas da referência: navegação lateral, árvore central e painel de detalhes, preservando `carregarTaxonomia` e `alterarTaxonomia`.

  Feito: o editor foi reorganizado em navegação lateral, hierarquia central e painel de detalhes responsivo, mantendo o loader, a action e as operações existentes de criação e edição.

- [x] Criar a navegação da taxonomia com busca por nome, resumo real de etapas e ação de configuração baseada em `TaxonomyConfiguration` quando ainda não houver taxonomia no empreendimento.

  Feito: a navegação recebeu busca por nome e contagens derivadas da estrutura; quando não há taxonomia, a rota exibe os modelos padrão por meio de `TaxonomyConfiguration` e recarrega a árvore após a configuração.

- [x] Reestruturar a árvore de etapas, subetapas e marcos com expansão individual, ordenação real, ícones por tipo, destaque do item selecionado, contagens derivadas e link de protocolos apenas para marcos.

  Feito: cada ramo passou a expandir de forma independente, com ordenação determinística, ícones e contagens recursivas por tipo, seleção destacada e acesso aos protocolos restrito aos marcos.

- [x] Implementar o painel de detalhes do item selecionado com nome, tipo, descrições técnica e do cliente, ordem e ações contextuais sustentadas pela API.

  Feito: o painel exibe a identificação e todas as descrições do item, oferecendo edição, criação de subetapa ou marco conforme a hierarquia permitida e acesso aos protocolos exclusivamente para marcos.

- [x] Substituir os formulários sempre visíveis por formulário condicional de criação ou edição, reutilizando a action atual para etapa, subetapa e marco, com validação, carregamento, erro, sucesso e revalidação após salvar.

  Feito: os formulários repetidos foram substituídos por um editor contextual único para criar ou editar etapas, subetapas e marcos, com validação de campos, bloqueio durante o envio, mensagens de erro e sucesso, cancelamento e revalidação da rota.

- [x] Migrar `TaxonomyEditor.css` e `TaxonomyConfiguration.css` para Tailwind e utilitários `ds-*`, removendo os arquivos locais somente após confirmar que não possuem consumidores.

  Feito: os dois componentes passaram a usar classes Tailwind estáticas, tokens do tema e utilitários globais `ds-*`; após validar que não havia outros consumidores, os arquivos CSS locais foram removidos.

- [x] Atualizar `taxonomia.loader.ts` e `taxonomia.action.ts` para tipar respostas, tratar ausência de taxonomia e preservar erros de campo ou de API sem dados demonstrativos.

  Feito: loader e action receberam contratos explícitos; a ausência de taxonomia é retornada como estado configurável, nome e ordem são validados por campo e falhas reais da API são preservadas como erros gerais, sem fallback demonstrativo.

- [x] Disponibilizar a configuração quando o empreendimento não possuir taxonomia e identificar explicitamente o destino de novas etapas, subetapas e marcos.

  Feito: o estado vazio ganhou acesso direto ao cadastro por modelo padrão e o formulário passou a exibir o nível principal, a etapa pai ou a etapa/subetapa vinculada antes da criação.

- [x] Criar um componente suspenso para o cadastro e a configuração inicial da taxonomia, aberto somente após solicitação do usuário.

  Feito: `TaxonomyInitialSetupDialog` passou a apresentar em um modal acessível o formulário completo de criação, com modelo-base, nome e descrição personalizados, bloqueio do fundo, controle de foco, fechamento por botão, clique externo ou tecla Esc e atualização da rota após configurar.

- [ ] Adicionar testes de rota e componentes para busca, seleção, expansão, criação, edição, ausência de taxonomia, estado vazio, erros, link de protocolos, teclado e responsividade; executar lint, build e verificações focadas.

## Open questions

- A ação “Nova taxonomia” deve aparecer apenas quando não houver taxonomia configurada, usando os modelos padrão já disponíveis no backend.
