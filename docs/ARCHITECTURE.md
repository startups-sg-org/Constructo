# Arquitetura do Constructo

## Objetivo

O repositório é um monorepo para os clientes web e mobile do Constructo e, futuramente, para a API e pacotes compartilhados. A arquitetura separa composição global, funcionalidades de negócio e recursos reutilizáveis.

## Estrutura

```text
apps/
├── web/
│   └── src/
│       ├── app/
│       ├── features/
│       └── shared/
└── mobile/
    └── src/
        ├── features/
        └── shared/
docs/
public/
```

Quando o backend for iniciado, ele deve entrar em `services/api`. Pacotes TypeScript compartilhados, quando necessários, devem entrar em `packages/<nome>`.

## Responsabilidades

### `app` (web)

Contém somente elementos globais: bootstrap, roteamento, providers, layouts raiz, tratamento global de erros e configuração da aplicação.

No mobile, `src/app` é reservado por convenção ao Expo Router. Enquanto esse roteador não for adotado, o componente raiz permanece em `src/App.tsx`.

### `features`

Cada diretório representa uma capacidade do produto, como autenticação, obras, unidades, timeline ou DOMINUS. Uma feature deve esconder sua implementação e expor uma API pública pequena.

Um componente de feature é "burro": recebe dados, texto e callbacks inteiramente por props, sem importar tipos, constantes ou dados de outra feature para preenchê-los. Ele não decide o que só quem o compõe pode saber — se aparece, que espaço ocupa ao lado de outros elementos, que atraso espera antes de uma animação — e não guarda um valor que precise ficar sincronizado manualmente com uma constante definida em outro arquivo. Chrome de página, como o título da rota, também é fornecido de fora. O critério prático: dá para remover o componente do lugar em que está e recompô-lo em outro contexto — inclusive um container ainda não escrito — sem alterá-lo.

### `shared`

Contém infraestrutura e interface reutilizáveis que não dependem de uma feature específica. Um módulo não deve ser colocado em `shared` apenas porque é usado duas vezes dentro da mesma feature.

## Direção das dependências

```text
app ───────► features ───────► shared
 │                                ▲
 └────────────────────────────────┘
```

- `shared` não importa de `features` ou `app`;
- uma feature não importa arquivos internos de outra feature — nem pelo alias `@features/*`, nem por caminho relativo; em `apps/web` isso é verificado por lint (`no-restricted-imports` em `eslint.config.js`), não só por convenção;
- `app` pode compor features e recursos compartilhados;
- clientes não contêm regras de autorização consideradas fonte de verdade.

## Web e mobile

Web e mobile são aplicativos distintos. Eles podem compartilhar tipos, schemas, regras puras e cliente da API, mas cada plataforma mantém seus componentes, navegação e integrações nativas.

Não se deve importar código de `apps/web` em `apps/mobile`, nem o inverso. Compartilhamento legítimo deve ser extraído para um pacote com dependências explícitas.

## Backend e multi-tenancy

O isolamento entre construtoras deve ser imposto no backend em todas as consultas e mutações. Ocultar elementos na interface não constitui autorização. Registros auditáveis devem identificar ator, organização, instante, operação e estados relevantes antes e depois da alteração.

## Decisões futuras

Banco, autenticação, modelo multi-tenant, filas, object storage e observabilidade exigirão registros de decisão arquitetural antes da implementação. A documentação deve distinguir claramente tecnologia configurada de tecnologia apenas planejada.
