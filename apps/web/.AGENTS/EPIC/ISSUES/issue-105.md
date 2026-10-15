### FRONT-105 — Tratar estados de carregamento, vazio e erro da listagem

**Objetivo**

Fazer a tela comunicar claramente a situação dos dados, sem confundir
listagem ainda carregando, coleção sem cadastros, filtros sem resultado e erro
de carregamento.

**Escopo**

- Skeleton/placeholder de tabela durante a navegação ou revalidação do loader.
- Estado vazio inicial com chamada para criar o primeiro empreendimento.
- Estado “nenhum resultado” para busca/filtro, com ação de limpar controles.
- Estado de erro local com mensagem compreensível e ação de tentar novamente,
  preservando o tratamento global de rotas para erros irrecuperáveis.
- Testes de interface para cada estado e para as interações da listagem.

**Critérios de aceite**

- [ ] Carregamento não apresenta tabela vazia como se não houvesse dados.
- [ ] Sem cadastros, a tela explica a ausência e oferece acesso à criação.
- [ ] Sem resultado de busca/filtro, a tela diferencia esse caso da ausência
  total e permite limpar os controles.
- [ ] Erros de consulta exibem mensagem, não quebram o layout e permitem nova
  tentativa.
- [ ] Há testes para navegação, busca, filtro, ordenação e os três estados.

**Dependências**

- `FRONT-102` e `FRONT-103`.
