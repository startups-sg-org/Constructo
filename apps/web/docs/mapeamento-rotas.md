# Mapeamento de rotas do app web

Este documento registra o estado das rotas antes da migração do React Router para
Data Mode. O inventário considera o app `apps/web`, cuja configuração está
centralizada em `src/main.tsx` e usa `BrowserRouter`, `Routes` e `Route`.

O app mobile usa Expo Router e não faz parte desta migração.

## Visão geral

| Grupo | Path | Página ou conteúdo renderizado | Layout | Autenticação | Parâmetros de URL | Dados da API | Redirecionamento |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pública | `/` | `Home` | `PublicLayout` | Não | Nenhum. Os hashes `#inicio`, `#recursos`, `#como-funciona` e `#sobre` são âncoras da página, não parâmetros de rota. | Nenhum | Nenhum |
| Autenticação | `/cadastro` | `Formulario` | `AuthLayout` | Não | Nenhum | `POST /usuarios/` ao enviar o cadastro | Após sucesso, `/login` com `replace` |
| Autenticação | `/login` | `Login` | `AuthLayout` | Não para acessar; uma sessão existente é consultada | Nenhum. Pode receber `location.state.origem`, que não faz parte da URL. | `GET /sessao` ao montar; `POST /login` ao enviar | Com sessão existente ou login concluído, volta para a origem se o pathname começar com `/admin`; caso contrário, vai para `/admin`. Usa `replace`. |
| Administrativa e autenticada | `/admin` | `PaginaPainel` com `ResumoPainel` | `RotaProtegida` → `AdminLayout` → `PaginaPainel` | Sim | Nenhum | Requisições comuns da área protegida; `GET /usuarios/quantidade` para o resumo | Sem sessão, `/login` com `replace` e a localização de origem em state |
| Administrativa e autenticada | `/admin/usuarios` | `PaginaPainel` com `ListaUsuarios`; `EditarUsuario` abre como modal na mesma URL | `RotaProtegida` → `AdminLayout` → `PaginaPainel` | Sim | Nenhum. O ID do usuário editado fica em estado local e não na URL. | Requisições comuns; `GET /usuarios/`; ao editar, `GET /usuarios/:usuarioId` e `PUT /usuarios/:usuarioId` | Sem sessão, `/login` com `replace` e a localização de origem em state |
| Administrativa e autenticada | `/admin/obras` | `PaginaPainel` sem conteúdo próprio | `RotaProtegida` → `AdminLayout` → `PaginaPainel` | Sim | Nenhum | Somente as requisições comuns da área protegida | Sem sessão, `/login` com `replace` e a localização de origem em state |
| Administrativa e autenticada | `/admin/contratos` | `PaginaPainel` sem conteúdo próprio | `RotaProtegida` → `AdminLayout` → `PaginaPainel` | Sim | Nenhum | Somente as requisições comuns da área protegida | Sem sessão, `/login` com `replace` e a localização de origem em state |
| Administrativa e autenticada | `/admin/medicoes` | `PaginaPainel` sem conteúdo próprio | `RotaProtegida` → `AdminLayout` → `PaginaPainel` | Sim | Nenhum | Somente as requisições comuns da área protegida | Sem sessão, `/login` com `replace` e a localização de origem em state |
| Administrativa e autenticada | `/admin/perfil` | `PaginaPainel` sem conteúdo próprio | `RotaProtegida` → `AdminLayout` → `PaginaPainel` | Sim | Nenhum | Somente as requisições comuns da área protegida | Sem sessão, `/login` com `replace` e a localização de origem em state |
| Fallback | `*` | `Navigate` | Nenhum | Não | Qualquer URL não reconhecida | Nenhum | `/login` com `replace` |

### Requisições comuns da área protegida

Antes de renderizar qualquer rota `/admin`, `RotaProtegida` chama `GET /sessao`.
Depois que o guard libera o acesso, o `UserMenu` do `AdminLayout` também chama
`GET /sessao` para obter os dados exibidos da conta. As chamadas usam
`credentials: "include"`; a autenticação depende do cookie HTTP-only
`session_token` emitido pelo backend.

O menu do usuário permite chamar `POST /logout` a partir de todas as páginas do
`AdminLayout`. Após o logout bem-sucedido, a aplicação redireciona para `/login`
com `replace`.

## Grupos

### Rotas públicas

- `/`: landing page pública.

### Rotas de autenticação

- `/cadastro`: criação de conta.
- `/login`: autenticação e restauração do destino protegido solicitado.

As duas rotas usam o layout visual `AuthLayout` e permanecem acessíveis sem
sessão. A tela de login redireciona um usuário que já possua sessão válida, mas
o cadastro não possui esse comportamento.

### Rotas autenticadas

- `/admin`
- `/admin/usuarios`
- `/admin/obras`
- `/admin/contratos`
- `/admin/medicoes`
- `/admin/perfil`

Todas estão sob `RotaProtegida`. Enquanto `GET /sessao` está pendente, o guard
exibe “Verificando autenticação...”. Uma falha na consulta é tratada como ausência
de sessão e leva o usuário ao login.

### Rotas administrativas

As seis rotas autenticadas também compõem a área administrativa porque estão sob
o prefixo `/admin` e usam `AdminLayout`, com sidebar, navbar e área de conteúdo.

Não existe hoje uma checagem de papel, perfil ou permissão administrativa no
frontend ou nos endpoints consumidos por essas páginas. Portanto, qualquer
usuário com sessão válida pode acessar essa área; a classificação
“administrativa” descreve a organização atual das URLs e da interface.

### Rotas dinâmicas

Não há rotas de página com segmentos dinâmicos, parâmetros de busca ou parâmetros
de path no app web atual. Em especial, a edição em `/admin/usuarios` não cria uma
rota `/admin/usuarios/:id`: o identificador é mantido no estado do componente e
usado apenas nos endpoints dinâmicos `GET /usuarios/:usuarioId` e
`PUT /usuarios/:usuarioId`.

## Layouts e composição

- `PublicLayout`: navbar pública, `Outlet` e footer; usado somente por `/`.
- `AuthLayout`: identidade visual e `Outlet`; usado por `/cadastro` e `/login`.
- `RotaProtegida`: guard sem layout visual, responsável por validar a sessão e
  renderizar seu `Outlet`.
- `AdminLayout`: sidebar, navbar com menu do usuário e `AdminContent` com
  `Outlet`; usado por todas as rotas `/admin`.
- `PaginaPainel`: wrapper de conteúdo com título, subtítulo e ação opcional;
  usado em todas as páginas administrativas.

## Páginas dependentes do backend

| Página/fluxo | Endpoint | Finalidade | Endpoint protegido no backend |
| --- | --- | --- | --- |
| Cadastro | `POST /usuarios/` | Criar usuário | Não |
| Login | `GET /sessao` | Detectar sessão já existente | Sim |
| Login | `POST /login` | Autenticar e criar cookie de sessão | Não |
| Guard de `/admin/*` | `GET /sessao` | Autorizar entrada na área protegida | Sim |
| Menu do usuário | `GET /sessao` | Exibir nome e e-mail da conta | Sim |
| Menu do usuário | `POST /logout` | Encerrar sessão | Não exige sessão válida; remove a sessão quando o cookie existe |
| Painel administrativo | `GET /usuarios/quantidade` | Exibir total de usuários | Sim |
| Lista de usuários | `GET /usuarios/` | Listar usuários | Sim |
| Modal de edição de usuário | `GET /usuarios/:usuarioId` | Carregar usuário selecionado | Sim |
| Modal de edição de usuário | `PUT /usuarios/:usuarioId` | Atualizar usuário selecionado | Sim |

As páginas `/admin/obras`, `/admin/contratos`, `/admin/medicoes` e
`/admin/perfil` ainda não carregam conteúdo específico do backend, mas dependem
de `GET /sessao` por estarem protegidas e pela identificação exibida no layout.

## Redirecionamentos e navegação preservada

1. Qualquer path não reconhecido corresponde a `*` e redireciona para `/login`.
2. Ao negar acesso a `/admin/*`, `RotaProtegida` envia a localização completa
   solicitada em `location.state.origem` e redireciona para `/login`.
3. O login aceita como retorno somente origens cujo pathname comece com
   `/admin`; nesse caso, recompõe pathname, query string e hash. Outras origens
   são descartadas em favor de `/admin`.
4. Uma sessão válida detectada ao abrir `/login` dispara o mesmo retorno descrito
   acima.
5. Cadastro concluído e logout concluído redirecionam para `/login`.
6. Todos os redirecionamentos usam `replace`, substituindo a entrada atual do
   histórico.

Links e âncoras da landing page (`/#inicio`, `/#recursos`,
`/#como-funciona` e `/#sobre`) navegam dentro da rota `/` e não representam
rotas adicionais.

## Observações para a migração para Data Mode

- A definição atual está integralmente em `src/main.tsx`; não existem loaders,
  actions, error elements ou objetos de rota.
- As consultas e mutações acontecem em effects e handlers dos componentes por
  meio de `src/modulos/usuarios/servicos/userService.ts`.
- Falhas de sessão nas chamadas específicas de uma página não possuem um
  redirecionamento global; o redirecionamento é responsabilidade do
  `RotaProtegida` durante sua verificação inicial.
- A rota curinga não possui uma página de “não encontrado”; ela sempre conduz ao
  login, inclusive quando o visitante já está autenticado.

Este mapeamento é apenas documental e não altera o comportamento da aplicação.
