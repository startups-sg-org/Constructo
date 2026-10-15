# Configuração inicial — React-Bootstrap e Sass

## Decisão

O front-end web do Constructo adotará **Bootstrap 5**, integrado por meio de
**React-Bootstrap**, e terá o tema visual compilado com **Sass**. Essa base será
usada na reconfiguração gradual das páginas administrativas para uma interface
de ERP, com referências de clareza, densidade e navegação do GitHub.

React-Bootstrap será a camada de componentes React; o JavaScript imperativo do
Bootstrap não será importado. Isso mantém estados e interações sob controle do
React e do React Router.

## Dependências

Adicionar ao pacote `apps/web`:

```bash
pnpm --filter web add bootstrap react-bootstrap
pnpm --filter web add -D sass
```

- `bootstrap`: estilos, grid, tokens Sass e utilitários.
- `react-bootstrap`: componentes React acessíveis que consomem o CSS do
  Bootstrap.
- `sass`: compilação do tema durante o build do Vite.

## Estrutura de estilos

Criar a seguinte estrutura:

```text
src/styles/
  bootstrap-theme.scss      # tokens do Constructo e importação do Bootstrap
  tokens.scss               # tokens Sass compartilhados, se necessário
  utilities.scss            # utilitários próprios, se necessários
```

`bootstrap-theme.scss` será o único ponto de importação do Bootstrap. Ele deve
definir os valores do Constructo antes da importação da biblioteca:

```scss
// src/styles/bootstrap-theme.scss
$font-family-sans-serif: "Poppins", system-ui, -apple-system, "Segoe UI", sans-serif;
$primary: #236557;
$success: #147a55;
$warning: #9a5b0a;
$danger: #a0443b;
$body-bg: #f5f7f6;
$body-color: #263b37;
$border-radius: .625rem;
$border-radius-lg: 1rem;
$border-color: #dfe5e3;

@import "bootstrap/scss/bootstrap";
```

Em `src/main.tsx`, a ordem de importação será:

```ts
import "./styles/bootstrap-theme.scss";
import "./index.css";
import "./componentes/PadroesPainel/PadroesPainel.css";
```

Os estilos específicos de componentes continuarão sendo importados pelos seus
respectivos arquivos `.tsx`. Estilos do Constructo carregados após o tema podem
complementar componentes sem alterar o núcleo do Bootstrap.

No `vite.config.ts`, as opções Sass devem manter `quietDeps: true` para não
exibir depreciações originadas pelo Sass interno do Bootstrap, e
`silenceDeprecations: ["import"]` para o único `@import` necessário no arquivo
de tema. Essas opções não silenciam avisos produzidos pelos estilos próprios do
Constructo.

## Uso com React e React Router

Usar componentes React-Bootstrap para elementos com comportamento, estados ou
acessibilidade já resolvidos:

- `Button`, `Form`, `Alert`, `Badge` e `Table` para ações, formulários,
  feedback e listagens.
- `Modal`, `Dropdown`, `Nav`, `Tabs` e `Offcanvas` para navegação contextual,
  menus e painéis.
- `Container`, `Row`, `Col`, `Card` e utilitários para layout responsivo.

Integrar links às rotas existentes por adaptadores que convertem `href` do
Bootstrap em `to` do React Router. Isso evita a incompatibilidade de tipagem
entre os componentes polimórficos do React-Bootstrap e `Link`/`NavLink` nesta
combinação de React e TypeScript:

```tsx
import type { AnchorHTMLAttributes } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

function RouterLink({ href = "/", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <Link to={href} {...props} />;
}

<Button as={RouterLink as unknown as "a"} href={`/admin/empreendimentos/${id}`} variant="primary">
  Abrir empreendimento
</Button>
```

Importar componentes individualmente, por exemplo
`react-bootstrap/Button`, para evitar carregar código não utilizado.

## Regras de migração e compatibilidade

- A migração será incremental: nenhuma rota, loader, action, contrato de API ou
  permissão será alterado apenas pela mudança visual.
- Manter inicialmente as classes atuais (`.botao`, `.campo`,
  `.superficie-painel`) nas telas ainda não convertidas.
- Antes de adotar `Card` do React-Bootstrap, renomear ou remover a classe global
  `.card` de `src/index.css`, pois ela conflita com `.card` do Bootstrap.
- Evitar novos estilos globais genéricos e não sobrescrever seletores internos
  do Bootstrap. Customizações recorrentes pertencem ao tema Sass ou a
  componentes próprios do Constructo.
- Criar wrappers próprios somente quando a mesma combinação de componente,
  variante e comportamento aparecer em mais de uma tela.
- Manter os SVGs atuais nesta fase; a adoção de uma biblioteca de ícones será
  uma decisão posterior.

## Ordem de reconfiguração das páginas

1. Configurar dependências, tema Sass e importações globais.
2. Converter componentes compartilhados do painel: botões, campos, badges,
   alertas e superfícies.
3. Converter o layout administrativo: sidebar, barra superior e conteúdo.
4. Reconfigurar Empreendimentos como listagem de ERP e, depois, criar a
   navegação em abas do empreendimento.
5. Migrar Usuários, Taxonomia, Estrutura física, Protocolos e as demais telas.

## Critérios de aceite da fundação

- `pnpm --filter web build`, `lint` e `test` continuam concluindo sem falhas.
- As rotas públicas, autenticação e painel atual não apresentam regressão
  visual ou funcional após carregar o tema.
- Um componente React-Bootstrap de cada grupo (botão, formulário, alerta,
  tabela e modal) é exibido com a paleta e tipografia do Constructo.
- Links renderizados por componentes React-Bootstrap preservam a navegação do
  React Router e seus estados ativos.
