## Descrição

Criar uma interface administrativa para visualizar e editar a estrutura completa de uma taxonomia.

O editor deverá apresentar etapas, subetapas e marcos de forma hierárquica.

## Implementar

Criar componentes:

TaxonomyEditor
├── TaxonomyHeader
├── TaxonomyTree
│   └── TaxonomyTreeItem
├── StageForm
├── MilestoneForm
└── TaxonomyDetails

Exibir estrutura semelhante a:

Taxonomia — Residencial Aurora

▾ Estrutura
    ✓ Fundação
    ✓ Estrutura do pavimento

▾ Vedações
    ├── Alvenaria
    └── Fechamento

▾ Instalações
    ▾ Hidráulica
        ├── Tubulação
        ├── Teste
        └── Conclusão

Permitir:

- expandir;
- recolher;
- selecionar;
- criar etapa;
- criar subetapa;
- criar marco;
- editar item;
- alterar ordenação;
- visualizar descrições;
- diferenciar visualmente etapa, subetapa e marco.

Utilizar Data Router para carregamento dos dados.

Utilizar `useFetcher` ou actions para alterações sem navegação desnecessária.

## Critérios de aceite

- [ ] taxonomia é exibida como árvore;
- [ ] etapas são visualmente identificáveis;
- [ ] subetapas são visualmente identificáveis;
- [ ] marcos são visualmente identificáveis;
- [ ] nós podem ser expandidos e recolhidos;
- [ ] usuário consegue criar novos itens;
- [ ] usuário consegue editar itens;
- [ ] usuário consegue alterar ordenação;
- [ ] interface é atualizada após alterações;
- [ ] loading e erros são tratados;
- [ ] editor funciona corretamente em desktop.

## Planejamento de execução

### Descobertas e decisões

- O frontend existente está em `web/src`, usa React Router com Data Router em
  `web/src/router/router.tsx`, além de loaders, actions e serviços por domínio.
- Já existe uma área administrativa de empreendimentos e uma árvore de
  estrutura física (`StructureManagementPage`), mas não existe editor de
  taxonomia nem componentes `TaxonomyEditor`, `TaxonomyTree` ou formulários
  equivalentes.
- O backend do domínio já expõe contratos e rotas administrativas para
  consultar taxonomia, listar/criar/editar etapas e listar/criar/editar marcos:
  `/empreendimentos/{empreendimento_id}/taxonomia`,
  `/taxonomia/etapas` e `/taxonomia/marcos`. A implementação frontend deve
  reutilizar esses contratos, sem criar endpoints paralelos.
- O acesso administrativo deve permanecer restrito a ADMIN ou GESTOR com
  vínculo ao empreendimento; comprador fica fora do editor.
- A hierarquia é etapa raiz → subetapa (`parent_id`) → marcos vinculados à
  etapa. A interface deve diferenciar visualmente esses três tipos e respeitar
  `ordem` nas listagens.

### Implementação prevista

1. **Contratos e serviços frontend**
   - Criar tipos para `Taxonomia`, `Etapa` e `Marco`, incluindo nome, ordem,
     `descricao_tecnica` e `descricao_cliente`.
   - Adicionar em um serviço de empreendimentos/taxonomia as operações GET,
     POST e PATCH correspondentes às rotas existentes.
   - Normalizar erros da API para mensagens exibíveis e preservar o status de
     loading da requisição.

2. **Data Router**
   - Adicionar uma rota administrativa, por exemplo
     `/admin/empreendimentos/:empreendimentoId/taxonomia`, com loader que
     carregue o empreendimento e sua taxonomia/etapas.
   - Usar `useFetcher` ou actions para criar e editar sem navegação completa.
   - Após mutações, revalidar o loader ou atualizar o estado derivado para que
     a árvore reflita nome, descrição, ordem e novos itens.

3. **Componentes**
   - `TaxonomyEditor`: composição da página, seleção do item e estado de
     feedback.
   - `TaxonomyHeader`: nome da taxonomia, empreendimento e ações principais.
   - `TaxonomyTree`/`TaxonomyTreeItem`: árvore recursiva, expandir/recolher,
     seleção, identificação visual de etapa, subetapa e marco, e ordenação por
     `ordem`.
   - `StageForm`: criação/edição de etapa raiz e subetapa, com descrição técnica,
     descrição do comprador e ordem.
   - `MilestoneForm`: criação/edição de marco com os mesmos campos de descrição
     e ordem.
   - `TaxonomyDetails`: painel do item selecionado, estado vazio e ações
     contextuais.

4. **Ordenação e hierarquia**
   - Criar subetapa informando `parent_id` da etapa selecionada.
   - Criar marco informando `etapa_id` da etapa/subetapa selecionada.
   - Editar `ordem` por formulário ou controles explícitos; não depender da
     ordem natural retornada pelo banco.
   - Impedir no cliente combinações inválidas, como marco sem etapa ou
     subetapa filha de um marco, mantendo a validação definitiva no backend.

### Testes e validação

- Testar o serviço frontend para GET, POST e PATCH de taxonomia, etapa e marco,
  incluindo payloads de descrições e ordem.
- Testar o loader da rota e os estados de loading, erro de API e taxonomia sem
  itens.
- Testar a árvore com etapa, subetapa e marco, verificando diferenciação
  visual, expansão/recolhimento e seleção.
- Testar criação e edição de etapa raiz, subetapa e marco, incluindo atualização
  da interface após `useFetcher`/action.
- Testar ordenação por `ordem` e o envio correto de `parent_id`/`etapa_id`.
- Testar rota administrativa sem autenticação/acesso e erro de recurso
  inexistente conforme o padrão já usado em `router.test.tsx`.
- Validar layout em viewport desktop e executar a suíte frontend focada da
  rota, componentes e serviços.

### Dependências, riscos e limites

- A issue depende das rotas backend de taxonomia estarem estáveis e disponíveis
  no contrato consumido pelo frontend; mudanças de nomes ou payloads devem ser
  sincronizadas nos tipos e serviços.
- O backend atual lista etapas por `parent_id` e marcos por etapa; o loader
  precisará compor a árvore ou fazer consultas adicionais, sem assumir que uma
  resposta plana já contenha toda a hierarquia.
- A API não possui, nesta issue, endpoint específico de movimentação por drag
  and drop; a primeira implementação deve alterar ordenação pelo campo `ordem`
  usando os PATCH existentes.
- Não implementar área do comprador, versionamento de taxonomia, drag and drop
  avançado ou novas regras de negócio nesta issue.
- Critérios de aceite permanecem pendentes até que a implementação e os testes
  forneçam evidência correspondente.
