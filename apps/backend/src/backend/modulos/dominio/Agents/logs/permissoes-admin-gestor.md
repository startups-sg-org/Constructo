# Log — permissões ADMIN e GESTOR

Data: 2026-09-27

## Alteração

As rotas que exigiam exclusivamente `ADMIN` passaram a aceitar também
`GESTOR`.

## Backend

Em `modulos/usuarios/rotas.py`, as dependências das rotas de gerenciamento de
usuários foram alteradas de `get_admin` para `get_admin_ou_gestor`:

- quantidade de usuários;
- listagem;
- consulta por ID;
- edição;
- exclusão;
- alteração de papel.

A criação de empreendimentos em `modulos/dominio/rotas.py` também está protegida
por `get_admin_ou_gestor`.

## Frontend

Em `web/src/router/router.tsx`, os loaders/actions da página
`/admin/usuarios` passaram a usar `exigirAcessoAoPainel`, permitindo ADMIN e
GESTOR.

## Resultado

- `ADMIN`: mantém acesso completo;
- `GESTOR`: passa a acessar as rotas administrativas liberadas;
- `COMPRADOR`: continua bloqueado pelo guard do painel.

## Risco registrado

Como a alteração inclui a rota de alteração de papel, um GESTOR também pode
promover ou rebaixar usuários. Essa regra deve ser revisada antes de produção
caso a gestão de permissões precise permanecer exclusiva de ADMIN.

## Validação

- Compilação sintática dos módulos Python alterados: aprovada.
- `git diff --check`: aprovado.
