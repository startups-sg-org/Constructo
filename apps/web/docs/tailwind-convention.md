# Convenção de estilização Tailwind

## Tokens

- Definir tokens visuais em `src/index.css`, dentro de `@theme`.
- Usar os nomes `constructo-*` para cores da identidade visual.
- Reutilizar `--radius-campo`, `--radius-card` e `--shadow-card` em vez de repetir valores.
- Manter as variáveis CSS legadas enquanto houver componentes CSS ainda não migrados.

## Componentes e classes

- Preferir utilitários Tailwind diretamente no JSX para layout, espaçamento, tipografia e estados simples.
- Reutilizar as primitives de `src/componentes/ui/Ui.tsx` para botões, formulários, cards, tabelas e grids.
- Reutilizar as classes globais `ds-*` de `src/index.css` para padrões visuais repetidos entre componentes, como foco, painéis, campos, itens de menu e status.
- Criar uma nova classe `ds-*` somente quando a mesma combinação aparecer em mais de um componente; variantes e ajustes exclusivos permanecem no JSX.
- Evitar construir nomes de classes dinamicamente; quando uma classe variar, mapear valores para strings completas.
- Manter arquivos CSS locais somente para animações, pseudo-elementos, layouts muito específicos ou estilos ainda em migração.

## Validação

- Executar `pnpm --filter web lint` e `pnpm --filter web build` antes de concluir uma migração.
- Conferir loading, erro, vazio, foco visível e comportamento mobile nas rotas alteradas.
- Não introduzir dependências de Bootstrap ou Sass em novos componentes.

## Rollback

Se uma migração causar regressão visual ou funcional, reverter o commit da etapa correspondente e manter o componente no CSS legado até que a substituição possa ser refeita. Não remover tokens legados ou arquivos CSS compartilhados enquanto ainda houver consumidores.
