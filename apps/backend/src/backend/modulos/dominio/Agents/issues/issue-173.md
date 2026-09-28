## Descrição

Permitir que uma taxonomia utilizada por um empreendimento seja personalizada sem alterar o modelo original.

O objetivo é permitir que cada empreendimento adapte suas etapas, subetapas e marcos à própria realidade.

## Implementar

Permitir que o gestor:

- adicione etapas;
- edite etapas;
- adicione subetapas;
- edite subetapas;
- adicione marcos;
- edite marcos;
- altere ordenação;
- altere descrições.

Ao utilizar uma taxonomia padrão:

- duplicar antes da personalização; ou
- criar uma cópia vinculada ao empreendimento.

Garantir que alterações feitas em:

`Residencial Aurora`

não afetem:

`Residencial Horizonte`

nem a:

`Taxonomia padrão Constructo`.

## Critérios de aceite

- [ ] empreendimento pode possuir taxonomia personalizada;
- [ ] alterações não modificam a taxonomia padrão;
- [ ] alterações de um empreendimento não afetam outro;
- [ ] etapas podem ser personalizadas;
- [ ] subetapas podem ser personalizadas;
- [ ] marcos podem ser personalizados;
- [ ] ordenação pode ser personalizada;
- [ ] descrições podem ser personalizadas.

## Relatório de verificação

**Resultado:** não concluída. A implementação atual fornece parte da estrutura de
persistência, mas não disponibiliza o fluxo de personalização solicitado ao gestor.

### Itens atendidos

- A separação estrutural entre empreendimentos existe: `Taxonomia` referencia um
  único `empreendimento_id`, `Etapa` referencia uma taxonomia e a FK composta de
  `Etapa.parent_id` exige que pai e filha pertençam à mesma taxonomia
  (`modelos.py:102-143`).
- Etapas/subetapas e marcos possuem campos persistentes de ordem e descrições
  técnica/cliente (`modelos.py:134-156`), com restrições de ordem não negativa
  (`modelos.py:131-132` e `modelos.py:148`).
- A criação interna de etapa ou subetapa existe e valida taxonomia, profundidade e
  vínculo do pai (`servicos.py:238-262`).

### Itens parcialmente atendidos

- **Empreendimento pode possuir taxonomia personalizada:** a relação 1:1 está no
  model e na migration (`modelos.py:102-118` e
  `alembic/versions/20260925_0002_dominio_constructo.py:73-99`), e há schema de
  criação (`esquemas.py:131-140`). Porém não há service funcional nem rota para
  criar, consultar ou personalizar a taxonomia; o teste tenta importar
  `criar_taxonomia`, que não existe.
- **Alterações de um empreendimento não afetam outro:** as FKs isolam as árvores
  por taxonomia e o service rejeita pai de outra taxonomia
  (`servicos.py:243-245`). Isso não prova o critério de ponta a ponta porque não
  existem operações de edição/cópia nem teste de isolamento Aurora/Horizonte.
- **Etapas e subetapas podem ser personalizadas:** podem ser adicionadas via
  `criar_etapa`, inclusive com nome, ordem e descrições; `mover_etapa` apenas muda
  o pai (`servicos.py:256-272`). Não existem schemas/services de edição de seus
  demais campos, listagem ordenada ou endpoints autorizados para o gestor.
- **Ordenação e descrições podem ser personalizadas:** os campos são aceitos na
  criação (`esquemas.py:143-161`) e persistidos nos models, mas não há operação de
  atualização/reordenação nem consulta com `order_by` para etapas ou marcos.

### Itens ausentes

- Duplicação de taxonomia padrão ou criação de cópia vinculada ao empreendimento.
- Referência à taxonomia de origem/versão que permita distinguir uma cópia da
  taxonomia padrão.
- Operações para editar etapa e subetapa (nome, ordem e descrições).
- Services para adicionar ou editar marcos. Existe apenas o model/schema
  (`modelos.py:146-156`; `esquemas.py:156-165`).
- Rotas HTTP de taxonomia, etapas, subetapas e marcos. `rotas.py:13-37` importa
  somente contratos/services de empreendimento e estrutura física, e o arquivo
  encerra esses fluxos sem expor personalização de taxonomia.
- Autorização que associe as mutações de taxonomia ao gestor do empreendimento.
- Testes dos oito critérios de aceite, incluindo isolamento entre Residencial
  Aurora, Residencial Horizonte e a taxonomia padrão.

### Divergências e riscos

- `Taxonomia.empreendimento_id` é obrigatório e único (`modelos.py:105-108`).
  Portanto, o modelo atual não representa uma taxonomia padrão global reutilizável;
  `is_padrao` é apenas um booleano em uma taxonomia já pertencente a um
  empreendimento. Editar essa linha seria editar diretamente a taxonomia daquele
  empreendimento, não uma cópia protegida.
- A migration adiciona somente `is_padrao` e timestamps
  (`alembic/versions/20260927_0004_taxonomia_campos.py:13-27`), sem vínculo de
  origem ou mecanismo de cópia.
- A suíte de integração está atualmente bloqueada na coleta: o teste importa
  `criar_taxonomia` (`tests/test_dominio_integracao.py:34-48`) e o utiliza em
  `tests/test_dominio_integracao.py:170-195`, mas a função não está definida em
  `servicos.py`. Assim, os comportamentos persistentes relacionados sequer são
  executados.
- A documentação vigente afirma no máximo uma taxonomia própria por empreendimento
  e registra que congelar/versar taxonomia ficou para fase posterior
  (`docs/epic-01-dominio.md:9-14` e `docs/epic-01-dominio.md:25`), o que não cobre
  o requisito desta issue de copiar uma taxonomia padrão antes de personalizá-la.

### Critérios de aceite verificados

- [ ] empreendimento pode possuir taxonomia personalizada — **parcial**;
- [ ] alterações não modificam a taxonomia padrão — **ausente**;
- [ ] alterações de um empreendimento não afetam outro — **parcial**;
- [ ] etapas podem ser personalizadas — **parcial**;
- [ ] subetapas podem ser personalizadas — **parcial**;
- [ ] marcos podem ser personalizados — **ausente**;
- [ ] ordenação pode ser personalizada — **parcial**;
- [ ] descrições podem ser personalizadas — **parcial**.

### Validações executadas

- `UV_CACHE_DIR=/tmp/codex-uv-cache uv run pytest -p no:cacheprovider tests/test_dominio.py -q`:
  **5 passed**.
- `UV_CACHE_DIR=/tmp/codex-uv-cache uv run pytest tests/test_dominio.py tests/test_dominio_integracao.py -q`:
  **erro durante a coleta**, por ausência de `criar_taxonomia` em `servicos.py`;
  nenhum teste de integração foi executado.
- A primeira tentativa sem `UV_CACHE_DIR` não iniciou a suíte porque o sandbox não
  permite criar o lock no cache global do `uv`; a repetição em `/tmp` produziu o
  resultado acima.
