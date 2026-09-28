## Formulário de cadastro de empreendimento no frontend

### Descrição

Criar ou completar o formulário administrativo para cadastrar um novo
empreendimento através da interface web.

O formulário deve enviar os dados para `POST /empreendimentos/`, apresentar
validações claras e atualizar a listagem após o cadastro.

### Campos

- `nome` — obrigatório;
- `descricao` — opcional;
- `endereco` — opcional;
- `status` — inicialmente `PLANEJADO`, com possibilidade de seleção conforme o
  contrato vigente.

### Fluxo esperado

1. Usuário ADMIN acessa `/admin/obras`.
2. Clica em “Novo empreendimento” ou visualiza o formulário de cadastro.
3. Preenche os dados básicos.
4. O frontend valida os campos antes do envio.
5. O frontend envia `POST /empreendimentos/`.
6. Durante o envio, os campos e botão ficam desabilitados.
7. Em caso de sucesso:
   - exibir confirmação;
   - atualizar a lista de empreendimentos;
   - oferecer acesso aos detalhes do novo empreendimento.
8. Em caso de erro, exibir mensagem sem perder os dados preenchidos.

### Regras de acesso

- Apenas ADMIN pode cadastrar empreendimento.
- GESTOR e COMPRADOR não devem visualizar ou executar a ação de cadastro.
- A proteção do frontend deve complementar, mas nunca substituir, a autorização
  do backend.

### Critérios de aceite

- [ ] formulário acessível em `/admin/obras`;
- [ ] campo `nome` obrigatório e validado;
- [ ] campos de descrição e endereço disponíveis;
- [ ] status inicial definido como `PLANEJADO`;
- [ ] payload enviado no formato aceito por `EmpreendimentoCriar`;
- [ ] botão apresenta estado de carregamento;
- [ ] sucesso atualiza a listagem;
- [ ] erro da API é exibido de forma compreensível;
- [ ] dados não são perdidos quando o envio falha;
- [ ] acesso restrito a ADMIN;
- [ ] testes do formulário, action e integração com a listagem.

### Arquivos a verificar

- `apps/web/src/router/router.tsx`;
- `apps/web/src/features/empreendimentos/empreendimentos.action.ts`;
- `apps/web/src/features/empreendimentos/empreendimentos.service.ts`;
- `apps/web/src/modulos/empreendimentos/componentes/FormularioEmpreendimento.tsx`;
- `apps/web/src/modulos/empreendimentos/componentes/ListaEmpreendimentos.tsx`;
- schemas compartilhados em `packages/shared`.

### Limites

- Não incluir nesta issue cadastro de estrutura física, taxonomia, gestores ou
  unidades.
- Não criar novos endpoints se `POST /empreendimentos/` atender ao contrato.
- Não misturar o formulário de edição de empreendimento com o cadastro.
