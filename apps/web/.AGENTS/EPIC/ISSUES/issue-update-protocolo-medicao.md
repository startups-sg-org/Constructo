## {FRONT} - issue destinada criar os componentes para a tela de medição / protocolos de medição



-- utilizar o desyn system base
-- refatorar a referencia para criar os componentes com base no sistema

# Plan

Refatorar a experiência de protocolos de medição conforme a referência da issue, reutilizando os contratos atuais de protocolos de evidência e mantendo cada protocolo vinculado a um marco.

## Scope

- In: tela em três painéis, listagem e pesquisa, criação e edição, itens obrigatórios/opcionais, pré-visualização, estados de carregamento/erro/vazio, responsividade, Tailwind e testes do front-end.
- Out: alterações no backend, upload ou conclusão de evidências, drag-and-drop, exclusão de protocolos e mudança na semântica de `quantidade_minima`.

## Action items

[x] Validar e documentar no front-end o contrato existente: protocolo pertence a um marco, `quantidade_minima` representa a quantidade mínima de evidências e os itens podem ser obrigatórios ou opcionais.

Contrato validado com os schemas do backend e documentado nos tipos do serviço de evidências, sem alterações na API.

[x] Ajustar `protocolos.loader.ts`, `protocolos.action.ts` e os tipos relacionados para fornecer o contexto necessário à tela, preservar rascunhos em erros, tratar cancelamentos e retornar erros de validação utilizáveis pelos formulários.

Loader e action agora informam modo e rota-base, validam campos com Zod, devolvem erros por campo e propagam cancelamentos sem apagar o rascunho.

[x] Refatorar `ProtocolList` e `ProtocolEditor` em um workspace integrado de três painéis para o marco atual: lista de protocolos, formulário de configuração e pré-visualização, preservando as URLs profundas de criação e edição.

Listagem, editor e prévia foram unificados em um workspace responsivo, mantendo as rotas de listagem, criação e edição.

[x] Implementar no painel lateral a pesquisa por nome, seleção do protocolo, destaque do item ativo, contagem real de itens e obrigatórios e estados vazio e sem resultados.

O painel lateral agora pesquisa por nome, destaca a rota ativa e calcula as contagens diretamente dos itens retornados pela API.

[x] Refatorar `ProtocolForm` conforme o design de referência, mantendo os campos suportados pelo backend e identificando corretamente `quantidade_minima` como “Quantidade mínima de evidências”.

O formulário foi redesenhado com os campos reais do backend, ajuda contextual, erros acessíveis e ações de salvar e cancelar.

[x] Refatorar `ProtocolItemList` e `ProtocolItem` para permitir adicionar, editar, ordenar numericamente e remover itens, exibindo claramente o nome, a descrição e a condição obrigatória ou opcional.

Os itens ganharam criação expansível, edição completa, ordem numérica, remoção e identificação visual de obrigatório ou opcional.

[x] Refatorar `ProtocolPreview` para refletir imediatamente o rascunho do formulário, os itens ordenados, a quantidade de obrigatórios e o mínimo de evidências, sem simular um estado de conclusão inexistente no backend.

A prévia acompanha o rascunho e apresenta itens, obrigatórios e mínimo de evidências sem criar estados de conclusão fictícios.

[x] Integrar a entrada da área de medições com o gerenciador de protocolos, tratando empreendimento sem taxonomia, sem marcos e marco sem protocolos, sem alterar o fluxo de protocolos recentes já existente.

A área de medições agora oferece criação e gerenciamento por marco e orienta corretamente nos três estados vazios previstos.

[x] Remover o CSS legado de `ProtocolEditor.css` e migrar a interface para Tailwind e classes globais do design system, com layout responsivo que empilhe os painéis em telas menores.

O CSS legado foi removido e todos os componentes usam Tailwind e primitivas `ds-*`, com três colunas no desktop e empilhamento responsivo.

[x] Atualizar os testes de protocolos para cobrir pesquisa, seleção, criação, edição, prévia em tempo real, itens obrigatórios/opcionais, ordenação, remoção, erros, carregamento e estados vazios; validar com lint, testes do web e build.

Foram adicionados 10 testes direcionados, todos aprovados; lint e build também passaram. A suíte completa mantém três falhas preexistentes fora deste fluxo.

[x] Restringir o acesso aos protocolos de medição à aba interna de cada empreendimento e impedir que falhas parciais derrubem a página.

Foi removida a entrada global de medições e a rota interna passou a tratar falhas parciais sem acionar a tela geral de erro.

[x] Garantir que protocolos persistidos apareçam na listagem de medições do empreendimento, mesmo quando a consulta resumida de protocolos recentes falhar.

A listagem agora consulta os protocolos de cada marco da taxonomia, preserva resultados parciais, elimina duplicados e mantém a ordenação pelos mais recentes.

A opção global de medições e sua rota foram removidas; a aba da obra continua disponível e uma falha ao buscar protocolos recentes agora é exibida localmente sem acionar a página “Ops”.

## Open questions

- A rota geral `/medicoes` deve futuramente concentrar protocolos de todos os marcos, ou continuar funcionando como entrada para o gerenciador de cada marco? O backend atual favorece a segunda opção.

```
"use client";

import React from "react";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { ChecklistItemRow } from "@/ui/components/ChecklistItemRow";
import { ProtocolListItem } from "@/ui/components/ProtocolListItem";
import { SidebarNavItem } from "@/ui/components/SidebarNavItem";
import { Tabs } from "@/ui/components/Tabs";
import { TextArea } from "@/ui/components/TextArea";
import { TextField } from "@/ui/components/TextField";
import Bell from "@/ui/icons/Bell";
import Building from "@/ui/icons/Building";
import ChartColumn from "@/ui/icons/ChartColumn";
import ChevronDown from "@/ui/icons/ChevronDown";
import Eye from "@/ui/icons/Eye";
import FileText from "@/ui/icons/FileText";
import Folder from "@/ui/icons/Folder";
import Home from "@/ui/icons/Home";
import Pencil from "@/ui/icons/Pencil";
import Plus from "@/ui/icons/Plus";
import Search from "@/ui/icons/Search";
import Tags from "@/ui/icons/Tags";
import Users from "@/ui/icons/Users";
import Workflow from "@/ui/icons/Workflow";

function ProtocolosDeMedicao() {
  return (
    <div className="flex h-full w-full bg-canvas items-stretch">
      <aside className="flex w-[220px] flex-none flex-col items-start gap-6 self-stretch border-r border-solid border-border-muted bg-surface-muted px-3 py-3 mobile:hidden">
        <div className="flex w-full items-center gap-3 px-3 py-3">
          <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-brand-primary">
            <span className="text-label-md font-label-md text-fg-strong">
              C
            </span>
          </div>
          <span className="text-headline-md font-headline-md text-fg-strong">
            Constructo
          </span>
        </div>
        <nav className="flex w-full flex-col items-start gap-1">
          <SidebarNavItem text="Home" icon={<Home />} />
          <SidebarNavItem text="Usuários" icon={<Users />} />
          <SidebarNavItem
            text="Empreendimentos"
            icon={<Building />}
            selected={true}
          />
          <SidebarNavItem text="Contratos" icon={<FileText />} />
          <SidebarNavItem text="Medições" icon={<ChartColumn />} />
        </nav>
      </aside>
      <main className="flex min-w-[0px] grow shrink-0 basis-0 flex-col items-start self-stretch">
        <header className="flex h-[60px] w-full flex-none items-center justify-between border-b border-solid border-border-muted px-6 mobile:px-4">
          <div className="flex items-center gap-2">
            <span className="text-body-md font-body-md text-subtext-color mobile:hidden">
              Empreendimentos
            </span>
            <span className="text-body-md font-body-md text-subtext-color mobile:hidden">
              /
            </span>
            <span className="text-body-md font-body-md text-default-font">
              Horizonte Corporate
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-headline-md font-headline-md text-subtext-color" />
            <div className="flex h-8 w-px flex-none items-start bg-border-muted" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-neutral-300">
                <span className="text-label-sm font-label-sm text-default-font">
                  MA
                </span>
              </div>
              <span className="text-label-md font-label-md text-default-font mobile:hidden">
                Marina Albuquerque
              </span>
              <ChevronDown className="text-body-md font-body-md text-subtext-color" />
            </div>
          </div>
        </header>
        <div className="flex w-full flex-col items-start gap-5 border-b border-solid border-border-muted bg-surface-muted px-6 pt-6 mobile:px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-headline-lg font-headline-lg text-fg-strong">
              Horizonte Corporate
            </h1>
            <Badge text="Em andamento" variant="in-progress" showDot={true} />
          </div>
          <Tabs className="border-none overflow-x-auto">
            <Tabs.Item text="Visualizar" icon={<Eye />} />
            <Tabs.Item text="Editar" icon={<Pencil />} />
            <Tabs.Item text="Estrutura" icon={<Workflow />} />
            <Tabs.Item text="Taxonomia" icon={<Tags />} />
            <Tabs.Item text="Contratos" icon={<FileText />} />
            <Tabs.Item text="Medições" icon={<ChartColumn />} active={true} />
            <Tabs.Item text="Documentos" icon={<Folder />} />
          </Tabs>
        </div>
        <div className="flex w-full flex-col items-start gap-6 px-6 py-6 mobile:px-4">
          <div className="flex w-full items-center justify-between gap-4 mobile:flex-col mobile:items-start">
            <div className="flex flex-col items-start gap-1">
              <h2 className="text-headline-md font-headline-md text-fg-strong">
                Protocolos de medição
              </h2>
              <p className="text-body-md font-body-md text-subtext-color">
                Configure os checklists utilizados nas medições da obra.
              </p>
            </div>
            <Button
              className="mobile:w-full"
              variant="success"
              icon={<Plus />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            >
              Criar protocolo
            </Button>
          </div>
          <div className="flex w-full items-start gap-4 mobile:flex-col">
            <div className="flex w-48 flex-none flex-col items-start gap-4 rounded-lg border border-solid border-border-card bg-surface px-2 py-4 mobile:w-full mobile:flex-none">
              <h3 className="text-headline-sm font-headline-sm text-default-font px-1">
                Protocolos
              </h3>
              <TextField
                className="h-auto w-full flex-none"
                label=""
                helpText=""
                size="small"
                icon={<Search />}
              >
                <TextField.Input
                  placeholder="Buscar protocolo..."
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
              <div className="flex w-full flex-col items-start gap-1">
                <ProtocolListItem
                  title="Inspeção de alvenaria"
                  meta="4 itens • 2 obrigatórios"
                  selected={true}
                />
                <ProtocolListItem
                  title="Concretagem"
                  meta="5 itens • 3 obrigatórios"
                />
                <ProtocolListItem
                  title="Instalações elétricas"
                  meta="6 itens • 2 obrigatórios"
                />
              </div>
            </div>
            <div className="flex min-w-[0px] grow shrink-0 basis-0 flex-col items-start gap-4 rounded-lg border border-solid border-border-card bg-surface px-4 py-5 mobile:py-4">
              <h3 className="text-headline-sm font-headline-sm text-default-font">
                Editar protocolo
              </h3>
              <TextField
                className="h-auto w-full flex-none"
                label="Nome"
                required={true}
                helpText=""
              >
                <TextField.Input
                  placeholder=""
                  value="Inspeção de alvenaria"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
              <TextArea
                className="h-auto w-full flex-none"
                label="Descrição"
                helpText=""
              >
                <TextArea.Input
                  placeholder=""
                  value="Verificação dos serviços de alvenaria antes da aprovação da medição."
                  onChange={(
                    event: React.ChangeEvent<HTMLTextAreaElement>
                  ) => {}}
                />
              </TextArea>
              <TextField
                className="h-auto w-full flex-none"
                label="Quantidade mínima de itens concluídos"
                required={true}
                helpText="Os 2 itens obrigatórios também devem ser concluídos."
              >
                <TextField.Input
                  type="number"
                  placeholder=""
                  value="3"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
              <div className="flex h-px w-full flex-none items-start bg-border-muted" />
              <div className="flex w-full items-center justify-between">
                <h3 className="text-headline-sm font-headline-sm text-default-font">
                  Itens do checklist
                </h3>
                <Button
                  className="text-success-fg"
                  variant="ghost"
                  size="small"
                  icon={<Plus />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Adicionar item
                </Button>
              </div>
              <div className="flex w-full flex-col items-start gap-2">
                <ChecklistItemRow
                  index="1"
                  text="Conferir alinhamento"
                  requirement="required"
                />
                <ChecklistItemRow
                  index="2"
                  text="Conferir prumo"
                  requirement="required"
                />
                <ChecklistItemRow
                  index="3"
                  text="Verificar juntas"
                  requirement="optional"
                />
                <ChecklistItemRow
                  index="4"
                  text="Registrar fotos"
                  requirement="optional"
                />
              </div>
              <div className="flex h-px w-full flex-none items-start bg-border-muted" />
              <div className="flex w-full items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Salvar alterações
                </Button>
              </div>
            </div>
            <div className="flex w-[184px] flex-none flex-col items-start gap-3 rounded-lg border border-solid border-border-card bg-surface px-3 py-4 mobile:w-full mobile:flex-none">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-label-md font-label-md text-default-font">
                  Prévia do checklist
                </span>
                <Badge text="Simulação" variant="planned" />
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <span className="text-title-project font-title-project text-default-font">
                  Inspeção de alvenaria
                </span>
                <p className="text-body-sm font-body-sm text-subtext-color">
                  Verificação dos serviços de alvenaria antes da aprovação da
                  medição.
                </p>
              </div>
              <div className="flex h-px w-full flex-none items-start bg-border-muted" />
              <div className="flex w-full flex-col items-start gap-2">
                <Checkbox
                  label="Conferir alinhamento"
                  required={true}
                  checked={false}
                  onCheckedChange={(checked: boolean) => {}}
                />
                <Checkbox
                  label="Conferir prumo"
                  required={true}
                  checked={false}
                  onCheckedChange={(checked: boolean) => {}}
                />
                <Checkbox
                  label="Verificar juntas"
                  checked={false}
                  onCheckedChange={(checked: boolean) => {}}
                />
                <Checkbox
                  label="Registrar fotos"
                  checked={false}
                  onCheckedChange={(checked: boolean) => {}}
                />
              </div>
              <div className="flex h-px w-full flex-none items-start bg-border-muted" />
              <span className="text-label-sm font-label-sm text-default-font">
                0 de 4 itens concluídos
              </span>
              <div className="flex h-1 w-full flex-none items-start overflow-hidden rounded-full bg-neutral-300">
                <div className="flex w-0 flex-none items-start self-stretch rounded-full bg-success-solid" />
              </div>
              <p className="text-body-sm font-body-sm text-subtext-color">
                Mínimo: 3 itens, incluindo os 2 obrigatórios.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProtocolosDeMedicao;


```
