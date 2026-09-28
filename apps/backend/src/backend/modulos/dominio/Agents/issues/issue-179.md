## Descrição

Criar o enum responsável por representar o estado de execução de um marco.

O `ProgressStatus` será utilizado para indicar se um marco ainda não começou, está em andamento ou foi concluído.

## Implementar

Criar enum `ProgressStatus` com os valores:

- `NAO_INICIADO`;
- `EM_ANDAMENTO`;
- `CONCLUIDO`.

Utilizar o enum na entidade responsável pelo progresso do marco.

Garantir que:

- somente valores válidos sejam aceitos;
- o backend utilize o enum nas validações;
- schemas Pydantic reflitam os valores permitidos;
- frontend consiga consumir os status de forma consistente.

## Critérios de aceite

- [ ] enum `ProgressStatus` existe;
- [ ] status inválido não é aceito;
- [ ] model utiliza o enum;
- [ ] schemas utilizam o enum;
- [ ] API retorna status válidos;
- [ ] frontend consegue interpretar os status corretamente.

## Planejamento de execução

### Descobertas e decisões

- O domínio já possui `EstadoMarco` em `regras.py` com os valores
  `NAO_INICIADO`, `EM_ANDAMENTO` e `CONCLUIDO`. O nome solicitado na issue é
  `ProgressStatus`; será necessário decidir entre renomear o enum existente ou
  criar um alias compatível sem duplicar os valores.
- `ProgressoMarco.status` está persistido como `String` e possui
  `CheckConstraint` no model/migration com os três valores válidos.
- `ProgressoMarcoCriar` já usa `EstadoMarco` e `ProgressoMarcoLer` expõe o enum
  via Pydantic. A criação e a transição de estado no service já convertem e
  validam o status com `EstadoMarco`/`validar_transicao`.
- O frontend compartilhado ainda não possui, no escopo localizado, um tipo
  específico para status de progresso de marco. O contrato deverá ser criado no
  pacote compartilhado ou no feature que consumir a API, mantendo os mesmos
  valores literais.
- Não alterar o status do empreendimento (`StatusEmpreendimento`), que é outro
  enum e possui valores diferentes.

### Implementação prevista

1. **Regras e enum**
   - Definir `ProgressStatus` como enum canônico, preferencialmente em
     `regras.py`, com os valores existentes.
   - Manter compatibilidade com `EstadoMarco` durante a transição, caso ele já
     seja usado por services, testes e contratos públicos.
   - Atualizar `TRANSICOES`, `validar_transicao`, cálculos de progresso e
     comparações para usar uma única representação.

2. **Model e persistência**
   - Alterar a anotação de `ProgressoMarco.status` para refletir o enum no
     domínio, preservando a coluna textual compatível com PostgreSQL.
   - Manter ou revisar o `CheckConstraint ck_progressos_status` para impedir
     valores inválidos no banco.
   - Verificar se a migration vigente já cobre os três valores; criar migration
     somente se houver mudança real de tipo/constraint.

3. **Schemas e services**
   - Fazer `ProgressoMarcoCriar.status` aceitar somente `ProgressStatus`.
   - Fazer `ProgressoMarcoLer.status` retornar o mesmo enum/valores.
   - Atualizar `criar_progresso` e `alterar_estado` para converter entradas,
     rejeitar status inválido e preservar as regras de datas de início/conclusão.
   - Garantir que consultas e cálculo de progresso não comparem strings
     arbitrárias fora do enum.

4. **Rotas e API**
   - Auditar endpoints que criam, alteram ou retornam `ProgressoMarco` e garantir
     que seus response/request models usem o enum.
   - Confirmar respostas `422` para payload inválido e respostas válidas para
     os três estados.
   - Não modificar endpoints de taxonomia ou status do empreendimento.

5. **Frontend**
   - Exportar um tipo/constante `ProgressStatus` no pacote compartilhado, ou no
     feature de progresso, com os valores literais do backend.
   - Criar mapa de rótulos, cores e estados sem aceitar strings fora da união.
   - Garantir que componentes futuros de progresso usem o tipo, sem converter
     silenciosamente valores desconhecidos.

### Testes e validação

- Testar que os três valores válidos são aceitos no schema e persistem.
- Testar que status arbitrário é rejeitado pelo Pydantic com `ValidationError`.
- Testar que o banco rejeita valor inválido mesmo fora do schema.
- Testar transições válidas e inválidas entre os estados.
- Testar timestamps coerentes para início e conclusão em cada estado.
- Testar respostas da API para criação, leitura e atualização do progresso.
- Testar interpretação frontend dos três valores e fallback/erro para valor
  desconhecido.
- Executar testes unitários e de integração focados, `py_compile` e
  `git diff --check`; confirmar que migrations continuam com uma única head.

### Dependências, riscos e limites

- Renomear `EstadoMarco` pode quebrar imports existentes; preferir alias ou
  migração gradual, mantendo compatibilidade até todos os consumidores serem
  atualizados.
- A coluna atual é textual; trocar para enum nativo PostgreSQL exigiria
  migration de dados e não é necessário para este critério.
- Não incluir nesta issue novos fluxos de acompanhamento, notificações,
  publicações ou componentes visuais completos de progresso.
- A validação deve existir em schema, service e banco; confiar apenas no
  frontend não atende ao requisito de valores válidos.
- Nenhum critério de aceite deve ser marcado como concluído no planejamento.
