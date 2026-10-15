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

- [x] Todos os itens retornados pelo loader aparecem uma única vez na lista.
- [x] As colunas são Empreendimento, Descrição, Localização, Status e Atualizado
  em; a ação de abertura tem rótulo acessível.
- [x] O status usa badge com os quatro valores já suportados pelo domínio.
- [x] Clicar no nome, ícone ou ação de abertura navega para
  `/admin/empreendimentos/:empreendimentoId` correto.
- [x] Navegação por teclado alcança e aciona cada destino sem transformar a
  linha inteira em elemento interativo inválido.

## Execução critério por critério

**Status:** implementada e verificada.

### Evidências

- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.tsx`
  renderiza uma tabela React-Bootstrap a partir da coleção do loader, sem
  duplicar itens, com as cinco colunas e ação `Abrir`.
- `apps/web/src/modulos/empreendimentos/componentes/empreendimentoFormatters.ts`
  fornece os rótulos e tons dos quatro status e a formatação da atualização.
- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.css`
  destaca o nome, mantém descrição/localização como metadados e estiliza o
  ícone Bootstrap de obra.
- `apps/web/src/router/router.tsx` mantém a rota de detalhe usada pelos links.
- `apps/web/src/router/router.test.tsx` cobre coleção completa, colunas,
  status, destino e semântica de foco/linha.

### Validação por critério

1. **Itens do loader:** validado com quatro empreendimentos e cinco linhas
   (cabeçalho + quatro itens), cada nome aparecendo uma única vez.
2. **Colunas e ação:** validado com `columnheader` para Empreendimento,
   Descrição, Localização, Status e Atualizado em; `Abrir` possui nome acessível.
3. **Status:** validado para Planejado, Em andamento, Concluído e Inativo com
   `BadgeStatus`.
4. **Navegação:** nome/ícone compartilham o link correto e `Abrir` aponta para
   `/admin/empreendimentos/:empreendimentoId`.
5. **Teclado/semântica:** destinos são links nativos focáveis; a linha não
   recebe `tabindex` nem handlers de clique próprios.

### Validações executadas

- `pnpm --filter web test src/router/router.test.tsx src/features/empreendimentos/empreendimentos.loaders.test` — 2 arquivos e 39 testes aprovados.
- `pnpm --filter web exec tsc --noEmit` — aprovado.
- `pnpm --filter web lint` — aprovado.
- `pnpm --filter web build` — aprovado; permanece apenas o aviso existente de
  tamanho do bundle.
- `git diff --check` — aprovado.
- `pytest` não foi executado.

### Pendências restantes

- Nenhuma pendência dentro do escopo da FRONT-102.
- Validação visual manual em navegador continua recomendada para densidade e
  comportamento responsivo.
