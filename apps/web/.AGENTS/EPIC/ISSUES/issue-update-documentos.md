## {FRONT} - Utilize o codigo referencia para criar a tela de documentos



-- Utilize o codigo referencia mais o desygn sistem de referencia para criar a tela de documentos com base no codigo referencia abaixo

-- se o codigo referencia conter imagens referencia não as utilize por enquanto

# Plan

Refatorar a aba Documentos para uma galeria operacional de evidências, seguindo a referência visual e o design system atual, mas exibindo somente informações realmente fornecidas pelo backend. As imagens externas da referência não serão utilizadas; os cards continuarão usando `arquivo_url` das evidências cadastradas.

## Scope
- In: cabeçalho, filtros, busca, cards, seleção, painel de detalhes, paginação, estados de carregamento/erro/vazio, responsividade, Tailwind e testes.
- Out: alteração de validação, contrato vinculado, agrupamento com várias fotos, compartilhamento persistente, imagens demonstrativas e mudanças no backend.

## Action items
[x] Validar e documentar o contrato disponível em `evidencias.service.ts` e `types.ts`, distinguindo os dados reais dos elementos não suportados da referência, como status de validação persistido, contrato vinculado e múltiplas imagens por evidência.

O contrato foi alinhado ao backend: cada evidência possui uma imagem, local, marco, responsável, descrição e datas; status de validação, contrato vinculado, compartilhamento e agrupamento de imagens foram documentados como não suportados e o status fictício foi removido do front-end.

[x] Refatorar `EvidenceGallery` para o layout de referência, com cabeçalho “Evidências da obra”, descrição, contador real, área principal de cards e painel lateral de detalhes da evidência selecionada.

A galeria agora usa os dados retornados por `listarEvidencias`, exibe cabeçalho e contador real, organiza os cards em uma grade responsiva e apresenta os detalhes da evidência selecionada em painel lateral no desktop ou diálogo sobreposto em telas menores. Nenhum dado demonstrativo da referência foi adicionado.

[x] Implementar busca textual por descrição, local, marco e responsável, mantendo os filtros suportados de local, marco e período e oferecendo uma ação única para limpar todos os filtros.

A busca é aplicada no cliente sobre descrição, local, marco, nome e e-mail do responsável, sem alterar a consulta da API. A ação “Limpar” remove simultaneamente a busca e todos os filtros suportados.

[x] Substituir os campos numéricos de local e marco por seletores legíveis, utilizando os metadados retornados nas evidências e preservando os identificadores nas consultas à API.

Os filtros de local e marco agora exibem os nomes retornados pelo backend, usando os IDs apenas como valores das opções e nos parâmetros enviados à API.

[x] Refatorar `EvidenceCard` com Tailwind e design system escuro para apresentar imagem real, fallback, local, marco, data, responsável e descrição, sem renderizar badges ou informações que o backend não disponibilize.

O card foi alinhado ao componente visual de referência com imagem em destaque, contexto de local e marco, metadados de data e responsável, descrição expansível e fallback de imagem. Status e badges não suportados pelo backend não são renderizados.

[x] Refatorar os detalhes da evidência para um painel lateral no desktop e diálogo adaptado no mobile, com imagem ampliada, dados técnicos, responsável, datas e ação de download quando houver URL válida.

O painel segue o componente de referência, com cabeçalho, imagem ampliada, fallback, dados técnicos, responsável, datas e link de download condicionado à URL válida da evidência. No mobile, o mesmo conteúdo é apresentado como diálogo sobreposto.

[x] Ajustar a paginação client-side, seleção entre páginas, fechamento por botão, clique externo e tecla Escape, além dos estados de imagem indisponível, busca sem resultado e evidência removida da resposta.

A paginação mantém a seleção funcional entre páginas; o painel pode ser fechado pelo botão, clique externo ou Escape. A galeria também fecha automaticamente os detalhes quando a evidência selecionada deixa de existir na resposta atual, mantendo os fallbacks de imagem e busca sem resultados.

[x] Remover `EvidenceGallery.css` e migrar `EvidenceGallery` e `EvidenceCard` para utilitários Tailwind e classes globais `ds-*`, mantendo três colunas no desktop e empilhamento responsivo.

`EvidenceGallery.css` foi removido. Galeria, cards, filtros, skeleton e painel usam Tailwind e classes `ds-*`, com três colunas no desktop, duas em telas intermediárias e empilhamento no mobile.

[x] Integrar o novo componente à aba `/admin/empreendimentos/:empreendimentoId/documentos`, evitando cabeçalhos duplicados e mantendo o shell individual da obra.

A rota canônica `/documentos` continua dentro do `LayoutEmpreendimentos` e agora usa o cabeçalho próprio da galeria, sem repetir o cabeçalho genérico de `PaginaPainel`.

[x] Atualizar `EvidenceGallery.test.tsx` para cobrir carregamento, erro e nova tentativa, vazio, busca, filtros, limpeza, paginação, seleção por mouse e teclado, painel de detalhes, fechamento e imagens indisponíveis; validar com `pnpm --filter web lint`, testes direcionados e build.

Os testes cobrem os estados e interações da galeria, incluindo seleção via teclado, fechamento pelo painel, fallback de imagem ampliada e download quando a URL é válida.

## Open questions
- A rota legada `/admin/empreendimentos/:empreendimentoId/evidencias` deve continuar renderizando a galeria ou redirecionar para a aba canônica `/documentos`?

```
"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { EvidenceCard } from "@/ui/components/EvidenceCard";
import { StatusBadge } from "@/ui/components/StatusBadge";

function DocumentosEvidenciasDaObra() {
  return (
    <div className="flex h-full w-full flex-col items-start bg-[#010409] px-6 py-6 mobile:px-4 mobile:py-4">
      <div className="flex w-full items-start gap-4 mobile:flex-col">
        <div className="flex min-w-[0px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-lg border border-solid border-[#ffffff1f] bg-[#0d1117] px-4 py-4 mobile:min-w-0 mobile:flex-none">
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex min-w-[0px] grow shrink-0 basis-0 flex-col items-start gap-1">
              <span className="text-section-header font-section-header text-[#ffffff]">
                Evidências da obra
              </span>
              <span className="text-caption font-caption text-subtext-color">
                Consulte fotos técnicas, vistorias fotográficas e registros de
                execução do empreendimento.
              </span>
            </div>
            <div className="flex items-center rounded-md border border-solid border-[#30363d] bg-[#161b22] px-2 py-1">
              <span className="whitespace-nowrap text-monospace-body font-monospace-body text-subtext-color">
                24 evidências
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-[#30363d] bg-[#161b22] px-3 py-3">
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="flex h-8 min-w-[160px] grow shrink-0 basis-0 items-center gap-2 rounded-md border border-solid border-[#3d444d] bg-[#0d1117] px-2 focus-within:border-brand">
                <svg
                  className="text-body font-body text-subtext-color"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3m0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
                <input
                  className="grow shrink-0 basis-0 self-stretch text-body font-body text-default-font outline-none placeholder:text-[#9198a1]"
                  placeholder="Buscar evidências..."
                  value="Laje"
                  type="search"
                />
              </div>
              <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-[#3d444d] bg-[#0d1117] px-2.5 cursor-pointer hover:border-neutral-400">
                <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                  Local:
                </span>
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-default-font">
                  Todos
                </span>
                <svg
                  className="text-caption font-caption text-subtext-color"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m7 9.5 5 5 5-5-1.4-1.4-3.6 3.6-3.6-3.6z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
              <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-[#3d444d] bg-[#0d1117] px-2.5 cursor-pointer hover:border-neutral-400">
                <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                  Marco:
                </span>
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-default-font">
                  Todos
                </span>
                <svg
                  className="text-caption font-caption text-subtext-color"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m7 9.5 5 5 5-5-1.4-1.4-3.6 3.6-3.6-3.6z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2">
              <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-[#3d444d] bg-[#0d1117] px-2.5 cursor-pointer hover:border-neutral-400">
                <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                  Período:
                </span>
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-default-font">
                  Últimos 30 dias
                </span>
                <svg
                  className="text-caption font-caption text-subtext-color"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m7 9.5 5 5 5-5-1.4-1.4-3.6 3.6-3.6-3.6z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
              <div className="flex h-8 items-center gap-2 rounded-md border border-solid border-[#3d444d] bg-[#0d1117] px-2.5 cursor-pointer hover:border-neutral-400">
                <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                  Validação:
                </span>
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-default-font">
                  Todas
                </span>
                <svg
                  className="text-caption font-caption text-subtext-color"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m7 9.5 5 5 5-5-1.4-1.4-3.6 3.6-3.6-3.6z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
              <Button
                className="px-1"
                variant="link"
                size="small"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
          <div className="w-full items-start gap-3 grid grid-cols-3 mobile:grid mobile:grid-cols-1">
            <EvidenceCard
              className="h-auto grow shrink-0 basis-0 self-stretch"
              selected={true}
              status="success"
              image="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80"
              title="Concretagem da laje"
              statusLabel="Validada"
              activeLabel="ATIVO"
              localLabel="Local"
              localValue="Ed. A · 2º Pav."
              marcoLabel="Marco"
              marcoValue="Laje concretada"
              dateLabel="Data"
              dateValue="12 out. 2026"
              authorLabel="Por"
              authorValue="M. Albuquerque"
              description="Registro da concretagem e acabamento da laje com teste de slump aprovado."
            />
            <EvidenceCard
              className="h-auto grow shrink-0 basis-0 self-stretch"
              status="warning"
              image="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"
              title="Alvenaria — Unid. 101"
              statusLabel="Pendente"
              activeLabel=""
              localLabel="Local"
              localValue="Ed. A · Unid. 101"
              marcoLabel="Marco"
              marcoValue="Alvenaria"
              dateLabel="Data"
              dateValue="10 out. 2026"
              authorLabel="Por"
              authorValue="Carlos Mendes"
              description="Execução da alvenaria interna de blocos cerâmicos da unidade 101."
            />
            <EvidenceCard
              className="h-auto grow shrink-0 basis-0 self-stretch"
              status="success"
              image="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
              title="Escavação da fundação"
              statusLabel="Validada"
              activeLabel=""
              localLabel="Local"
              localValue="Área ext. Fund."
              marcoLabel="Marco"
              marcoValue="Fundação"
              dateLabel="Data"
              dateValue="05 out. 2026"
              authorLabel="Por"
              authorValue="João Ribeiro"
              description="Escavação de fundação profunda conforme projeto geotécnico aprovado."
            />
            <EvidenceCard
              className="h-auto grow shrink-0 basis-0 self-stretch"
              status="warning"
              image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
              title="Armação dos pilares"
              statusLabel="Pendente"
              activeLabel=""
              localLabel="Local"
              localValue="Edifício A · Térreo"
              marcoLabel="Marco"
              marcoValue="Pilares"
              dateLabel="Data"
              dateValue="28 set. 2026"
              authorLabel="Por"
              authorValue="Paula Lima"
              description="Armação dos pilares conforme detalhamento de projeto estrutural."
            />
            <EvidenceCard
              className="h-auto grow shrink-0 basis-0 self-stretch"
              status="neutral"
              image="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80"
              title="Infraestrutura elétrica"
              statusLabel="Não se aplica"
              activeLabel=""
              localLabel="Local"
              localValue="Ed. A · 1º Pav."
              marcoLabel="Marco"
              marcoValue="Instalações"
              dateLabel="Data"
              dateValue="25 set. 2026"
              authorLabel="Por"
              authorValue="Rafael Costa"
              description="Instalação dos eletrodutos rígidos e flexíveis da rede elétrica."
            />
            <EvidenceCard
              className="h-auto grow shrink-0 basis-0 self-stretch"
              status="success"
              image="https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=800&q=80"
              title="Pilares concretados"
              statusLabel="Validada"
              activeLabel=""
              localLabel="Local"
              localValue="Edifício A · Térreo"
              marcoLabel="Marco"
              marcoValue="Pilares"
              dateLabel="Data"
              dateValue="20 set. 2026"
              authorLabel="Por"
              authorValue="M. Albuquerque"
              description="Pilares concretados e desforma realizada com cura úmida aplicada."
            />
          </div>
          <div className="flex w-full items-center justify-between border-t border-solid border-[#21262d] pt-3 gap-4 mobile:flex-col mobile:items-start">
            <span className="text-caption font-caption text-subtext-color">
              Exibindo 1–6 de 24 registros
            </span>
            <div className="flex items-center gap-1">
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-[#3d444d] bg-[#21262d] cursor-pointer opacity-50">
                <svg
                  className="text-body font-body text-subtext-color"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14.6 7 16 8.4 12.4 12l3.6 3.6-1.4 1.4-5-5z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-brand bg-[#12243a] cursor-pointer">
                <span className="text-monospace-body font-monospace-body text-brand">
                  1
                </span>
              </div>
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-[#3d444d] bg-[#21262d] cursor-pointer hover:border-neutral-400">
                <span className="text-monospace-body font-monospace-body text-default-font">
                  2
                </span>
              </div>
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-[#3d444d] bg-[#21262d] cursor-pointer hover:border-neutral-400">
                <span className="text-monospace-body font-monospace-body text-default-font">
                  3
                </span>
              </div>
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-[#3d444d] bg-[#21262d] cursor-pointer hover:border-neutral-400">
                <span className="text-monospace-body font-monospace-body text-default-font">
                  4
                </span>
              </div>
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-solid border-[#3d444d] bg-[#21262d] cursor-pointer hover:border-neutral-400">
                <svg
                  className="text-body font-body text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9.4 7 8 8.4l3.6 3.6L8 15.6 9.4 17l5-5z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <aside className="flex w-[340px] flex-none flex-col items-start overflow-hidden rounded-lg border border-solid border-[#30363d] bg-[#161b22] shadow-md mobile:w-full mobile:flex-none">
          <div className="flex w-full items-center justify-between border-b border-solid border-[#30363d] px-4 py-3 gap-2">
            <div className="flex items-center gap-2">
              <svg
                className="text-section-header font-section-header text-subtext-color"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V9h5.5zM8 13v2h8v-2zm0 4v2h5v-2z"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
              <span className="text-section-header font-section-header text-[#ffffff]">
                Detalhes da evidência
              </span>
            </div>
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md cursor-pointer hover:bg-neutral-600">
              <svg
                className="text-body font-body text-subtext-color"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"
                  fill="currentColor"
                  fillOpacity="1"
                />
              </svg>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-2 px-4 pt-4">
            <div className="flex h-[200px] w-full flex-none items-start overflow-hidden rounded-md relative">
              <img
                className="grow shrink-0 basis-0 self-stretch object-cover"
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80"
              />
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#010409b3] cursor-pointer absolute left-2 top-[84px] hover:bg-[#010409]">
                <svg
                  className="text-body font-body text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14.6 7 16 8.4 12.4 12l3.6 3.6-1.4 1.4-5-5z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#010409b3] cursor-pointer absolute right-2 top-[84px] hover:bg-[#010409]">
                <svg
                  className="text-body font-body text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9.4 7 8 8.4l3.6 3.6L8 15.6 9.4 17l5-5z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
              </div>
              <div className="flex items-center rounded-sm bg-[#010409b3] px-1.5 py-0.5 absolute left-2 bottom-2">
                <span className="text-monospace-body font-monospace-body text-default-font">
                  1 de 24
                </span>
              </div>
              <div className="flex h-7 items-center gap-1.5 rounded-md border border-solid border-[#3d444d] bg-neutral-600 px-2 cursor-pointer absolute right-2 bottom-2 hover:bg-neutral-border">
                <svg
                  className="text-caption font-caption text-default-font"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 4h6v2H7.4l3.3 3.3-1.4 1.4L6 7.4V10H4zm10 0h6v6h-2V7.4l-3.3 3.3-1.4-1.4L16.6 6H14zm-4.7 9.3 1.4 1.4L7.4 18H10v2H4v-6h2v2.6zm5.4 0 3.3 3.3V14h2v6h-6v-2h2.6l-3.3-3.3z"
                    fill="currentColor"
                    fillOpacity="1"
                  />
                </svg>
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-default-font">
                  Abrir imagem
                </span>
              </div>
            </div>
            <div className="flex w-full items-center gap-2">
              <img
                className="h-12 w-12 flex-none rounded-sm border-2 border-solid border-brand object-cover"
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&q=80"
              />
              <img
                className="h-12 w-12 flex-none rounded-sm border border-solid border-[#30363d] object-cover opacity-70 hover:opacity-100"
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&q=80"
              />
              <img
                className="h-12 w-12 flex-none rounded-sm border border-solid border-[#30363d] object-cover opacity-70 hover:opacity-100"
                src="https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=200&q=80"
              />
              <img
                className="h-12 w-12 flex-none rounded-sm border border-solid border-[#30363d] object-cover opacity-70 hover:opacity-100"
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80"
              />
            </div>
          </div>
          <div className="flex w-full flex-col items-start pt-2">
            <div className="flex w-full items-center justify-between border-b border-solid border-[#21262d] px-4 py-2.5 gap-3">
              <span className="text-caption font-caption text-subtext-color">
                Local
              </span>
              <span className="text-label font-label text-default-font text-right">
                Edifício A / 2º Pavimento
              </span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-solid border-[#21262d] px-4 py-2.5 gap-3">
              <span className="text-caption font-caption text-subtext-color">
                Marco construtivo
              </span>
              <span className="text-label font-label text-default-font text-right">
                Laje concretada
              </span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-solid border-[#21262d] px-4 py-2.5 gap-3">
              <span className="text-caption font-caption text-subtext-color">
                Data e horário
              </span>
              <span className="text-monospace-body font-monospace-body text-default-font text-right">
                12/10/2026 · 14:32:05
              </span>
            </div>
            <div className="flex w-full items-center justify-between border-b border-solid border-[#21262d] px-4 py-2.5 gap-3">
              <span className="text-caption font-caption text-subtext-color">
                Responsável técnico
              </span>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-primary">
                  <span className="font-caption-bold text-[#ffffff] text-[9px] leading-3">
                    MA
                  </span>
                </div>
                <span className="text-label font-label text-default-font">
                  Marina Albuquerque
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-2 border-b border-solid border-[#21262d] px-4 py-3">
            <span className="text-caption font-caption text-subtext-color">
              Descrição técnica
            </span>
            <div className="flex w-full items-start rounded-md border border-solid border-[#30363d] bg-[#0d1117] px-3 py-3">
              <span className="text-caption font-caption text-default-font">
                Registro fotográfico da concretagem estrutural da laje do 2º
                pavimento com slump test 12±2cm e moldagem de 6 corpos de prova
                cilíndricos para rompimento em 7, 14 e 28 dias.
              </span>
            </div>
          </div>
          <div className="flex w-full items-center justify-between border-b border-solid border-[#21262d] px-4 py-2.5 gap-3">
            <span className="text-caption font-caption text-subtext-color">
              Status de validação
            </span>
            <StatusBadge variant="success" label="Validada" />
          </div>
          <div className="flex w-full items-center justify-between px-4 py-2.5 gap-3">
            <span className="text-caption font-caption text-subtext-color">
              Contrato vinculado
            </span>
            <span className="text-monospace-body font-monospace-body text-brand text-right cursor-pointer hover:underline">
              CTR-2026-042 (Alpha Concreto)
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-2 border-t border-solid border-[#30363d] px-4 py-4">
            <Button
              className="h-8 w-full flex-none"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              Alterar validação
            </Button>
            <div className="flex w-full items-center gap-2">
              <Button
                className="h-8 grow shrink-0 basis-0"
                variant="secondary"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Baixar foto
              </Button>
              <Button
                className="h-8 grow shrink-0 basis-0"
                variant="secondary"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Compartilhar
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DocumentosEvidenciasDaObra;



```
