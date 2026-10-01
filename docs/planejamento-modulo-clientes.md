# Constructo — planejamento do módulo de clientes V1

**Módulo:** `modulos/clientes`  
**Experiência do comprador:** Meu Apê  
**Base:** `epic-01-dominio.md`, domínio V1 fornecido nesta conversa.  
**Objetivo:** entregar acompanhamento personalizado da construção, reutilizando locais, taxonomia, regras de progresso e publicações de `modulos/dominio`.

Este documento especifica arquitetura, regras, contratos de leitura, interface e grupos de issues para implementação. As rotas, DTOs, componentes e funções adicionais descritos aqui são propostas; não representam código já verificado no repositório. O arquivo de domínio é a referência para as regras existentes. A interface atual de torres/pavimentos/apartamentos foi descrita pelo solicitante, mas seus componentes e telas não foram fornecidos: o reaproveitamento concreto será validado na primeira issue.

Os títulos **EPIC - 1** até **EPIC - 7** são locais ao planejamento de clientes. Ao cadastrar no tracker do projeto, usar o prefixo `[Clientes]` para distingui-los do Epic 1 de domínio. `CLI-01` até `CLI-28` são identificadores propostos para as issues, não números existentes no GitHub.

## 1. Resultado esperado e escopo

O comprador entra no portal, identifica seu apartamento, acompanha as etapas da construção e consulta atualizações com fotos autorizadas. Se possui mais de uma unidade, consegue alternar entre elas sem perder o contexto de empreendimento, torre e pavimento.

O módulo de clientes será uma camada de aplicação e apresentação sobre o domínio. O domínio permanece responsável pelo significado de empreendimento, local, taxonomia, etapa, marco, progresso, evidência, publicação e vínculo de acesso.

### Escopo da V1

- Área autenticada do comprador, integrada à autenticação existente.
- Lista das próprias unidades e navegação física filtrada.
- Resumo e progresso por unidade e etapa, calculados pelas regras do domínio.
- Árvore de etapas e subetapas, com marcos e linguagem voltada ao comprador.
- Feed de publicações autorizadas e galeria das evidências explicitamente selecionadas.
- Interface responsiva, acessível e consistente com a visualização de locais já criada.
- Concessão e remoção controladas do vínculo comprador × unidade, por gestão autorizada.
- Testes de isolamento de acesso, integração com o domínio e jornada completa.

### Evolução posterior

Notificações por e-mail/WhatsApp/push, chat, documentos contratuais, financeiro, previsão de entrega, visita agendada, comparação com outras unidades, visualização 3D e versionamento da taxonomia ficam fora da V1. Não apresentar previsões ou percentuais financeiros deduzidos dos marcos.

## 2. Vocabulário e regras de integração

| Conceito | Regra para o módulo de clientes |
| --- | --- |
| Cliente | Nome da experiência de produto; na V1 corresponde ao usuário existente com papel `COMPRADOR`. |
| Unidade do cliente | Local do tipo `UNIDADE`, ligado ao comprador por `usuarios_unidades`. Um comprador pode possuir várias unidades; uma unidade pode possuir vários compradores. |
| Árvore física | `Empreendimento → Torre → Pavimento → Unidade`. Empreendimento é a raiz lógica; não criar um local adicional para representá-lo. |
| Árvore de construção | `Taxonomia → Etapas → Subetapas → Marcos`, respeitando os limites de profundidade do domínio V1. |
| Taxonomia | Plano de etapas do empreendimento. O cliente consulta a mesma taxonomia usada na gestão; não recebe uma cópia particular. |
| Marco | Definição de um resultado verificável. Seu estado real depende da ocorrência na unidade selecionada. |
| Progresso | Estado e cálculo relacionados à unidade; a definição de marco sozinha não informa execução. Ausência de ocorrência conta como não iniciado. |
| Publicação | Atualização destinada ao comprador, vinculada a uma ocorrência. Somente conteúdo publicado e autorizado entra no portal. |
| Evidência | Registro interno. Só é acessível no portal quando selecionado em uma publicação autorizada da unidade. |
| Vínculo | Concessão explícita de acesso à unidade. Campos textuais legados de cadastro não concedem acesso. |

**Duas árvores, duas responsabilidades:** a árvore física responde “qual é o meu apartamento?”; a taxonomia responde “como está a construção dele?”. Torre e pavimento não são etapas da taxonomia, embora ambas as estruturas apareçam na experiência do cliente.

### Invariantes obrigatórias

1. Usar o usuário autenticado da sessão; nenhuma rota de comprador aceita `comprador_id` para escolher de quem ler dados.
2. Validar usuário ativo e papel `COMPRADOR`, além do vínculo atual à unidade. Acesso administrativo exige fluxo explícito separado.
3. Validar que a unidade e o marco pertencem ao mesmo empreendimento, conforme os serviços de domínio.
4. Filtrar autorização no backend antes de agregar, paginar ou montar a resposta. Ocultar no frontend é insuficiente.
5. Reutilizar `pode_ler_unidade` e `publicacoes_da_unidade` para as responsabilidades já disponíveis. Serviços novos devem preservar essas regras.
6. Manter `usuarios_unidades` como vínculo N:N. Não introduzir `cliente.unidade_id` nem duplicar tabelas de empreendimento, taxonomia ou progresso.
7. Não usar `usuarios.empreendimento` ou `usuarios.unidade` como identificadores ou permissões. Reconciliar dados legados por seleção explícita de registros reais.
8. Não entregar `descricao_tecnica`, rascunhos, evidências não selecionadas ou `arquivo_url` bruto nos DTOs do comprador.
9. Exibir descrições para comprador disponíveis no domínio. Como fallback, usar o nome do item; nunca usar automaticamente a descrição técnica.
10. Preservar as transições e datas do domínio. O portal de cliente não altera estado de marcos, etapas, taxonomia ou publicações.
11. Executar operações de escrita com a sessão recebida e a fronteira transacional existente; serviços não fazem `commit` por conta própria.
12. Verificar autorização novamente em cada leitura e download, inclusive após remoção do vínculo.

## 3. Progresso e transparência para o comprador

### Política proposta para a V1

O comprador pode consultar **o estado e o progresso operacional da própria unidade**, mesmo quando ainda não existe uma publicação explicando a mudança. Textos de atualização e fotos continuam dependentes de publicação explícita. Essa é uma decisão de produto proposta para esta fase, compatível com a reutilização do cálculo existente; deve ficar registrada na CLI-02 antes da implementação das telas.

Essa separação precisa ser clara na interface:

- **“Progresso de execução”** mostra o cálculo atual do domínio.
- **“Última atualização publicada”** mostra o instante da publicação mais recente autorizada.
- **“Sem atualização publicada para este marco”** indica ausência de comunicação, sem mudar seu estado operacional.

Não chamar o percentual de “progresso publicado”: o domínio atual não registra snapshots de estado e percentual por publicação. Exibir apenas avanço divulgado exigiria outro contrato, armazenamento e cálculo; essa alternativa fica fora deste planejamento V1.

### Cálculo

`progresso_unidade = marcos concluídos aplicáveis / total de marcos aplicáveis × 100`

Reutilizar `calcular_progresso_unidade`, inclusive o arredondamento ao inteiro definido pelo domínio. Marcos sem ocorrência continuam no denominador. Para uma etapa, incluir seus marcos e os de suas subetapas, sem duplicar a contagem.

| Situação | Comportamento do portal |
| --- | --- |
| Unidade com 3 de 8 marcos concluídos | Mostrar o inteiro retornado pelo domínio e o texto “3 de 8 marcos concluídos”. |
| Existem marcos, nenhum iniciado | Mostrar 0% e “Ainda não iniciado”. |
| Não existe taxonomia | Mostrar “Plano de acompanhamento ainda não disponibilizado”. |
| Taxonomia sem marcos | O cálculo retorna 0%; a tela mostra “Sem marcos definidos”, evitando sugerir obra atrasada ou parada. |
| Marco concluído e reaberto | Mostrar o novo estado e percentual atual; o avanço pode diminuir. Não inventar justificativa ou histórico ausente no domínio. |
| Mudança na taxonomia | Recalcular com o denominador atual. Informar que o indicador considera o plano vigente, sem inventar uma série histórica. |
| Cliente com unidades em dois empreendimentos | Calcular cada unidade dentro da sua própria taxonomia; não misturar os planos. |

Na V1, a tela principal não precisa de um percentual consolidado de todo o patrimônio do comprador. Para agrupamentos, mostrar quantidade de **suas unidades** e cartões individuais. Não usar `calcular_progresso_empreendimento` como progresso do cliente: essa função agrega todas as unidades do empreendimento.

### Estado resumido de uma etapa

Trata-se de uma projeção de leitura, não de um novo estado persistido:

- Sem marcos: “Sem marcos definidos”.
- Todos os marcos concluídos, com total maior que zero: “Concluída”.
- Pelo menos um marco em andamento ou concluído, sem todos concluídos: “Em andamento”.
- Todos os marcos não iniciados: “Não iniciada”.

Marcos e etapas são unidades de contagem, não pesos financeiros. Não adicionar média de percentuais arredondados nem ponderação inventada no frontend.

## 4. Arquitetura e fronteiras dos módulos

### Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| Autenticação existente | Sessão, identidade, atividade do usuário e papel. |
| `modulos/dominio/modelos.py` | Entidades, associações, FKs e invariantes persistidas. |
| `modulos/dominio/servicos.py` | Validações de domínio, acesso à unidade, progresso e visibilidade de publicações. |
| Consultas de domínio a acrescentar, se necessário | Buscar árvore e contagens em lote e consultar evidência publicada autorizada. Preservar as mesmas regras de visibilidade. |
| `modulos/clientes/servicos.py` | Orquestrar leituras do comprador e montar as projeções necessárias às telas. |
| `modulos/clientes/esquemas.py` | DTOs explícitos, sem serialização automática de modelos internos. |
| `modulos/clientes/rotas.py` | Contrato HTTP, dependências de autenticação, paginação e tradução de erros. |
| Frontend da área de clientes | Navegação, componentes, estados de interação e exibição dos contratos recebidos. |

Direção da dependência: **clientes usa domínio; domínio não importa clientes**. Autenticação é uma infraestrutura transversal, não uma duplicação dentro de clientes.

Aplicar a separação de responsabilidades semelhante ao MVC: rotas como entrada/controlador, serviços e domínio como lógica, componentes como apresentação. O backend permanece a fonte das regras de autorização e cálculo.

### Estrutura proposta

```text
modulos/clientes/
  __init__.py
  rotas.py
  esquemas.py
  servicos.py

frontend/<estrutura-existente>/clientes/
  paginas/
  componentes/
  api/
```

O diretório de frontend será ajustado ao projeto existente. Criar arquivos adicionais somente quando houver uma responsabilidade concreta. Não começar com uma nova tabela `clientes`, um CRUD genérico de clientes ou um repositório paralelo que reproduza validações do domínio.

### Projeções de leitura propostas

| Projeção | Conteúdo mínimo |
| --- | --- |
| `UnidadeClienteResumo` | ID e nome da unidade; ancestrais autorizados; IDs e nomes de empreendimento, torre e pavimento; contagens de marcos; percentual; última publicação autorizada ou `null`. |
| `ResumoAcompanhamentoCliente` | Unidade; existência de taxonomia; existência de marcos; progresso; resumo das etapas; última publicação. |
| `EtapaCliente` | ID, nome, descrição para comprador, ordem, `parent_id`, contagens, percentual, estado derivado, subetapas e marcos. |
| `MarcoCliente` | ID, nome, descrição para comprador, estado da ocorrência ou não iniciado, indicação de publicações disponíveis. |
| `PublicacaoCliente` | ID, texto destinado ao comprador, `publicado_em`, unidade, identificação da etapa/marco e evidências selecionadas. |
| `EvidenciaPublicadaCliente` | ID e metadados seguros para apresentação; rota autenticada de conteúdo e miniatura, quando disponível. |

Os identificadores mantêm os tipos definidos no domínio; não assumir UUID ou inteiro sem verificar os modelos. `descricao_cliente` ou campo equivalente deve ser mapeado conforme o modelo real. Campos novos de resposta são projeções, não colunas obrigatórias.

### Consultas e desempenho

- Montar agrupamentos a partir das unidades vinculadas ao usuário e apenas seus ancestrais.
- Não carregar todos os apartamentos para depois remover os não autorizados em memória.
- Buscar marcos, ocorrências e contagens em lote. Evitar uma consulta por marco ou por cartão.
- Centralizar o cálculo e sua semântica no domínio. Se o helper atual por unidade gerar N+1, criar um serviço de lote no domínio que compartilhe a mesma regra e provar sua equivalência nos testes.
- A projeção de resumo deve ter contagens e percentual consistentes na mesma leitura. Usar uma consulta agregada ou snapshot transacional adequado quando várias consultas forem necessárias.
- Paginar feed e galeria; não carregar todas as fotos na abertura da tela.
- Não manter cache compartilhado entre compradores. Qualquer cache futuro precisa incluir usuário/unidade e uma estratégia de invalidação de vínculos.

## 5. Contratos HTTP propostos

As rotas abaixo serão acrescentadas na fase de clientes. O documento de domínio informa que sua primeira etapa não criou endpoints novos.

| Método e rota | Uso | Regras |
| --- | --- | --- |
| `GET /clientes/me/unidades` | Listar próprias unidades com contexto físico | Identidade da sessão; paginação quando necessário; nenhum apartamento de terceiros. |
| `GET /clientes/me/locais` | Árvore física para o seletor | Somente ancestrais das próprias unidades e folhas autorizadas; sem totais gerais da obra. |
| `GET /clientes/me/unidades/{unidade_id}/resumo` | Cabeçalho e indicadores | Autorizar unidade antes de montar resposta. |
| `GET /clientes/me/unidades/{unidade_id}/etapas` | Taxonomia projetada para a unidade | Ordem do domínio; subetapas válidas; marcos sem ocorrência incluídos. |
| `GET /clientes/me/unidades/{unidade_id}/publicacoes` | Feed | Publicações autorizadas; filtro opcional por etapa/marco da mesma taxonomia; cursor e limite. |
| `GET /clientes/me/unidades/{unidade_id}/publicacoes/{publicacao_id}` | Detalhe da atualização | Publicação precisa pertencer à unidade e estar publicada e autorizada. |
| `GET /clientes/me/unidades/{unidade_id}/publicacoes/{publicacao_id}/evidencias/{evidencia_id}/conteudo` | Foto/arquivo autorizado | Vínculo atual, publicação visível, associação explícita e evidência do mesmo progresso. |
| `GET /clientes/me/unidades/{unidade_id}/publicacoes/{publicacao_id}/evidencias/{evidencia_id}/miniatura` | Miniatura autenticada | Mesmas verificações do conteúdo original. |

Para o feed, proposta de `limite` padrão 20, máximo 50; ordenação decrescente por `(publicado_em, id)` e cursor opaco ligado à unidade e aos filtros. Autorizar a unidade mesmo ao usar cursor. Datas da API em formato consistente com o backend, com fuso definido; frontend apresenta o horário local.

Rotas de concessão e remoção de vínculo pertencem à **gestão**, fora do namespace de autosserviço do comprador. Seus nomes serão alinhados aos endpoints de gestão existentes na CLI-06. A V1 não concede acesso por digitação de número de apartamento, e-mail, texto legado ou URL.

### Erros e acesso a arquivos

| Caso | Resposta/comportamento |
| --- | --- |
| Sessão ausente ou inválida | `401`; direcionar ao login, preservando retorno seguro. |
| Usuário sem papel permitido ou inativo | `403`, conforme política de sessão existente. |
| Unidade inexistente ou sem vínculo | Mesma resposta `404`, evitando diferenciar a existência de unidade de terceiro. |
| Publicação/evidência invisível, inválida ou de outra unidade | `404`, mesmo que o ID exista internamente. |
| Filtro incompatível com a unidade ou cursor malformado | `422`, sem revelar dados de terceiros. |
| Lista de unidades vazia | `200` com lista vazia; tela de ausência de vínculo. |
| Unidade válida sem taxonomia/publicações | `200` com estado vazio explícito. |

Na V1, servir arquivos privados por uma rota autenticada que verifica acesso e transmite os bytes. Não redirecionar para `arquivo_url` público. Isso permite bloquear novas requisições após revogar o vínculo; conteúdo já baixado não pode ser recolhido.

Miniaturas são derivadas privadas sujeitas à mesma autorização. Evitar cache público; usar política privada sem armazenamento para conteúdo sensível. URLs assinadas de storage só entram em evolução posterior com análise explícita do período de validade e da revogação. Não expor nome de bucket, caminho interno ou metadados técnicos desnecessários.

## 6. UI do comprador — continuidade com a navegação existente

### Diretriz central

Reutilizar linguagem visual, cartões, ícones, espaçamentos, estados de seleção e navegação de torre/pavimento/apartamento já existentes. Adaptar a densidade e o conteúdo para a pergunta do comprador: **“Como está o meu apartamento?”**

A home é **“Meu Apê”**. A taxonomia aparece como **“Etapas da construção”**; não usar termos de configuração como título principal. Não exibir controles de criar, editar, excluir, arrastar etapas ou publicar conteúdo.

### Jornada principal

| Momento | Comportamento |
| --- | --- |
| Comprador com uma unidade | Abrir o resumo diretamente; mostrar contexto completo no cabeçalho. |
| Comprador com várias unidades | Abrir “Minhas unidades”, agrupadas por empreendimento; cada cartão identifica torre, pavimento e apartamento. |
| Seleção da unidade | Abrir resumo e etapas; manter seletor para trocar de apartamento. |
| Expansão de uma etapa | Mostrar descrição simples, subetapas, marcos, estados e acesso às atualizações correspondentes. |
| Abertura de uma publicação | Mostrar texto, data e fotos selecionadas; manter contexto do marco e da unidade. |
| Troca de unidade | Limpar dados da unidade anterior, carregar o novo contexto e descartar respostas antigas que cheguem depois. |
| Nenhum vínculo | Mostrar “Nenhuma unidade vinculada à sua conta” e orientação de contato pelo canal já existente, sem criar chat nesta fase. |

### Navegação física filtrada

Exibir somente empreendimentos, torres e pavimentos que contêm alguma unidade autorizada ao comprador. Em cada pavimento, exibir somente seus apartamentos. Não mostrar apartamentos de terceiros como bloqueados ou vazios; não revelar nomes de compradores ou taxas de avanço de outras unidades.

Exemplo ilustrativo: um comprador vinculado ao apartamento 402, torre A, e ao 801, torre B, vê os caminhos dessas duas unidades. Isso não concede acesso aos demais apartamentos dos respectivos pavimentos. No seletor, “2 unidades suas” é permitido; “120 unidades no empreendimento” não faz parte desta V1.

Preservar o breadcrumb `Empreendimento / Torre / Pavimento / Apartamento`. O cliente não precisa percorrer todos os níveis a cada acesso; a navegação hierárquica funciona como orientação e troca de contexto.

### Composição da página da unidade

| Região | Conteúdo e interação |
| --- | --- |
| Cabeçalho | “Apartamento 402”; empreendimento, torre e pavimento; seletor “Trocar unidade” quando houver outras. |
| Resumo | “Progresso de execução”; percentual e contagem; última atualização publicada. Texto curto informa que o indicador considera os marcos do plano vigente. |
| Etapas da construção | Lista hierárquica ordenada com expansões; nome, estado textual, contagem e barra por etapa. |
| Atualizações | Feed com texto inicial, data, etapa/marco e miniatura autorizada. Filtros por etapa e marco. |
| Detalhe da atualização | Texto completo e galeria; abrir foto em visualizador com controles acessíveis. |

Desktop: cabeçalho e resumo no topo, navegação de etapas e conteúdo com espaço para leitura; o feed pode acompanhar a seleção de etapa. Mobile: uma coluna, resumo compacto e abas **“Etapas” / “Atualizações”**. O acesso às fotos fica no detalhe da publicação; não criar uma terceira aba obrigatória na V1.

### Árvore de etapas e marcos

- Ordem vem de `ordem` no domínio; usar desempate estável definido no contrato. Não ordenar alfabeticamente no frontend.
- Etapa: título, descrição para comprador, percentual e estado derivado.
- Subetapa: indentação e agrupamento visível, respeitando a profundidade aceita pelo domínio.
- Marco: nome, descrição simples e estado da ocorrência para a unidade selecionada.
- Preservar pais ao aplicar um filtro, para manter orientação hierárquica.
- Uma etapa sem marcos mostra o estado específico de ausência de configuração.
- Não usar fotos como requisito para exibir um marco: ele existe mesmo sem publicação.
- Não exibir estado “Atrasado”, prazo ou data de entrega sem dados e regras próprios.

### Microcopy e estados

| Estado | Mensagem/interação proposta |
| --- | --- |
| Unidade sem taxonomia | “O plano de acompanhamento deste apartamento ainda será disponibilizado.” |
| Taxonomia sem marcos | “As etapas estão sendo organizadas. O progresso aparecerá quando os marcos forem definidos.” |
| Sem publicações | “Ainda não há atualizações publicadas para este apartamento.” |
| Filtro sem resultados | “Nenhuma atualização para este filtro”; ação “Limpar filtros”. |
| Falha de carregamento | Mensagem curta e ação “Tentar novamente”; não confundir com ausência de dados. |
| Acesso removido | “Esta unidade não está mais disponível para sua conta”; limpar dados e retornar às unidades acessíveis. |
| Foto indisponível | Placeholder com mensagem; restante da publicação continua legível. |
| Marco em andamento sem publicação | “Em andamento” e “Sem atualização publicada para este marco”. |

Usar skeletons na carga inicial. Na mudança de unidade, não manter fotos ou percentuais do apartamento anterior sob o novo título. A URL pode guardar unidade, etapa selecionada e aba; recarregar ou abrir um link nunca dispensa autorização no servidor.

### Acessibilidade e responsividade

- Estado sempre representado por texto e ícone, além da cor.
- Expansões operáveis por teclado, com `aria-expanded` e foco visível.
- Barras de progresso com nome acessível e valor textual; estados sem marcos não anunciam avanço real de 0%.
- Galeria com fechar por teclado, foco contido no diálogo e retorno ao controle que a abriu.
- Descrição de fotos quando disponível; não inventar o que uma imagem mostra.
- Sem rolagem horizontal em larguras móveis comuns; alvos de toque confortáveis e contraste legível.
- Componentes compartilhados recebem permissões/ações explícitas. Não usar apenas CSS para ocultar controles administrativos.

## 7. EPICs de implementação

Cada issue inclui objetivo, entrega e critérios verificáveis. São unidades de trabalho propostas; podem ser subdivididas durante o refinamento se houver tamanho excessivo. As dependências indicam pré-requisitos técnicos, não impedem desenhar telas com contratos e dados fictícios identificados como tais.

| Grupo | Nome | Descrição | Issues |
| --- | --- | --- | --- |
| EPIC - 1 | Contratos e integração com o domínio | Fixar fronteiras, políticas e reaproveitamento da UI e dos serviços existentes. | CLI-01 a CLI-04 |
| EPIC - 2 | Identidade, vínculos e isolamento do comprador | Garantir que cada comprador acesse somente unidades explicitamente vinculadas. | CLI-05 a CLI-08 |
| EPIC - 3 | Taxonomia e progresso personalizados | Projetar etapas, subetapas e marcos no contexto de cada unidade autorizada. | CLI-09 a CLI-12 |
| EPIC - 4 | Publicações e evidências privadas | Entregar feed e arquivos com visibilidade controlada pelo domínio. | CLI-13 a CLI-16 |
| EPIC - 5 | Meu Apê e navegação por unidades | Adaptar a UI de locais físicos à jornada individual do comprador. | CLI-17 a CLI-20 |
| EPIC - 6 | Etapas, atualizações e experiência responsiva | Implementar o acompanhamento da construção com clareza e acessibilidade. | CLI-21 a CLI-24 |
| EPIC - 7 | Validação integrada e entrega da V1 | Comprovar isolamento, regras, desempenho e jornada antes da disponibilização. | CLI-25 a CLI-28 |

### EPIC - 1 — Contratos e integração com o domínio

**Descrição:** preparar `modulos/clientes` como consumidor do domínio e mapear a UI existente antes de ampliar o backend ou duplicar componentes.

**CLI-01 — Mapear domínio e componentes existentes**

- **Entrega:** inventário de modelos, serviços, autenticação, navegação física e componentes reutilizáveis, comparando código real com `epic-01-dominio.md`.
- **Aceite:** identificar onde vivem as regras de unidade, taxonomia e publicação; localizar componentes de torre/pavimento/apartamento; documentar divergências e lacunas; não assumir endpoint ou campo inexistente.
- **Dependência:** acesso ao repositório e à UI de referência.

**CLI-02 — Registrar políticas de visibilidade e progresso**

- **Entrega:** decisão de arquitetura/produto sobre progresso operacional da unidade, publicações, evidências e papel do comprador, conforme seções 2 e 3.
- **Aceite:** estabelecer o que cada DTO pode expor; registrar que percentual não é financeiro nem histórico publicado; confirmar tratamento de usuário inativo e acessos administrativos; definir limites exatos de profundidade conforme domínio.
- **Dependência:** CLI-01.

**CLI-03 — Definir DTOs e contratos da API de clientes**

- **Entrega:** esquemas de unidade, resumo, etapa, marco, publicação e evidência; contratos de erros, filtros, ordenação e paginação.
- **Aceite:** todos os campos têm origem ou regra de derivação; exemplos incluem estado vazio e múltiplas unidades; nenhum DTO inclui descrição técnica, rascunho ou URL de storage; tipos de IDs acompanham o domínio.
- **Dependência:** CLI-01, CLI-02.

**CLI-04 — Criar estrutura de aplicação do módulo**

- **Entrega:** `modulos/clientes` com rotas, esquemas e serviços integrados à aplicação existente.
- **Aceite:** importação e inicialização funcionam; direção clientes → domínio preservada; sessão e autenticação reaproveitadas; nenhuma tabela de cliente ou cópia do domínio criada sem necessidade demonstrada.
- **Dependência:** CLI-03.

**Conclusão do EPIC:** contratos e políticas registrados, componentes identificados e estrutura pronta para as consultas.

### EPIC - 2 — Identidade, vínculos e isolamento do comprador

**Descrição:** implementar a seleção de unidades e a autorização que sustentarão todas as telas e arquivos.

**CLI-05 — Integrar sessão e autorização de comprador**

- **Entrega:** dependência de usuário ativo `COMPRADOR` e verificação comum de acesso à unidade.
- **Aceite:** identidade deriva da sessão; login reutilizado; testes distinguem sessão inválida, papel indevido e unidade sem vínculo; `pode_ler_unidade` é reutilizado; comprador não escolhe outro usuário via parâmetro.
- **Dependência:** CLI-04.

**CLI-06 — Conceder e remover vínculos pela gestão**

- **Entrega:** fluxo mínimo de gestão para vincular/desvincular usuários e unidades usando `usuarios_unidades` e serviços de domínio; reutilizar fluxo existente, se houver.
- **Aceite:** gestor só opera em empreendimento autorizado; administrador exige autorização explícita; destino é usuário ativo `COMPRADOR`; local deve ser `UNIDADE`; duplicidade tratada sem vínculos repetidos; remoção bloqueia novas leituras; comprador não pode se vincular sozinho.
- **Dependência:** CLI-01, CLI-05; autorização de gestão existente ou tarefa habilitadora explícita.

**CLI-07 — Listar próprias unidades e ancestrais**

- **Entrega:** consultas de `/clientes/me/unidades` e `/clientes/me/locais`.
- **Aceite:** N:N funciona para coproprietários e múltiplas unidades; somente ancestrais necessários entram na árvore; nenhuma unidade de terceiro ou contagem global aparece; cadastro legado isolado não libera acesso.
- **Dependência:** CLI-05.

**CLI-08 — Padronizar isolamento e revogação**

- **Entrega:** tratamento uniforme de IDs sem acesso, remoção de vínculo e sessão inativa; testes negativos reutilizáveis para as rotas futuras.
- **Aceite:** trocar IDs na URL retorna `404` sem dados; vínculo removido durante sessão aberta bloqueia a próxima leitura; caminhos de unidade e filtros não contornam autorização; falha não vaza nomes, existência de publicação ou apartamento.
- **Dependência:** CLI-06, CLI-07; ampliar cobertura após EPICs 3 e 4.

**Conclusão do EPIC:** comprador consegue selecionar apenas unidades autorizadas e o acesso acompanha o vínculo atual.

### EPIC - 3 — Taxonomia e progresso personalizados

**Descrição:** transformar o plano compartilhado do empreendimento em acompanhamento específico da unidade do comprador.

**CLI-09 — Projetar árvore de etapas para uma unidade**

- **Entrega:** leitura de taxonomia, etapas, subetapas e marcos com descrições para comprador.
- **Aceite:** respeitar profundidade e ordem do domínio; manter marco sem ocorrência como não iniciado; não trazer taxonomia de outro empreendimento; não expor descrição técnica; estados vazios distintos.
- **Dependência:** CLI-03, CLI-05.

**CLI-10 — Integrar cálculos e estados derivados**

- **Entrega:** percentual e contagens por unidade/etapa e estado resumido de etapa.
- **Aceite:** cálculo coincide com `calcular_progresso_unidade`; inclui marcos de subetapas sem duplicação; não arredonda antes da agregação; reabertura reduz o progresso corretamente; total zero não produz divisão por zero ou etapa concluída.
- **Dependência:** CLI-09.

**CLI-11 — Construir resumo do acompanhamento**

- **Entrega:** endpoint de resumo com unidade, contagens, percentual, estado de configuração e última publicação autorizada.
- **Aceite:** última publicação ignora rascunhos; ausência de publicação não muda o cálculo operacional; resposta não usa agregado de todo o empreendimento; contagens e percentual são consistentes na leitura.
- **Dependência:** CLI-10; consulta de publicações autorizadas existente no domínio.

**CLI-12 — Otimizar consultas de progresso em lote**

- **Entrega:** leitura em lote, índices justificados e registro do número de consultas para listas e árvore.
- **Aceite:** sem consulta por marco/cartão; mesmo resultado da regra original; consultas limitadas às unidades autorizadas; validar volume representativo e orçamento de consultas definido após CLI-01; índice novo só com migration necessária.
- **Dependência:** CLI-07, CLI-10, CLI-11.

**Conclusão do EPIC:** API entrega o plano do empreendimento projetado corretamente para cada unidade do cliente.

### EPIC - 4 — Publicações e evidências privadas

**Descrição:** disponibilizar atualizações e fotos somente quando publicadas e autorizadas pelas regras do domínio.

**CLI-13 — Implementar feed autorizado por unidade**

- **Entrega:** listagem com cursor, limite, ordem estável e filtro por etapa/marco.
- **Aceite:** reutilizar `publicacoes_da_unidade`; rascunhos ausentes; filtrar autorização antes da paginação; cursor não permite mudar unidade ou filtros silenciosamente; nenhuma publicação de terceiro aparece.
- **Dependência:** CLI-03, CLI-05, CLI-09.

**CLI-14 — Implementar detalhe e seleção de evidências**

- **Entrega:** detalhe de publicação com evidências de `publicacoes_evidencias`.
- **Aceite:** exigir publicação visível da unidade; retornar apenas evidências selecionadas do mesmo progresso; mesma evidência pode aparecer em mais de uma publicação autorizada; nenhuma listagem retorna todas as evidências internas da ocorrência.
- **Dependência:** CLI-13.

**CLI-15 — Servir conteúdo e miniaturas com autorização**

- **Entrega:** rota de transmissão autenticada e estratégia mínima de miniaturas privadas; definir fallback se geração ainda não existir.
- **Aceite:** acesso validado a cada pedido; link direto sem sessão falha; trocar qualquer ID falha; vínculo removido bloqueia novas requisições; storage URL ausente do DTO; miniatura tem a mesma proteção; não usar cache público.
- **Dependência:** CLI-14; integração real de armazenamento disponível ou tarefa habilitadora registrada.

**CLI-16 — Paginar mídia e tratar falhas de arquivo**

- **Entrega:** contratos e carregamento controlado de fotos, com erro isolado por arquivo.
- **Aceite:** não carregar originais ao listar feed; limitar itens por página; objeto indisponível não quebra publicação inteira; erro não vaza caminho interno; frontend distingue foto sem acesso de falha recuperável conforme contrato.
- **Dependência:** CLI-15.

**Conclusão do EPIC:** texto publicado e fotos selecionadas chegam ao comprador, mantendo privado o restante das evidências.

### EPIC - 5 — Meu Apê e navegação por unidades

**Descrição:** adaptar a experiência existente de locais físicos para o acesso pessoal do comprador.

**CLI-17 — Especificar telas usando o design existente**

- **Entrega:** wireframes desktop/mobile de minhas unidades, resumo, etapas e publicação; mapeamento de componentes e variações de leitura.
- **Aceite:** preservar identidade visual observada na CLI-01; separar árvore física e de construção; criar estados de uma/várias/nenhuma unidade; nenhum controle administrativo presente na jornada do comprador.
- **Dependência:** CLI-01, CLI-02, CLI-03.

**CLI-18 — Implementar Minhas unidades e seletor físico**

- **Entrega:** cartões agrupados por empreendimento e seletor de torre/pavimento/unidade filtrado.
- **Aceite:** unidade única abre acompanhamento diretamente; múltiplas unidades permanecem identificáveis; não mostrar vizinhos; breadcrumb completo; seleção funciona em mobile e teclado.
- **Dependência:** CLI-07, CLI-17.

**CLI-19 — Implementar página inicial da unidade**

- **Entrega:** cabeçalho, progresso de execução, contagens e última publicação.
- **Aceite:** consumo do resumo real; mensagens específicas para ausência de taxonomia/marcos; percentual não é apresentado como financeiro; fotos e descrições técnicas internas ausentes.
- **Dependência:** CLI-11, CLI-18.

**CLI-20 — Garantir troca segura de contexto e navegação**

- **Entrega:** estado de unidade/aba/etapa em rotas e consultas; tratamento de concorrência de respostas e sessão expirada.
- **Aceite:** resposta atrasada da unidade A não aparece na B; cache e seleção separados por unidade; voltar/recarregar preserva contexto permitido; revogação limpa conteúdo e seleciona destino seguro; retorno pós-login validado.
- **Dependência:** CLI-18, CLI-19.

**Conclusão do EPIC:** comprador entra, reconhece seu apartamento e troca de unidade sem exposição cruzada de dados.

### EPIC - 6 — Etapas, atualizações e experiência responsiva

**Descrição:** entregar a visualização hierárquica de construção e sua conexão com atualizações e fotos.

**CLI-21 — Implementar árvore de etapas e marcos**

- **Entrega:** etapas expansíveis, subetapas, marcos, descrições simples, barras e estados textuais.
- **Aceite:** ordem do backend preservada; progresso da unidade correta; estado sem marcos distinto; navegar por teclado; filtro preserva pais; ausência de publicação não oculta o marco.
- **Dependência:** CLI-09, CLI-10, CLI-17, CLI-20.

**CLI-22 — Conectar etapas ao feed de atualizações**

- **Entrega:** seleção de etapa/marco filtra publicações; feed abre detalhe com data e contexto.
- **Aceite:** filtros correspondem à taxonomia da unidade; feed tem paginação e estados vazios; limpar filtro restaura lista; nenhum rascunho aparece; data publicada não é chamada de data de execução.
- **Dependência:** CLI-13, CLI-14, CLI-21.

**CLI-23 — Implementar galeria privada acessível**

- **Entrega:** miniaturas e visualizador no detalhe da publicação, com autenticação no carregamento.
- **Aceite:** apenas fotos autorizadas; foco e fechamento por teclado; carregamento progressivo; falha por imagem; nenhuma URL pública de storage incorporada na tela; testes de retirada de acesso durante uso.
- **Dependência:** CLI-15, CLI-16, CLI-22.

**CLI-24 — Ajustar mobile, acessibilidade e estados de interface**

- **Entrega:** uma coluna mobile, abas etapas/atualizações, skeletons, erro, ausência de vínculo e acesso removido.
- **Aceite:** sem rolagem horizontal nas larguras verificadas; foco visível; texto acompanha cor; controles de toque adequados; erro não aparece como lista vazia; leitura funcional com teclado e leitor de tela em verificações focadas.
- **Dependência:** CLI-19, CLI-20, CLI-21, CLI-22, CLI-23.

**Conclusão do EPIC:** comprador entende o avanço de sua unidade e consulta evidências publicadas em desktop e celular.

### EPIC - 7 — Validação integrada e entrega da V1

**Descrição:** comprovar as regras do módulo de ponta a ponta, sem enfraquecer a suíte do domínio.

**CLI-25 — Testar isolamento e arquivos privados**

- **Entrega:** testes HTTP/integrados de sessão, papel, vínculo, unidade, publicação e evidência.
- **Aceite:** comprador A não lê dados de B por URL, filtro, cursor, detalhe ou miniatura; coproprietários têm acesso legítimo; remoção do vínculo bloqueia novos acessos; descrição técnica e URL interna ausentes de todas as respostas.
- **Dependência:** EPICs 2, 3 e 4 concluídos.

**CLI-26 — Testar taxonomia e progresso com o domínio**

- **Entrega:** cenários de integração em banco, incluindo PostgreSQL na CI, conforme estratégia do projeto.
- **Aceite:** comparar cálculo por unidade e etapa; incluir marco sem ocorrência, subetapas, zero marcos, taxonomia alterada, reabertura e tentativa de cruzar empreendimentos; suíte de domínio existente continua passando; validar constraints/migrations se houver mudança persistida.
- **Dependência:** EPIC - 3; integração PostgreSQL e suíte do domínio disponíveis.

**CLI-27 — Validar jornada, UI e desempenho**

- **Entrega:** teste ponta a ponta e revisão das telas finais com dados sintéticos representativos.
- **Aceite:** fluxo gestor vincula → gestor publica pelo fluxo disponível → comprador vê própria unidade/fotos → gestor remove vínculo → comprador perde acesso; testar uma e várias unidades, troca rápida de contexto, mobile e teclado; medir consultas e carregamento contra orçamento registrado na CLI-12.
- **Dependência:** EPICs 5 e 6; fluxo de publicação pela gestão disponível.

**CLI-28 — Preparar entrega, documentação e rollout**

- **Entrega:** instruções de configuração e vínculo, contratos atualizados, checklist de entrega e procedimento de reversão de exposição da área de clientes.
- **Aceite:** nenhuma associação real criada a partir de dados fictícios/textos legados; acesso habilitado somente para compradores reconciliados; testes exigidos passam; limitações de progresso/taxonomia documentadas; publicação e storage habilitadores confirmados; smoke test em ambiente de entrega.
- **Dependência:** CLI-25, CLI-26, CLI-27.

**Conclusão do EPIC:** V1 revisada e pronta para disponibilização controlada conforme o fluxo de deploy do projeto.

## 8. Ordem de execução e tarefas habilitadoras

| Ordem | Foco | Critério para avançar |
| --- | --- | --- |
| 1 | EPIC - 1 | Modelos e UI mapeados, política e contratos definidos. |
| 2 | EPIC - 2 | Sessão e vínculo determinam acesso real às unidades. |
| 3 | EPICs 3 e 4 | Leituras de progresso e publicações têm contratos estáveis e autorização aplicada. |
| 4 | EPIC - 5 | Entrada no portal e troca de unidade integradas. |
| 5 | EPIC - 6 | Etapas, feed, galeria e estados de UI integrados. |
| 6 | EPIC - 7 | Isolamento, domínio, jornada e entrega verificados. |

CLI-17 pode começar após EPIC - 1, enquanto as APIs são construídas. Os testes negativos devem acompanhar cada endpoint; EPIC - 7 consolida a validação, sem adiar autorização para o fim.

O domínio V1 garante entidades e serviços, mas informa que não criou endpoints. Antes de comprometer a entrega ponta a ponta, a CLI-01 precisa confirmar:

1. Se existe fluxo de gestor para criar progresso, registrar evidência e publicar com seleção explícita.
2. Se autenticação e autorização de gestão já expõem as dependências necessárias.
3. Se o storage privado oferece upload e leitura para a transmissão autenticada.
4. Se dados de locais, taxonomia e vínculos já estão reconciliados no ambiente de destino.

Quando faltar algum habilitador, abrir uma issue explícita de domínio/gestão/infraestrutura e vinculá-la ao EPIC dependente. Não incorporar edição de obra ou publicação ao portal do comprador para compensar uma ausência de gestão.

## 9. Matriz mínima de verificação

| Cenário | Resultado esperado |
| --- | --- |
| A vinculado à unidade 402, B à 403 | A não lista nem acessa 403, suas publicações ou seus arquivos. |
| A e B vinculados à mesma unidade | Ambos leem a unidade e as mesmas publicações autorizadas; vínculo individual pode ser removido sem remover o outro. |
| A com unidades em empreendimentos distintos | Árvores, marcos, fotos e percentuais permanecem separados por unidade. |
| Usuário cadastrado apenas com unidade textual legada | Nenhum acesso automático. |
| Marco sem linha de progresso | Não iniciado, incluído no total aplicável. |
| Etapa com marcos em subetapas | Agregação inclui descendentes válidos uma única vez. |
| Evidência interna sem publicação | Inacessível no portal, inclusive por ID direto. |
| Publicação rascunho | Ausente no feed, no detalhe e em toda rota de arquivo. |
| Foto não selecionada em publicação visível | Não retorna junto da publicação; pedido direto falha. |
| Publicação da unidade A com URL da unidade B | Pedido falha; relação precisa corresponder ao caminho autorizado. |
| Vínculo revogado com tela aberta | Nova consulta ou download falha; frontend limpa dados ao receber a falha. |
| Marco reaberto | Estado e percentual atualizados segundo domínio; sem histórico ou justificativa inventados. |
| Taxonomia ausente ou sem marcos | Mensagens distintas; ausência de plano não aparece como conclusão ou atraso. |
| Resposta antiga após troca de unidade | Descartada; não mistura dados no novo contexto. |
| Navegação mobile e por teclado | Funções essenciais e galeria utilizáveis, com contexto e foco preservados. |

## 10. Critérios globais de aceite da V1

1. O comprador autenticado encontra suas unidades reais e nenhum apartamento de terceiros.
2. A navegação mantém o padrão visual de torres/pavimentos/apartamentos, adaptado ao acesso individual.
3. A árvore de construção reflete a taxonomia do empreendimento e o estado da unidade selecionada.
4. Percentuais seguem os serviços de domínio e vêm acompanhados de contagens e contexto compreensível.
5. Apenas publicações autorizadas e evidências explicitamente selecionadas aparecem no portal.
6. Conteúdo e miniaturas exigem autorização atual; remover vínculo bloqueia novas leituras.
7. Clientes não duplicam entidades, regras de progresso, autenticação ou associações já existentes.
8. Interface funciona em mobile e teclado e trata carregamento, ausência de dados, erros e revogação.
9. Testes provam isolamento entre compradores e integração com o domínio; a suíte anterior permanece válida.
10. Habilitadores de gestão/storage e instruções operacionais estão definidos antes da entrega.

**Resultado da V1:** um portal Meu Apê em que o comprador acompanha suas unidades por meio da taxonomia real da obra, com uma navegação familiar e publicações controladas pelo domínio.
