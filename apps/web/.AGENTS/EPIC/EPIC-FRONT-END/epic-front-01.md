# EPIC-FRONT-01 — Listagem de empreendimentos

## Objetivo da épica

Reconfigurar exclusivamente a tela administrativa de listagem de
empreendimentos (`/admin/obras`) para uma experiência de ERP compacta, clara e
orientada à consulta. A referência visual é a seção superior da imagem
**Constructo — lista e detalhe de empreendimentos**: cabeçalho, barra de
ferramentas e tabela. A inspiração comportamental é a lista de repositórios do
GitHub: itens facilmente escaneáveis, nome como ponto principal de navegação,
metadados secundários e filtros simples.

Não fazem parte desta épica a tela de detalhe, as abas internas do
empreendimento, criação/edição do cadastro, estrutura física, taxonomia,
contratos, medições ou alterações de API/backend.

## Decisões de produto

- A listagem exibirá os dados já disponíveis no contrato `Empreendimento`:
  nome, descrição, endereço, status e `atualizado_em`. A coluna **Localização**
  exibirá o endereço recebido, sem tentar inferir cidade ou UF.
- Busca, filtro e ordenação serão locais, sobre a coleção já carregada pelo
  loader `carregarEmpreendimentos`; esta épica não adiciona query params,
  paginação ou filtros no backend.
- A ordenação inicial será **Atualizado mais recentemente**. As opções serão:
  atualizado mais recentemente, atualizado há mais tempo, nome A–Z e nome Z–A.
- O filtro de status terá as opções Todos, Planejado, Em andamento, Concluído e
  Inativo. A busca será sem diferenciação de maiúsculas/minúsculas e por nome,
  descrição ou endereço.
- Clicar no nome, no ícone ou em uma área de linha explicitamente interativa
  abrirá `/admin/empreendimentos/:empreendimentoId`. Controles dentro da linha
  não podem disparar essa navegação acidentalmente.
- O botão **Criar empreendimento** reutilizará o formulário já existente na
  própria rota: revela/posiciona o foco no formulário de cadastro. Ele não cria
  nova rota nem altera o fluxo de persistência.

## Issues de implementação

### FRONT-101 — Estruturar o layout da listagem de empreendimentos

**Objetivo**

Criar a composição visual base da página, alinhada ao painel administrativo e
ao tema React-Bootstrap + Sass, substituindo a grade de cartões pela área de
listagem compacta.

**Escopo**

- Cabeçalho com título “Empreendimentos”, texto de apoio e contador de itens.
- Barra de ferramentas com busca, filtro de status, ordenação e botão “Criar
  empreendimento”, seguindo a hierarquia da referência.
- Contêiner branco com borda sutil, cabeçalho de colunas e densidade de tabela
  adequada a um ERP.
- Uso de tokens do tema, `Container`, `Row`, `Col`, `Form` e `Button` do
  React-Bootstrap; sem criar novos estilos globais.
- Substituição visual apenas em `/admin/obras`; formulário existente permanece
  disponível abaixo ou sob demanda, sem reescrever seus campos.

**Critérios de aceite**

- [ ] A rota `/admin/obras` exibe título, apoio, contador e barra de
  ferramentas na ordem definida.
- [ ] Busca e seletores permanecem agrupados; o botão de criação fica destacado
  e alinhado à direita em telas largas.
- [ ] A página não utiliza a grade de cartões como apresentação principal.
- [ ] A interface segue a paleta, tipografia, bordas e espaçamentos do tema
  Constructo configurado com Bootstrap.

**Dependências**

- Configuração de React-Bootstrap + Sass concluída.
- `FRONT-102` para preencher o contêiner com a listagem real.

### FRONT-102 — Implementar listagem compacta e navegação por empreendimento

**Objetivo**

Exibir os empreendimentos como uma lista tabular compacta, inspirada na
escaneabilidade da lista de repositórios do GitHub e na referência fornecida.

**Escopo**

- Uma linha por empreendimento, com ícone de obra, nome, descrição,
  localização/endereço, badge de status e data de atualização.
- Nome como informação de maior destaque visual; descrição e localização como
  metadados secundários.
- Reutilização dos formatadores atuais de status e data; endereços e descrições
  ausentes recebem texto de ausência padronizado.
- Nome, ícone e ação de abertura acessíveis por teclado e direcionados à rota de
  detalhe existente.
- Sem menu de ações, edição em linha ou carregamento de dados adicionais.

**Critérios de aceite**

- [ ] Todos os itens retornados pelo loader aparecem uma única vez na lista.
- [ ] As colunas são Empreendimento, Descrição, Localização, Status e Atualizado
  em; a ação de abertura tem rótulo acessível.
- [ ] O status usa badge com os quatro valores já suportados pelo domínio.
- [ ] Clicar no nome, ícone ou ação de abertura navega para
  `/admin/empreendimentos/:empreendimentoId` correto.
- [ ] Navegação por teclado alcança e aciona cada destino sem transformar a
  linha inteira em elemento interativo inválido.

**Dependências**

- `FRONT-101`.
- Loader e rota de detalhe existentes.

### FRONT-103 — Adicionar busca, filtro de status e ordenação local

**Objetivo**

Permitir localizar e organizar empreendimentos sem nova chamada à API, com
interações previsíveis para listas administrativas.

**Escopo**

- Campo de busca com rótulo acessível e placeholder “Buscar empreendimento...”.
- Filtro único de status e seletor de ordenação com os valores definidos nesta
  épica.
- Aplicação combinada dos controles à coleção do loader, sem mutá-la.
- Contador atualizado para a quantidade filtrada e mensagem clara quando a
  busca/filtros não retornarem itens.
- Estado dos controles mantido enquanto o usuário interage na rota atual;
  persistência em URL e backend ficam fora do escopo.

**Critérios de aceite**

- [ ] A busca encontra correspondências por nome, descrição ou endereço sem
  diferenciar maiúsculas de minúsculas.
- [ ] O filtro de status restringe a lista ao valor escolhido e “Todos” remove
  essa restrição.
- [ ] A ordenação produz resultados determinísticos para as quatro opções.
- [ ] Busca, filtro e ordenação funcionam em conjunto.
- [ ] O total e o estado vazio refletem a coleção após todos os controles.

**Dependências**

- `FRONT-102`.

### FRONT-104 — Integrar criação contextual e responsividade da listagem

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

- [ ] O botão de criação alcança o formulário existente, move o foco para o
  primeiro campo e não altera a rota nem a ação de cadastro.
- [ ] Em desktop, as cinco colunas permanecem legíveis sem rolagem horizontal.
- [ ] Em tablet, controles não se sobrepõem nem perdem seus rótulos.
- [ ] Em celular, cada empreendimento mostra todos os metadados necessários e
  mantém acesso ao detalhe.
- [ ] Os controles e links possuem foco visível e podem ser usados por teclado.

**Dependências**

- `FRONT-101`, `FRONT-102` e `FRONT-103`.
- Formulário de criação existente.

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

## Sequência de entrega

`FRONT-101` → `FRONT-102` → `FRONT-103` → `FRONT-104` e `FRONT-105`.

As issues `FRONT-104` e `FRONT-105` podem ser executadas em paralelo após a
listagem e seus controles estarem estáveis.
