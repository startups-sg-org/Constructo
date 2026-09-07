# Orientações de desenvolvimento

Este documento reúne as convenções práticas do Constructo. As decisões arquiteturais e as fronteiras entre camadas estão em [ARCHITECTURE.md](ARCHITECTURE.md).

## Gerenciador de pacotes

O projeto usa exclusivamente pnpm. Instalações devem ser executadas na raiz do monorepo:

```bash
pnpm install
```

Não crie lockfiles dentro dos aplicativos. O único lockfile do repositório é `/pnpm-lock.yaml`.

Para adicionar uma dependência a um aplicativo específico:

```bash
pnpm --filter @constructo/web add <pacote>
pnpm --filter @constructo/mobile add <pacote>
```

## Fluxo de validação

Antes de abrir uma alteração para revisão, execute na raiz:

```bash
pnpm check
```

Esse comando executa lint, verificação de tipos, testes e builds de produção dos aplicativos.

## Organização por features

Funcionalidades de negócio devem ser agrupadas por feature. Uma feature pode conter seus próprios componentes, páginas, hooks, serviços, tipos e testes.

```text
features/
└── works/
    ├── components/
    ├── pages/
    ├── services/
    ├── types/
    └── index.ts
```

Regras:

- `app/` contém composição global, roteamento, providers e inicialização;
- `features/` contém funcionalidades e regras específicas de cada domínio;
- `shared/` contém apenas elementos realmente reutilizáveis e sem conhecimento de features;
- uma feature não deve acessar arquivos internos de outra feature;
- APIs públicas de features devem ser expostas por um arquivo `index.ts`;
- código compartilhado entre web e mobile só deve ir para `packages/` quando existir um caso real de reutilização.

## TypeScript e imports

- Código novo deve permanecer compatível com o modo estrito do TypeScript.
- Prefira aliases arquiteturais a sequências extensas de `../../`.
- Não use coerções ou non-null assertions para esconder estados que precisam ser validados.
- Dependências utilizadas por um aplicativo devem estar declaradas no `package.json` desse aplicativo.

## Variáveis de ambiente

- Web: variáveis públicas devem começar com `VITE_`.
- Expo: variáveis públicas devem começar com `EXPO_PUBLIC_`.
- Segredos nunca devem usar prefixos públicos nem ser armazenados nos clientes.
- Arquivos `.env` não são versionados; cada aplicativo mantém somente seu `.env.example`.

## Commits e revisão

- Não versione `node_modules`, builds, caches, credenciais ou arquivos locais do editor.
- Mantenha alterações pequenas e relacionadas a uma única finalidade.
- Inclua ou atualize testes quando houver comportamento observável novo.
- Atualize a documentação quando scripts, estrutura ou decisões arquiteturais mudarem.
