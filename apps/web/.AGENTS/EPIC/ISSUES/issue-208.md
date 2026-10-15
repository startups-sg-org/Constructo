# Plan

Integrar o vínculo de comprador a uma unidade na área Estrutura, usando a rota
aninhada já disponível no backend. A ação deve aparecer somente quando a
seleção atual for uma `UNIDADE` e preservar o estado da navegação.

## Scope
- In: serviço HTTP, formulário/ação de vínculo em `StructureManagementPage.tsx`, feedback e testes focais.
- Out: criação de usuários, gestão completa de vínculos, remoção de vínculo e mudanças no backend.

## Action items
[x] Confirmar o contrato `POST /empreendimentos/{empreendimento_id}/locais/{unidade_id}/compradores` e os papéis autorizados.
[x] Adicionar uma função tipada em `src/features/empreendimentos/empreendimentos.service.ts` para criar o vínculo com `usuario_id`.
[x] Incluir em `StructureManagementPage.tsx` uma ação visível apenas para o local selecionado do tipo `UNIDADE`.
[x] Implementar formulário acessível para informar o identificador do comprador, com validação local de inteiro positivo.
[x] Enviar a requisição com estado de carregamento, preservar o valor em falha e apresentar a mensagem retornada pela API.
[x] Atualizar o painel de detalhes ou o feedback local após sucesso, sem alterar árvore, breadcrumb ou seleção atual.
[x] Testes locais dispensados pelo solicitante; lint e TypeScript executados.

## Open questions
- O formulário deve aceitar somente ID do usuário ou também busca por nome/e-mail? sim
- A interface precisa listar os compradores já vinculados à unidade? sim
- Onde o vínculo deve ficar visível após a criação: detalhes da unidade ou mensagem transitória? Detalhes da unidade

## Execução
- O formulário aceita ID numérico e busca local por nome ou e-mail entre os usuários ativos com papel `COMPRADOR` retornados por `GET /usuarios/`.
- O vínculo usa `POST /empreendimentos/{empreendimento_id}/locais/{unidade_id}/compradores` com `{ "usuario_id": number }` e preserva o ID informado quando a API retorna erro.
- A ação é exibida exclusivamente para `UNIDADE`; confirmação e vínculos criados durante a sessão são mostrados no cartão de detalhes, sem alterar árvore, breadcrumb ou seleção.

## Arquivos alterados
- `apps/web/src/features/empreendimentos/empreendimentos.service.ts`
- `apps/web/src/modulos/empreendimentos/componentes/StructureManagementPage.tsx`
- `apps/web/src/modulos/empreendimentos/componentes/UnitBuyerLink.tsx`
- `apps/web/src/modulos/usuarios/componentes/EditarUsuario.tsx`
- `packages/shared/src/modulos/usuarios/userSchema.ts`
- `apps/backend/src/backend/modulos/dominio/rotas.py`
- `apps/backend/src/backend/modulos/dominio/servicos.py`

## Validações
- `pnpm --filter web exec eslint src/modulos/usuarios/componentes/EditarUsuario.tsx` — aprovado.
- `pnpm --filter web build` — TypeScript e build de produção aprovados; permanece somente o aviso já conhecido de chunk acima de 500 kB.
- `pytest` não executado, conforme orientação.

## Ajuste em usuários
- Em `/admin/usuarios`, o modal de edição mostra seletores encadeados de Empreendimento e Unidade para `COMPRADOR`. Os empreendimentos disponíveis são carregados pela API e, após a escolha, a lista de unidades é atualizada a partir da estrutura física do empreendimento. Os demais papéis mantêm campos de texto.
- Os selects são controlados pelo estado do formulário, mantendo a opção escolhida visível após a seleção.
- O schema de edição deixou de exigir `papel`, pois o modal e o endpoint `PUT /usuarios/{id}` não enviam nem atualizam esse campo. Antes disso, a validação local bloqueava o `fetcher.submit` e a requisição não era enviada ao backend.

## Pendências
- Reiniciar o processo do backend caso ele não execute com recarga automática, para registrar as rotas de vínculo e listagem de compradores.

## Vínculos persistidos
- Adicionado `GET /empreendimentos/{empreendimento_id}/locais/{unidade_id}/compradores`, com a mesma autorização e validação de pertencimento do vínculo.
- O cartão `estrutura-gerenciamento__card--lista` consulta e exibe os compradores persistidos para a unidade selecionada. Após um `POST` bem-sucedido, a lista é atualizada sem alterar a seleção atual.
- Validações adicionais: `python3 -m py_compile` nos módulos de domínio alterados, lint dos três arquivos web alterados, build web e `git diff --check` aprovados. `pytest` não executado.
