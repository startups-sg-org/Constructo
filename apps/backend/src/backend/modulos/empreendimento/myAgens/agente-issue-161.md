## Descrição

Criar uma representação visual hierárquica da estrutura física de um empreendimento.

## Implementar

Criar endpoint para retornar a estrutura hierárquica.

Exemplo:

Torre A
├── 1º Pavimento
│   ├── Unidade 101
│   └── Unidade 102
└── 2º Pavimento
    ├── Unidade 201
    └── Unidade 202

Criar componentes:

StructureTree
└── StructureTreeItem

Permitir:

- expandir nós;
- recolher nós;
- diferenciar tipos;
- visualizar filhos;
- selecionar um item.

Carregar a estrutura através do Data Router.

## Critérios de aceite

- [x] árvore é carregada a partir da API;
- [x] hierarquia pai/filho é respeitada;
- [x] torres e blocos aparecem no nível correto;
- [x] pavimentos aparecem abaixo de torres ou blocos;
- [x] unidades aparecem abaixo de pavimentos;
- [x] nós podem ser expandidos;
- [x] nós podem ser recolhidos;
- [x] estrutura atualiza após alterações.

## Planejamento de execução

### Descobertas e decisões

- A issue envolve backend e frontend. O módulo backend já possui
  `GET /empreendimentos/{id}/locais`, que retorna os locais de forma plana com
  `id`, `empreendimento_id`, `parent_id`, `nome`, `tipo` e `ordem`.
- A árvore deve ser montada no frontend a partir de `parent_id`, preservando a
  resposta plana da API para não quebrar os endpoints de criação existentes.
- O frontend já possui `carregarEmpreendimento`, `DetalhesEmpreendimento` e a
  rota `admin/empreendimentos/:empreendimentoId`; a estrutura física deve ser
  adicionada como rota filha, carregada pelo Data Router.
- Os tipos físicos válidos são `TORRE`, `BLOCO`, `PAVIMENTO` e `UNIDADE`.
  A montagem deve aceitar qualquer desses tipos e preservar a ordem por
  `ordem` e, como desempate, por `nome`.

### Backend e contrato

- Confirmar e manter `GET /empreendimentos/{id}/locais` como endpoint da
  estrutura, protegido por autenticação e validação de acesso no service.
- Garantir que a consulta filtre pelo empreendimento do caminho e não exponha
  locais de outro empreendimento.
- Garantir que a resposta inclua `parent_id` nulo nos nós raiz e o pai correto
  nos pavimentos e unidades.
- Se for necessário um schema específico para a árvore, criar um schema de
  leitura sem alterar o payload das operações de criação; caso contrário,
  reutilizar `LocalObra_FromDB_Schema`.
- Testar os quatro níveis e empreendimentos sem locais, mantendo resposta
  vazia com status de sucesso.

### Frontend: serviço e Data Router

- Criar no serviço de empreendimentos um tipo `LocalObra`/`LocalObraTipo` e uma
  função para buscar os locais por `empreendimentoId`, usando `apiRequest` e
  aceitando `AbortSignal`.
- Criar um loader dedicado, por exemplo `carregarEstruturaEmpreendimento`,
  que valide o parâmetro `empreendimentoId`, use o `request.signal` e propague
  erros HTTP para `ErroRota`.
- Adicionar a rota `estrutura` como filha de
  `admin/empreendimentos/:empreendimentoId`, com loader próprio e tela da
  estrutura. Reutilizar o empreendimento carregado pela rota pai quando o
  framework permitir, evitando uma chamada duplicada desnecessária.
- Definir o contrato dos dados carregados para que a tela receba a lista plana
  e construa uma árvore determinística.

### Componentes e interação

- Criar `StructureTree` para transformar a lista plana em raízes e filhos,
  agrupando por `parent_id` e ordenando cada nível por `ordem` e `nome`.
- Criar `StructureTreeItem` recursivo ou equivalente para renderizar nome,
  tipo, estado expandido e filhos.
- Permitir expandir e recolher nós sem perder o estado de outros nós.
- Diferenciar visualmente `TORRE`, `BLOCO`, `PAVIMENTO` e `UNIDADE` por rótulo,
  ícone ou classe acessível, sem depender apenas de cor.
- Permitir selecionar um item e expor a seleção por callback/estado, deixando
  o comportamento posterior extensível.
- Renderizar corretamente raiz, filhos, nó sem filhos e lista vazia.
- Usar controles acessíveis, preferencialmente botão com `aria-expanded`,
  `aria-controls` e nome compreensível; não tornar a expansão dependente de
  clique em área não semântica.

### Atualização após alterações

- Definir uma estratégia de atualização quando uma criação de torre, bloco,
  pavimento ou unidade ocorrer: revalidar/recarregar o loader ou atualizar o
  estado local com a resposta criada.
- Garantir que a estratégia preserve a seleção e os nós expandidos sempre que
  possível.
- Exibir estado de carregamento, erro de carregamento e mensagem para
  estrutura vazia.
- Evitar chamadas duplicadas ao trocar de empreendimento ou desmontar a tela;
  respeitar cancelamento via `AbortSignal`.

### Testes e validação

- Backend: testar listagem filtrada por empreendimento, resposta vazia,
  hierarquia com torre/bloco, pavimentos e unidades, e acesso negado.
- Serviço/loader frontend: testar URL correta, `empreendimentoId` ausente,
  propagação do `signal` e propagação de erro da API.
- `StructureTree`: testar construção de raízes, associação pai/filho, ordenação,
  múltiplos níveis, pai ausente e lista vazia.
- `StructureTreeItem`: testar expansão, recolhimento, seleção, rótulos dos
  tipos e atributos de acessibilidade.
- Fluxo da tela: testar carregamento pelo Data Router e atualização após uma
  alteração sem perder os dados da árvore.
- Executar testes, lint, compilação TypeScript e verificação de formatação nos
  projetos backend e frontend conforme os comandos existentes.

### Dependências, riscos e limites

- A issue depende de o backend estar servido e registrado no aplicativo; se o
  router principal ainda não incluir o router de empreendimentos, isso deve
  ser resolvido antes da integração final.
- A resposta plana com `parent_id` é suficiente para a árvore, mas referências
  a pais ausentes devem ser tratadas explicitamente para não descartar dados
  silenciosamente.
- Não duplicar o modelo `LocalObra` no frontend em vários componentes; manter
  tipos e transformação em uma feature de empreendimentos.
- Não implementar novas ações de criação nesta issue; apenas integrar a
  visualização e a atualização às ações existentes.
- Os critérios de aceite permanecem como requisitos da execução e não devem
  ser marcados como concluídos durante o planejamento.
