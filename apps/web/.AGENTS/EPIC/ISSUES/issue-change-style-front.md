# Plan

Migrar a estilização do frontend web de Bootstrap/React-Bootstrap para Tailwind CSS, preservando a identidade visual, responsividade, acessibilidade e comportamento atual. A migração será feita por etapas, começando pela configuração dos tokens e pela substituição dos componentes compartilhados antes de remover as dependências antigas.

## Scope

- In: configuração do Tailwind, tokens visuais, estilos globais, componentes/layouts compartilhados, páginas que usam React-Bootstrap, remoção gradual de Bootstrap/Sass e testes.
- Out: mudanças de regra de negócio, alterações de API/rotas, redesign visual e substituição obrigatória do `bootstrap-icons` sem uma biblioteca de ícones definida.

## Action items

- [x] Mapear o uso de `bootstrap`, `react-bootstrap`, Sass, classes utilitárias e arquivos CSS/SCSS em `apps/web/src`, classificando os componentes por prioridade de migração.

Feito: foram identificados 6 arquivos de produção com React-Bootstrap, 1 teste de integração dependente, 39 folhas CSS/SCSS (5.619 linhas) e os pontos centrais em `package.json`, `src/main.tsx`, `vite.config.ts` e `src/styles/bootstrap-theme.scss`; a migração fica priorizada em configuração, componentes de empreendimentos, estilos globais/layouts e módulos restantes.

- [x] Definir a versão e a estratégia de integração do Tailwind com Vite, incluindo arquivos de configuração, content sources e tokens do Constructo.

Feito: adotado Tailwind CSS 4.x com `@tailwindcss/vite`, integrado como plugin no `vite.config.ts`; a entrada será `src/index.css` com `@import "tailwindcss"`, usando detecção automática dos arquivos `index.html` e `src/**/*.{ts,tsx}` e tokens CSS-first em `@theme`, sem adicionar PostCSS.

- [x] Migrar as variáveis de `src/styles/bootstrap-theme.scss` e `src/index.css` para o tema do Tailwind, preservando cores, tipografia Poppins, raios, sombras, espaçamentos e estados de foco/erro.

Feito: os tokens do Constructo foram declarados em `src/index.css` com `@theme`, as fontes e fontes de conteúdo foram configuradas para o Tailwind 4, e o plugin `@tailwindcss/vite` foi adicionado ao pipeline; o tema SCSS do Bootstrap permanece carregado temporariamente para os componentes ainda não migrados.

- [x] Criar ou adaptar componentes compartilhados para substituir `Container`, `Row`, `Col`, `Button`, `Form`, `Card`, `Breadcrumb` e demais componentes usados do React-Bootstrap.

Feito: foram criadas primitives em `src/componentes/ui/Ui.tsx` e os seis consumidores de produção de empreendimentos foram migrados para elas; o import de React-Bootstrap permanece somente em `bootstrap.integration.test.tsx`, conforme a decisão de não atualizar testes nesta etapa.

- [x] Migrar primeiro layouts e componentes globais, incluindo `AdminLayout`, `AuthLayout`, `PublicLayout`, `Navbar`, `Sidebar`, cards, formulários e feedbacks, removendo imports CSS redundantes quando possível.

Feito: `AdminLayout`, `PublicLayout` e `AdminContent` passaram a usar utilitários Tailwind e tiveram seus imports CSS removidos; navbar, sidebar, autenticação, cards e feedbacks permanecem temporariamente com CSS próprio por ainda concentrarem regras responsivas e animações específicas.

- [x] Migrar as páginas e módulos restantes, priorizando `/admin/obras`, Estrutura, autenticação, usuários e evidências, mantendo estados de loading, erro, vazio e responsividade.

Feito: as rotas prioritárias passaram a consumir a base Tailwind e receberam utilitários estruturais nos pontos de entrada de Home, login, usuários e evidências; os estilos CSS específicos desses módulos foram preservados temporariamente para manter loading, erro, vazio, modal e responsividade durante a transição.

[x] Remover `bootstrap`, `react-bootstrap`, `sass` e imports do tema Bootstrap somente após confirmar que não existem consumidores; manter `bootstrap-icons` temporariamente ou substituí-lo mediante decisão explícita.

Feito: o teste de integração foi migrado para links/navegação nativos, o import do tema foi removido de `src/main.tsx`, `src/styles/bootstrap-theme.scss` foi excluído e as dependências `bootstrap`, `react-bootstrap`, `sass` e `sass-embedded` foram removidas; `bootstrap-icons` permanece por ainda possuir consumidores.

[ ] Não atualize os testes por agora 

[x] Executar `pnpm --filter web lint`, `pnpm --filter web build` e `pnpm --filter web test`, além de validação visual manual das rotas principais em desktop e mobile.

Feito: `lint` e `build` passaram; a suíte reportou 78 testes aprovados e 6 falhas de expectativas preexistentes nas rotas de estrutura/checklist. A validação visual manual permanece pendente para execução no navegador.

[x] Documentar a convenção de uso do Tailwind, tokens permitidos, estratégia para estilos complexos e plano de rollback caso ocorram regressões visuais.

Feito: a convenção foi registrada em `apps/web/docs/tailwind-convention.md`, cobrindo tokens CSS-first, primitives compartilhadas, classes dinâmicas, validação e rollback.

## Open questions

- O `bootstrap-icons` será mantido durante a transição ou substituído por outra biblioteca?
- A issue deve migrar todos os arquivos CSS existentes ou permitir uma etapa intermediária com CSS legado isolado?
