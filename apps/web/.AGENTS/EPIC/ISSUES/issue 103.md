### FRONT-103 — Adicionar busca, filtro de status e ordenação local

**Objetivo**

Permitir localizar e organizar empreendimentos sem nova chamada à API, com
interações previsíveis para listas administrativas. Utilizando BOOTSTRAP para estilização

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

- [x] A busca encontra correspondências por nome, descrição ou endereço sem
  diferenciar maiúsculas de minúsculas.
- [x] O filtro de status restringe a lista ao valor escolhido e “Todos” remove
  essa restrição.
- [x] A ordenação produz resultados determinísticos para as quatro opções.
- [x] Busca, filtro e ordenação funcionam em conjunto.
- [x] O total e o estado vazio refletem a coleção após todos os controles.

## Execução critério por critério

**Status:** implementada e verificada sem criação de código de teste.

### Evidências

- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.tsx`
  mantém busca, filtro e ordenação como estado local, deriva a coleção visível
  com `useMemo` e não muta o retorno do loader.
- A busca normaliza o termo com `toLocaleLowerCase("pt-BR")` e consulta nome,
  descrição e endereço.
- O filtro contempla `TODOS`, `PLANEJADO`, `EM_ANDAMENTO`, `CONCLUIDO` e
  `INATIVO`.
- A ordenação contempla atualização ascendente/descendente e nome A–Z/Z–A.
  Empates agora usam nome e ID como desempate determinístico.
- O contador usa `empreendimentosVisiveis.length`; o estado “Nenhum resultado
  encontrado” é separado do estado sem cadastros.

### Validação por critério

1. **Busca:** validada por inspeção do predicado que combina nome, descrição e
   endereço, ignorando maiúsculas/minúsculas e espaços externos.
2. **Filtro:** validado o valor `TODOS` e os quatro valores do domínio; o filtro
   é aplicado antes da ordenação.
3. **Ordenação:** validadas as quatro opções e o desempate por nome/ID para
   datas ou nomes iguais.
4. **Combinação:** busca, filtro e ordenação dependem do mesmo `useMemo`, sendo
   aplicados em conjunto sobre uma cópia da coleção.
5. **Contador/estado vazio:** contador usa a quantidade filtrada; coleção vazia
   e filtro sem correspondência renderizam estados distintos.

### Validações executadas

- Inspeção estática do componente e dos componentes React-Bootstrap da toolbar.
- `pnpm --filter web lint` — aprovado.
- `pnpm --filter web exec tsc --noEmit` — aprovado.
- `pnpm --filter web build` — aprovado; permanece apenas o aviso existente de
  tamanho do bundle.
- `git diff --check` — aprovado.
- Não foram criados nem executados testes automatizados nesta etapa, conforme
  orientação do usuário.

### Pendências restantes

- Nenhuma pendência funcional dentro do escopo da FRONT-103.
- Validação visual manual continua recomendada para conferir a toolbar em
  larguras reais.

**Dependências**

- `FRONT-102`.
