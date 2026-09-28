## Listagem de empreendimentos em cards

### Descrição

Criar ou completar a listagem visual dos empreendimentos cadastrados no painel
administrativo, apresentando cada empreendimento em um card com informações
resumidas e ações claras.

### Localização

Rota frontend:

```text
/admin/obras
```

Componentes relacionados:

- `ListaEmpreendimentos.tsx`;
- `CardEmpreendimento.tsx`;
- `FormularioEmpreendimento.tsx`;
- `empreendimentos.loader.ts`;
- `empreendimentos.service.ts`.

### Conteúdo do card

Cada card deve exibir:

- nome do empreendimento;
- status atual com badge visual;
- descrição resumida, quando existir;
- endereço, quando existir;
- data de criação ou atualização;
- ação para visualizar detalhes;
- ação para editar dados básicos;
- ação para gerenciar estrutura física;
- ação para configurar/editar taxonomia quando aplicável.

### Comportamento

- Carregar os empreendimentos pelo loader da rota.
- Renderizar um card por empreendimento.
- Ordenar pela resposta do backend, sem depender da ordem natural do DOM.
- Exibir estado vazio quando não houver registros.
- Exibir loading enquanto o loader estiver pendente.
- Exibir erro compreensível quando a API falhar.
- Atualizar a lista após novo cadastro sem exigir recarregamento manual.
- Permitir navegação por teclado e possuir nomes acessíveis para as ações.

### Permissões

- ADMIN pode visualizar todos os empreendimentos.
- GESTOR visualiza somente os empreendimentos aos quais está vinculado.
- COMPRADOR não acessa a rota administrativa.
- As permissões devem continuar sendo validadas pelo backend; o frontend apenas
  reflete o acesso disponível.

### Critérios de aceite

- [ ] empreendimentos cadastrados aparecem em cards;
- [ ] cada card exibe nome e status;
- [ ] descrição e endereço são tratados quando ausentes;
- [ ] cards possuem ações de detalhes e edição;
- [ ] ações de estrutura e taxonomia são exibidas conforme o estado;
- [ ] estado vazio é apresentado corretamente;
- [ ] loading e erros são tratados;
- [ ] cadastro de novo empreendimento atualiza a listagem;
- [ ] layout funciona em desktop;
- [ ] cards são acessíveis por teclado e leitores de tela;
- [ ] ADMIN e GESTOR recebem a listagem correta conforme suas permissões.

### Testes previstos

- Teste do loader e do serviço de listagem.
- Teste de renderização com múltiplos empreendimentos.
- Teste de estado vazio.
- Teste de descrição/endereço ausentes.
- Teste de links e ações do card.
- Teste de atualização após cadastro.
- Teste de erro da API.
- Teste de acesso ADMIN, GESTOR e COMPRADOR.

### Limites

- Não incluir filtros avançados, paginação ou busca nesta primeira versão.
- Não alterar o contrato backend de empreendimentos sem necessidade.
- Não misturar a listagem de empreendimentos com a listagem de unidades ou
  locais da estrutura física.

### Correlação futura com taxonomia

- A listagem deve ser preparada para se integrar posteriormente às telas de
  configuração e edição de taxonomia.
- Cada card deve manter um acesso claro aos detalhes do empreendimento, onde a
  taxonomia vinculada é exibida e configurada.
- Quando houver taxonomia vinculada, o card poderá exibir futuramente um resumo
  como “Taxonomia configurada” e um atalho para o editor.
- Quando não houver taxonomia, o card poderá indicar “Configurar taxonomia” sem
  duplicar a lógica de configuração; a ação deve encaminhar para a tela de
  detalhes/configuração definida nas issues de taxonomia.
- Não implementar a configuração de taxonomia diretamente dentro do card nesta
  issue; manter a correlação por rotas e links para evitar duplicação de fluxo.
