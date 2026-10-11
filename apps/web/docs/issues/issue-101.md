FRONT-101 — Estruturar o layout da listagem de empreendimentos
Objetivo

Criar a composição visual base da página, alinhada ao painel administrativo e ao tema React-Bootstrap + Sass, substituindo a grade de cartões pela área de listagem compacta.

Escopo

Cabeçalho com título “Empreendimentos”, texto de apoio e contador de itens.
Barra de ferramentas com busca, filtro de status, ordenação e botão “Criar empreendimento”, seguindo a hierarquia da referência.
Contêiner branco com borda sutil, cabeçalho de colunas e densidade de tabela adequada a um ERP.
Uso de tokens do tema, Container, Row, Col, Form e Button do React-Bootstrap; sem criar novos estilos globais.
Substituição visual apenas em /admin/obras; formulário existente permanece disponível abaixo ou sob demanda, sem reescrever seus campos.
## Critérios de aceite

- [x] A rota `/admin/obras` exibe título, apoio, contador e barra de ferramentas na ordem definida.
- [x] Busca e seletores permanecem agrupados; o botão de criação fica destacado e alinhado à direita em telas largas.
- [x] A página não utiliza a grade de cartões como apresentação principal.
- [x] A interface segue a paleta, tipografia, bordas e espaçamentos do tema Constructo configurado com Bootstrap.

## Dependências

- Configuração de React-Bootstrap + Sass concluída.
- A navegação usa a rota de detalhe existente.

## Implementação realizada

- `ListaEmpreendimentos.tsx` agora renderiza toolbar com busca, filtro de status,
  ordenação local, contador, limpeza de filtros e botão “Criar empreendimento”.
- A grade de cartões foi substituída por uma tabela compacta React-Bootstrap com
  nome, descrição, localização, status, atualização e abertura do detalhe.
- Busca por nome, descrição e endereço; filtro pelos quatro status do domínio;
  ordenação por atualização e nome.
- O CTA de criação aponta para o formulário existente por `#novo-empreendimento`;
  nenhum fluxo de cadastro ou rota foi alterado.
- O subtítulo de `/admin/obras` foi alinhado à referência visual.
- `router.test.tsx` foi atualizado para a tabela e ganhou cobertura de filtros,
  ordenação e CTA.

## Validação

- `pnpm --filter web test src/router/router.test.tsx`: aprovado — 35 testes.
- `pnpm --filter web build`: aprovado.
- `pnpm --filter web lint`: aprovado.
- `pnpm --filter web test`: 74 testes aprovados e 1 falha preexistente em
  `src/componentes/EvidenceChecklist/EvidenceChecklist.test.tsx`; o teste
  espera que `Visão geral` contenha também `Obrigatório`, enquanto o componente
  atual renderiza o rótulo em elemento separado. Nenhum arquivo desse
  componente foi alterado nesta issue.

## Pendências

- A validação visual manual em navegador continua recomendada para conferir
  densidade, alinhamento e comportamento responsivo em telas reais.
- A paginação e filtros persistidos em URL/backend permanecem fora do escopo.


# Verificação do agente arquiteto/verificador — FRONT-101

## Resumo

A FRONT-101 ainda não está implementada. A configuração React-Bootstrap + Sass está disponível, mas `/admin/obras` continua usando a grade de cartões atual e não possui a composição visual definida pela issue.

## Resultado por critério

- **Não atendido:** a rota ainda não possui barra de ferramentas com busca, filtro, ordenação e botão “Criar empreendimento”. Evidência: `ListaEmpreendimentos.tsx` e `PaginaPainel.tsx`.
- **Não atendido:** não há agrupamento de busca/seletores nem botão de criação alinhado à direita.
- **Não atendido:** a apresentação principal continua sendo uma grade de cartões (`lista-empreendimentos__grade`) renderizada por `CardEmpreendimento`.
- **Parcialmente atendido:** a paleta e o tema Bootstrap estão configurados em `src/styles/bootstrap-theme.scss`, mas a listagem ainda usa CSS próprio e não utiliza `Container`, `Row`, `Col`, `Form` ou `Button` do React-Bootstrap.

## Arquivos diretamente relacionados

- `apps/web/docs/issues/issue-101.md`
- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.tsx`
- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.css`
- `apps/web/src/modulos/empreendimentos/componentes/CardEmpreendimento.tsx`
- `apps/web/src/pages/Painel/PaginaPainel.tsx`
- `apps/web/src/router/router.tsx`
- `apps/web/src/features/empreendimentos/empreendimentos.loader.ts`
- `apps/web/src/styles/bootstrap-theme.scss`
- `apps/web/package.json`

## Dependências e riscos

- O loader atual retorna a coleção completa sem parâmetros de busca, filtro ou ordenação; esses comportamentos deverão ser locais nesta etapa.
- O formulário de criação está renderizado diretamente após a listagem em `/admin/obras`; o botão planejado precisa revelar ou focar esse formulário sem criar nova rota.
- A rota de detalhe já existe em `/admin/empreendimentos/:empreendimentoId`.
- A migração deve preservar os testes atuais de listagem, navegação, estado vazio, carregamento e erro.

## Validação executada

- `pnpm --filter web test src/router/router.test.tsx src/features/empreendimentos/empreendimentos.loaders.test`
- Resultado: **2 arquivos aprovados, 37 testes aprovados**.

Os testes atuais validam o comportamento existente, mas ainda não cobrem os critérios novos de layout, toolbar ou listagem compacta.

## Próxima implementação recomendada

1. Alterar `ListaEmpreendimentos` para renderizar cabeçalho da listagem e toolbar.
2. Substituir a grade de `CardEmpreendimento` por uma tabela/lista compacta.
3. Introduzir os componentes React-Bootstrap definidos na issue.
4. Criar testes para presença da toolbar, ação de criação e layout da listagem.
5. Atualizar os critérios da issue somente após validação visual e automatizada.
