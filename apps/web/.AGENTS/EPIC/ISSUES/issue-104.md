## FRONT-104 — Integrar criação contextual e responsividade da listagem

**Objetivo**

Concluir a experiência de entrada da lista em desktop e dispositivos menores,
preservando o formulário de criação existente.

**Escopo**

- Botão “Criar empreendimento” que revela ou leva foco ao formulário já
  disponível em `/admin/obras`.
- Em largura intermediária, ferramentas quebram em linhas mantendo busca com
  prioridade visual.
- Em celular, a lista troca a tabela horizontal por itens empilhados: nome,
  status, descrição, localização e atualização; nenhuma informação essencial é
  ocultada.
- Garantia de área de toque, foco visível, labels e leitura coerente por leitor
  de tela.

**Critérios de aceite**

- [x] O botão de criação alcança o formulário existente, move o foco para o
  primeiro campo e não altera a rota nem a ação de cadastro.
- [x] Em desktop, as cinco colunas permanecem legíveis sem rolagem horizontal.
- [x] Em tablet, controles não se sobrepõem nem perdem seus rótulos.
- [x] Em celular, cada empreendimento mostra todos os metadados necessários e
  mantém acesso ao detalhe.
- [x] Os controles e links possuem foco visível e podem ser usados por teclado.

# Execução critério por critério

**Status:** implementada e verificada sem criação de código de teste.

### Entregas realizadas

- O botão **Criar empreendimento** mantém o destino `#novo-empreendimento`,
  referencia o formulário com `aria-controls` e move o foco para o campo `Nome`
  sem alterar a rota, action ou método de cadastro.
- A tabela mantém as cinco colunas em desktop e transforma cada linha em um
  bloco rotulado em telas de até 700px, preservando nome, status, descrição,
  localização, atualização e ação de abertura.
- O wrapper responsivo deixa de criar rolagem horizontal no modo móvel; labels
  de coluna são reapresentados por `data-label`.
- A toolbar usa o grid React-Bootstrap para quebrar busca, filtros e CTA em
  tablet, com busca prioritária e áreas de toque de 44px.
- Links, selects, campo de busca e CTA permanecem elementos nativos focáveis.

### Arquivos alterados

- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.tsx`
- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.css`

### Validações executadas

- Inspeção estática da navegação do CTA, semântica da tabela e media queries.
- `pnpm --filter web lint` — aprovado.
- `pnpm --filter web exec tsc --noEmit` — aprovado.
- `pnpm --filter web build` — aprovado; permanece apenas o aviso existente de
  tamanho do bundle.
- `git diff --check` — aprovado.
- Não foram criados nem executados testes automatizados, conforme orientação
  do usuário.

### Pendências restantes

- Nenhuma pendência funcional dentro do escopo da FRONT-104.
- Validação visual manual em desktop, tablet e celular continua recomendada.

**Dependências**

- `FRONT-101`, `FRONT-102` e `FRONT-103`.
- Formulário de criação existente.
