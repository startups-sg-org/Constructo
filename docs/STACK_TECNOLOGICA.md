# Constructo — Stack tecnológica

[← Voltar ao README principal](../README.md)

## Visão geral

O Constructo é uma plataforma web e mobile organizada em monorepo. As interfaces são aplicativos independentes que consomem a mesma API e compartilham conceitos de domínio, mas não componentes visuais específicos de plataforma.

| Camada | Tecnologia | Estado |
| --- | --- | --- |
| Web | React, React Router, TypeScript e Vite | configurada |
| Mobile | React Native, Expo e TypeScript | configurada |
| API | Python e Django REST Framework | planejada |
| Dados | PostgreSQL | planejada |
| Arquivos | S3 ou Cloudflare R2 | planejada |
| Cache e tarefas | Redis e workers | planejada |
| Notificações | Firebase Cloud Messaging | planejada |
| Observabilidade | OpenTelemetry | planejada |
| Dados geoespaciais | GeoJSON | planejada |
| Visualização 3D | React Three Fiber e Three.js | evolução futura |

## Aplicação web

A aplicação em `apps/web` atende navegadores e usa React, React Router, Vite, TypeScript em modo estrito e ESLint. O arquivo `src/main.tsx` é o único ponto que cria a raiz React. Roteamento e providers globais pertencem a `src/app`.

## Aplicação mobile

A aplicação em `apps/mobile` atende Android e iOS com React Native e Expo. O projeto utiliza o fluxo gerenciado do Expo e Continuous Native Generation, evitando versionar diretórios nativos até que exista uma necessidade explícita de prebuild.

O Expo também oferece um destino web, mas o cliente web oficial do Constructo é a aplicação Vite em `apps/web`. O destino web do Expo pode ser usado para desenvolvimento e experimentação do código mobile.

## API e regras de negócio

O backend será responsável por autenticação, autorização, isolamento entre construtoras, validações, cálculo de indicadores, auditoria e acesso a dados. Essas regras não podem depender exclusivamente dos clientes web ou mobile.

```text
Web / Mobile
      │ HTTPS
      ▼
Django REST Framework
      ├── PostgreSQL
      ├── S3 / Cloudflare R2
      ├── Redis / workers
      └── serviços de notificação e observabilidade
```

## Dados e arquivos

O PostgreSQL armazenará dados estruturados e metadados. Arquivos grandes, fotografias, relatórios e demais evidências ficarão em object storage. O banco manterá referências, autoria, vínculo com a obra e informações de auditoria.

Dados geoespaciais serão transportados em GeoJSON. Validação de geometrias, permissões e associação com construtoras ocorrerão no backend.

## Monorepo e dependências

O pnpm gerencia todos os workspaces a partir da raiz. Há um único lockfile, o que torna instalações e CI reproduzíveis.

```text
/
├── apps/
│   ├── mobile/
│   └── web/
├── docs/
├── public/          # imagens usadas pela documentação
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

Pacotes compartilhados serão adicionados em `packages/` somente quando houver código independente de plataforma, como tipos de domínio, schemas e cliente HTTP. React, React Native e componentes visuais permanecem nos aplicativos correspondentes.

## Ambiente e comandos

Pré-requisitos:

- Node.js 22.22 ou superior;
- pnpm 11.21.0;
- Android Studio ou dispositivo com Expo Go para Android;
- macOS e Xcode apenas quando for necessário executar o simulador ou build local de iOS.

Comandos executados na raiz:

```bash
pnpm install
pnpm dev:web
pnpm dev:mobile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

## Variáveis de ambiente

Cada aplicativo possui seu próprio `.env.example`, pois Vite e Expo carregam arquivos relativos ao diretório da aplicação.

```text
apps/web/.env.example     → VITE_API_URL
apps/mobile/.env.example  → EXPO_PUBLIC_API_URL
```

Os prefixos indicam variáveis incorporadas ao cliente e, portanto, públicas. Credenciais de banco, chaves privadas e segredos de serviços pertencem exclusivamente ao backend.

## Evolução futura

React Three Fiber, Three.js, GLB, glTF, BIM e IFC não fazem parte da entrega acadêmica atual. Consulte [EVOLUCAO_FUTURA.md](EVOLUCAO_FUTURA.md).
