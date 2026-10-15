# Plan

Integrar o vínculo de comprador a uma unidade na área Estrutura, usando a rota
aninhada já disponível no backend. A ação deve aparecer somente quando a
seleção atual for uma `UNIDADE` e preservar o estado da navegação.

## Scope
- In: serviço HTTP, formulário/ação de vínculo em `StructureManagementPage.tsx`, feedback e testes focais.
- Out: criação de usuários, gestão completa de vínculos, remoção de vínculo e mudanças no backend.

## Action items
[ ] Confirmar o contrato `POST /empreendimentos/{empreendimento_id}/locais/{unidade_id}/compradores` e os papéis autorizados.
[ ] Adicionar uma função tipada em `src/features/empreendimentos/empreendimentos.service.ts` para criar o vínculo com `usuario_id`.
[ ] Incluir em `StructureManagementPage.tsx` uma ação visível apenas para o local selecionado do tipo `UNIDADE`.
[ ] Implementar formulário acessível para informar o identificador do comprador, com validação local de inteiro positivo.
[ ] Enviar a requisição com estado de carregamento, preservar o valor em falha e apresentar a mensagem retornada pela API.
[ ] Atualizar o painel de detalhes ou o feedback local após sucesso, sem alterar árvore, breadcrumb ou seleção atual.
[ ] Adicionar testes de integração para visibilidade condicional, envio bem-sucedido e erro da API; executar lint, TypeScript e os testes focados autorizados.

## Open questions
- O formulário deve aceitar somente ID do usuário ou também busca por nome/e-mail?
- A interface precisa listar os compradores já vinculados à unidade?
- Onde o vínculo deve ficar visível após a criação: detalhes da unidade ou mensagem transitória?
