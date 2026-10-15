## Descrição

Configurar **Bootstrap 5**, **React-Bootstrap** e **Sass** no front-end web do
Constructo como a fundação visual para a reconfiguração gradual das páginas.

A integração deve preparar uma interface administrativa de ERP, com
componentes consistentes, responsivos e acessíveis. React-Bootstrap será usado
para componentes React; o JavaScript imperativo do Bootstrap não deve ser
adicionado à aplicação.

## Implementar

Adicionar ao workspace `apps/web`:

- `bootstrap`;
- `react-bootstrap`;
- `sass` como dependência de desenvolvimento.

Criar `src/styles/bootstrap-theme.scss` como ponto único de importação do
Bootstrap e configurar o tema com a identidade atual do Constructo:

- fonte Poppins;
- cor primária verde;
- cores de sucesso, alerta e erro;
- fundo, texto e bordas;
- raios de borda dos controles e cartões.

Importar o tema em `src/main.tsx` antes dos estilos globais e específicos do
Constructo.

Preparar o uso de componentes React-Bootstrap:

- `Button`, `Form`, `Alert`, `Badge` e `Table`;
- `Modal`, `Dropdown`, `Nav`, `Tabs` e `Offcanvas`;
- `Container`, `Row`, `Col` e `Card`.

Manter a integração com React Router por meio de adaptadores de links usados
por `Button` e `Nav.Link`, preservando as rotas e o comportamento atual da
aplicação.

## Estágios de implementação

1. Instalar dependências e confirmar compatibilidade com React, Vite e
   TypeScript do projeto.
2. Criar o tema Sass e importá-lo globalmente pela aplicação.
3. Ajustar estilos globais que conflitam com Bootstrap, em especial a classe
   `.card` existente em `src/index.css`.
4. Criar ou adaptar componentes-base do Constructo para botões, campos,
   badges, alertas, tabelas e superfícies.
5. Validar o carregamento de componentes React-Bootstrap com React Router sem
   alterar rotas, loaders, actions, permissões ou API.

## Critérios de aceite

- [x] `bootstrap`, `react-bootstrap` e `sass` estão declarados em
  `apps/web/package.json`;
- [x] o tema Sass do Constructo é compilado pelo Vite sem configuração manual
  adicional;
- [x] `src/main.tsx` importa o tema Bootstrap uma única vez e antes dos
  estilos do Constructo;
- [x] a paleta, tipografia, bordas e raios configurados no tema são aplicados
  aos componentes Bootstrap;
- [x] não há colisão ativa entre a classe global `.card` e o componente
  `Card` do Bootstrap;
- [x] componentes React-Bootstrap podem ser usados com TypeScript sem erros;
- [x] um `Button` e um `Nav.Link` renderizados como links preservam a navegação
  do React Router;
- [x] nenhum script JavaScript nativo do Bootstrap é importado;
- [ ] páginas públicas, autenticação e painel administrativo permanecem
  funcionais após a configuração;
- [x] `pnpm --filter web build`, `pnpm --filter web lint` e
  `pnpm --filter web test` são executados e seus resultados registrados.

## Limites

- Esta issue cria a fundação técnica; não redesenha páginas completas.
- A migração visual é incremental, começando por componentes compartilhados e
  seguindo para Empreendimentos, Usuários, Taxonomia e as demais páginas.
- SVGs próprios permanecem em uso nesta etapa; uma biblioteca de ícones não
  faz parte desta configuração.

## Registro de execução

### Entregue

- Dependências instaladas: `bootstrap@5.3.8`, `react-bootstrap@2.10.10` e
  `sass@1.105.1`.
- Tema central criado em `src/styles/bootstrap-theme.scss` e carregado uma vez
  por `src/main.tsx`, antes dos estilos do Constructo.
- A classe global `.card` foi renomeada para `.constructo-card`, evitando a
  colisão com o componente `Card` do Bootstrap.
- Adicionado teste de integração para `Button` e `Nav.Link` com React Router.
  Como os tipos atuais do React-Bootstrap não aceitam diretamente
  `Link`/`NavLink`, o padrão definido usa adaptadores que convertem `href` em
  `to`.

### Validações executadas

- `pnpm --filter web build`: aprovado.
- `pnpm --filter web lint`: aprovado.
- `pnpm --filter web test src/styles/bootstrap.integration.test.tsx`:
  aprovado (1 teste).
- `pnpm --filter web test`: 73 testes aprovados e 1 falha preexistente em
  `src/componentes/EvidenceChecklist/EvidenceChecklist.test.tsx`. O teste
  espera que o elemento com texto `Visão geral` também contenha
  `Obrigatório`, mas o componente atual o renderiza em elemento separado.
  Nenhum arquivo desse componente foi alterado nesta issue.

### Observações

- O build conclui com avisos de depreciação provenientes do Sass interno do
  Bootstrap 5.3.8. São avisos da dependência e não impedem a compilação.
- A validação visual manual das páginas existentes permanece pendente; ela deve
  ser feita no navegador antes de considerar o critério de não regressão
  integralmente aceito.
