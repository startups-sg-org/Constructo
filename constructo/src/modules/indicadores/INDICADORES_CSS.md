# Estilos dos indicadores

Este documento explica as decisões tomadas em `indicadores.css` para aproximar o módulo de indicadores do template visual fornecido.

## Objetivo

O CSS foi construído para apresentar os indicadores como um painel escuro e compacto, com:

- cards de métricas organizados em uma grade;
- fundo escuro com superfícies levemente mais claras;
- textos em alto contraste;
- cor turquesa para progresso e estados positivos;
- uma área maior para a etapa atual e sua barra de progresso;
- comportamento responsivo para telas menores.

Os valores continuam sendo fornecidos pelo React e pelos dados de `data.ts`. O CSS altera somente a apresentação.

## Variáveis de tema

As variáveis no início do arquivo centralizam a identidade visual do painel:

- `--indicadores-bg`: fundo geral quase preto, usado para criar o contraste do template.
- `--indicadores-surface`: cor dos cards.
- `--indicadores-border`: bordas discretas dos cards.
- `--indicadores-text`: texto principal, usado nos valores e títulos.
- `--indicadores-muted`: texto secundário, usado nos rótulos dos indicadores.
- `--indicadores-accent`: turquesa principal, usada no preenchimento da barra e no indicador positivo.
- `--indicadores-accent-dark`: trilho escuro atrás da barra de progresso.

Centralizar as cores evita repetir valores hexadecimais e facilita uma futura alteração do tema.

## Ajustes da página

### `body` e `#root`

O template inicial do Vite aplicava largura limitada, bordas laterais e alinhamento central ao `#root`. Essas regras foram sobrescritas para que o painel ocupe toda a largura disponível e use o fundo escuro de forma contínua.

O `text-align: left` também é necessário porque o template original centralizava todo o conteúdo.

### `.indicadores-page`

Define o espaço interno, a altura mínima da tela, o fundo e a cor padrão do módulo. O `box-sizing: border-box` mantém o tamanho previsível quando padding e largura são combinados.

### `.indicadores-page__header`

O cabeçalho de obra continua existindo no componente React e continua recebendo os dados, mas foi ocultado visualmente para que a primeira área apresentada seja a grade de indicadores, como no template da imagem. Isso é uma decisão de apresentação, não uma remoção de dados.

## Cards de indicadores

### `.indicadores-grid`

Usa CSS Grid com quatro colunas no desktop. Cada coluna utiliza `minmax(0, 1fr)` para dividir o espaço igualmente e evitar que textos longos aumentem um card de forma inesperada.

O `max-width` mantém o painel legível em telas grandes, enquanto `margin: 0 auto` centraliza a grade.

### `.indicator-card`

Os cards recebem:

- altura mínima estável;
- padding interno consistente;
- borda fina;
- cantos arredondados;
- fundo de superfície escuro.

A borda superior colorida que existia antes foi neutralizada para ficar mais próxima da referência, que usa uma borda uniforme e discreta.

### Rótulos e valores

`.indicator-card__label` usa tamanho menor, peso moderado e letras maiúsculas para funcionar como o rótulo visual da imagem.

`.indicator-card__value` recebe fonte maior e peso forte, fazendo o número ser o principal ponto de leitura do card.

A unidade, como `%`, herda o estilo do valor para permanecer alinhada visualmente.

### Conteúdo secundário

Tendência, descrição e evidência são ocultadas com `display: none` porque não aparecem no template visual. Os elementos continuam no JSX e podem ser reativados posteriormente sem alterar os dados.

### Indicador positivo

O pseudo-elemento em `.indicator-card--positive:last-child .indicator-card__value::before` cria o ponto turquesa usado no estado positivo do último card. `:last-child` evita inserir o ponto nos outros cards positivos.

## Área de etapa e progresso

### `.indicador-porcentagem` e `.indicator-card-load`

A seção de progresso ocupa uma linha própria abaixo dos cards. O card tem mais altura, padding maior e raio de borda mais amplo para funcionar como a área de destaque do template.

### Rótulo da etapa

O componente renderiza apenas o valor da etapa nessa área. O pseudo-elemento `::before` adiciona o texto visual `Etapa atual` acima desse valor, sem modificar o valor que vem dos dados.

### Barra de progresso

A barra é composta por três elementos:

1. `.indicator-card-load__track`: trilho escuro que representa a capacidade total.
2. `.indicator-card-load__fill`: preenchimento turquesa cuja largura é definida pelo React através do atributo `style`.
3. `.indicator-card-load__value`: etiqueta com o percentual atual, posicionada no canto superior direito.

O `overflow: hidden` no trilho garante que o preenchimento respeite os cantos arredondados. A transição de largura suaviza mudanças futuras no percentual.

## Estados do componente

`.indicadores-state` mantém mensagens de carregamento e estado vazio centralizadas e com cor discreta.

`.indicadores-state--error` usa uma cor avermelhada para diferenciar falhas sem quebrar o tema escuro.

## Responsividade

Em telas de até `760px`:

- a grade passa para duas colunas;
- os cards ficam menores;
- o espaçamento externo diminui;
- o card de progresso recebe menos padding.

Em telas de até `420px`, a grade passa para uma coluna. Isso evita cards estreitos e mantém os valores legíveis em celulares pequenos.

## Relação com o JSX

Os seletores principais correspondem às classes renderizadas em:

- `indicadores.tsx`: página, grade e seção de progresso;
- `IndicatorCard.tsx`: cards e valores individuais;
- `IndicatorCardLoad`: trilho, preenchimento e percentual da barra.

Por isso, alterações estruturais no JSX devem ser acompanhadas por uma revisão dos seletores deste arquivo.
