## Descrição

Permitir que um empreendimento utilize uma taxonomia construtiva específica.

Esse vínculo definirá quais etapas, subetapas e marcos serão utilizados posteriormente para acompanhar a evolução das unidades do empreendimento.

## Implementar

Criar relacionamento entre:

Empreendimento
└── Taxonomia

Permitir:

- selecionar uma taxonomia existente;
- utilizar a taxonomia padrão Constructo;
- duplicar uma taxonomia antes de vincular;
- consultar qual taxonomia está vinculada;
- substituir taxonomia quando permitido pelas regras da V1.

Adicionar ação na página do empreendimento:

`Configurar taxonomia`

Fluxo sugerido:

Empreendimento
    ↓
Selecionar taxonomia
    ↓
Taxonomia padrão Constructo
    ↓
Duplicar para empreendimento
    ↓
Personalizar
    ↓
Utilizar na obra

## Critérios de aceite

- [ ] empreendimento pode receber uma taxonomia;
- [ ] vínculo é persistido;
- [ ] taxonomia vinculada pode ser consultada;
- [ ] taxonomia padrão pode ser utilizada como base;
- [ ] personalização do empreendimento não altera o modelo padrão;
- [ ] frontend exibe a taxonomia vinculada;
- [ ] editor visual abre a taxonomia correta;
- [ ] empreendimento sem taxonomia possui estado visual apropriado.

## Planejamento de execução

### Descobertas e decisões

- O modelo atual já possui a relação lógica em `Taxonomia.empreendimento_id`,
  com unicidade por empreendimento e possibilidade de `NULL` para uma
  taxonomia padrão global. `origem_taxonomia_id` já registra a taxonomia usada
  como base de uma cópia.
- `buscar_taxonomia_do_empreendimento` consulta o vínculo atual e retorna erro
  quando o empreendimento ainda não possui taxonomia.
- `personalizar_taxonomia` já duplica etapas, subetapas, marcos, ordens e
  descrições para uma taxonomia vinculada ao empreendimento. A execução desta
  issue deve reutilizar essa operação, não criar uma segunda rotina de cópia.
- As rotas administrativas existentes já expõem consulta e personalização em
  `/empreendimentos/{empreendimento_id}/taxonomia` e restringem acesso a ADMIN
  ou GESTOR com vínculo ao empreendimento.
- O frontend já possui a rota/editor
  `/admin/empreendimentos/:empreendimentoId/taxonomia`, mas o detalhe do
  empreendimento apenas oferece o link de edição e não apresenta o estado,
  origem ou ação explícita de configurar/vincular taxonomia.
- A decisão para a V1 é manter no máximo uma taxonomia vinculada por
  empreendimento. Substituição só será permitida quando não houver impedimento
  de domínio definido pelo fluxo de acompanhamento; qualquer política de
  substituição destrutiva deve ser decidida antes da implementação.

### Implementação prevista

1. **Contrato backend**
   - Confirmar/ajustar `TaxonomiaLer` para expor `empreendimento_id`,
     `origem_taxonomia_id`, `is_padrao` e metadados necessários à tela.
   - Criar schema de consulta/listagem de taxonomias disponíveis, caso o
     frontend precise selecionar uma taxonomia existente em vez de conhecer um
     ID previamente informado.
   - Definir payload para configurar o empreendimento, distinguindo seleção
     direta de taxonomia padrão e criação de cópia personalizada.

2. **Modelo, persistência e services**
   - Manter a unicidade de `Taxonomia.empreendimento_id` como garantia de um
     vínculo ativo por empreendimento.
   - Implementar no service uma operação explícita de configuração, reutilizando
     `buscar_taxonomia_do_empreendimento`, `criar_taxonomia` e
     `personalizar_taxonomia` conforme o caso.
   - Validar empreendimento e taxonomia de origem inexistentes, impedir origem
     pertencente a outro vínculo incompatível e impedir alterações na
     taxonomia padrão global.
   - Definir regra para substituição: bloquear quando já existirem progressos
     associados à taxonomia ou exigir confirmação/fluxo de cópia; não apagar
     silenciosamente etapas usadas por unidades.
   - Criar migration somente se o contrato final exigir coluna/constraint ainda
     ausente; o estado atual já possui os campos estruturais necessários.

3. **Rotas**
   - Adicionar endpoint administrativo para listar taxonomias disponíveis e/ou
     configurar a taxonomia do empreendimento, mantendo o prefixo
     `/empreendimentos` e os guards `get_admin_ou_gestor`.
   - Diferenciar respostas para empreendimento sem taxonomia (`404` ou payload
     de estado vazio), taxonomia inexistente (`404`) e vínculo inválido (`400`).
   - Preservar `GET /empreendimentos/{empreendimento_id}/taxonomia` como fonte
     única para consultar a taxonomia atualmente vinculada.

4. **Frontend**
   - Na página de detalhes do empreendimento, adicionar a seção/ação
     `Configurar taxonomia`.
   - Criar loader/serviço para obter a taxonomia vinculada e, se necessário,
     listar taxonomias padrão/disponíveis.
   - Exibir estados claros: taxonomia vinculada, origem padrão, cópia
     personalizada e empreendimento sem taxonomia.
   - Abrir o `TaxonomyEditor` somente com o empreendimento/taxonomia corretos;
     após configuração, revalidar os loaders e atualizar o link do editor.
   - Usar `useFetcher`/action para configurar sem navegação desnecessária e
     tratar loading, erro e acesso negado.

### Testes e validação

- Testar vínculo de uma taxonomia existente a um empreendimento e sua
  persistência após commit e nova sessão.
- Testar consulta do vínculo e o estado de empreendimento sem taxonomia.
- Testar seleção da taxonomia padrão e criação de cópia com
  `origem_taxonomia_id`, verificando que a origem permanece inalterada.
- Testar tentativa de segundo vínculo, empreendimento inexistente, taxonomia
  inexistente e origem inválida.
- Testar a regra de substituição definida para a V1, incluindo taxonomia com
  progresso já associado.
- Testar autorização: ADMIN, GESTOR vinculado, GESTOR sem vínculo e
  COMPRADOR.
- Testar frontend para estados vazio/preenchido, seleção/configuração,
  revalidação e abertura do editor correto.
- Executar testes backend focados, testes da rota/loader/action frontend e
  `git diff --check`; ampliar a suíte apenas após os testes focados passarem.

### Dependências, riscos e limites

- A issue depende da decisão de negócio sobre substituir uma taxonomia já usada
  por progressos; sem essa decisão, implementar apenas seleção inicial e cópia
  segura.
- O modelo atual representa a taxonomia padrão global com
  `empreendimento_id = NULL`; taxonomias de empreendimento são cópias
  independentes. Não alterar esse desenho sem migração e plano de dados.
- O editor da issue-174 já consulta a taxonomia vinculada; mudanças de endpoint
  devem preservar seus contratos ou atualizar loader e serviços em conjunto.
- Não incluir nesta issue a edição de etapas/marcos, progresso de unidades ou
  área do comprador, salvo o necessário para impedir substituição insegura.
- Nenhum critério de aceite deve ser marcado como concluído no planejamento;
  a conclusão depende de código, testes e validação executados pelo agente
  executor.
