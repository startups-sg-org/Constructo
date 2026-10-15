## Descrição

Permitir que um protocolo determine uma quantidade mínima de evidências necessária para considerar o registro suficientemente documentado.

## Implementar

Utilizar o campo:

`quantidade_minima`

Validar:

- valor não pode ser negativo;
- quantidade mínima pode ser zero quando permitido;
- protocolo pode ser criado sem exigência mínima;
- quantidade de evidências registradas deve ser comparada com a quantidade exigida.

Calcular:

`evidencias_registradas >= quantidade_minima`

Exemplo:

Quantidade mínima: 5

Evidências registradas: 3

Status:
Protocolo incompleto

## Critérios de aceite

- [ ] protocolo pode definir quantidade mínima;
- [ ] valores negativos são rejeitados;
- [ ] quantidade registrada é comparada com a mínima;
- [ ] protocolo identifica quando quantidade é insuficiente;
- [ ] protocolo identifica quando quantidade mínima foi atendida;
- [ ] alteração na quantidade mínima atualiza a validação.

## PLANEJAMENTO

### Descobertas e decisões

- `ProtocoloEvidencia.quantidade_minima` já existe, mas o model, a migration
  `20261009_0011` e o schema de criação exigem valor maior ou igual a 1. Para
  cumprir esta issue, o limite deve mudar para `>= 0` e o campo deve assumir
  `0` quando não for informado.
- Evidências registradas estão no model de domínio `Evidencia`, vinculado a
  `ProgressoMarco`; não há FK direta de evidência para protocolo ou item de
  protocolo. A contagem deverá ser obtida por `Evidencia -> ProgressoMarco ->
  Marco`, restrita ao marco do protocolo.
- Como um marco pode ter mais de um protocolo, a mesma evidência pode entrar
  na contagem de todos os protocolos daquele marco. Isso atende ao requisito
  de quantidade mínima, mas não comprova ainda itens específicos; a validação
  por item fica fora do escopo desta issue.
- A recomendação é expor o status por `progresso_marco_id`, pois cada progresso
  representa um marco em um local da obra. Sem esse recorte, a soma de todos
  os locais do marco poderia considerar o protocolo completo indevidamente.

### Implementação prevista

1. Atualizar `ProtocoloEvidencia` para aceitar `quantidade_minima >= 0`, com
   default de banco `0`, e alterar a constraint correspondente.
2. Criar schema de atualização parcial do protocolo, permitindo alterar
   `quantidade_minima` com `Field(ge=0)`, e schema de leitura de status com:
   `protocolo_id`, `quantidade_minima`, `evidencias_registradas` e
   `quantidade_atendida`.
3. Adicionar em `regras.py` uma função pura que receba quantidade registrada e
   mínima e retorne `registradas >= minima`. A função será reutilizável em
   service e testes.
4. No repositório, criar consulta `COUNT` das evidências do
   `progresso_marco_id` informado; validar que o progresso pertence ao marco
   do protocolo antes de contar.
5. No service, implementar atualização da quantidade mínima e consulta do
   status, validando protocolo, marco e progresso. A alteração passa a refletir
   imediatamente no cálculo, sem duplicar ou persistir o status.
6. Expor endpoints autenticados de administrador ou gestor:
   - `PATCH /empreendimentos/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/{protocolo_id}`
     para atualizar a quantidade mínima;
   - `GET /empreendimentos/{empreendimento_id}/taxonomia/marcos/{marco_id}/protocolos-evidencia/{protocolo_id}/status?progresso_marco_id={id}`
     para consultar a quantidade registrada e o atendimento do mínimo.
7. Criar migration para alterar a constraint de `quantidade_minima`, atualizar
   dados já existentes se necessário e definir default `0`.

### Testes e validação

- Testar criação sem `quantidade_minima`, criação e atualização com `0`, e
  rejeição de valor negativo no schema, service e banco.
- Testar a regra pura para mínimo `0`, quantidade insuficiente e quantidade
  exatamente igual ou superior ao mínimo.
- Testar a contagem por progresso de marco, incluindo evidências de outro
  progresso ou marco que não devem entrar no cálculo.
- Testar o `PATCH` e `GET` de status, acesso negado, protocolo inexistente e
  progresso que não pertence ao marco.
- Aplicar a migration em banco de validação e executar a suíte de testes.

### Riscos e limites

- O endpoint de status precisa receber `progresso_marco_id`; caso o negócio
  deseje consolidar todos os locais de uma obra, será necessário um contrato
  diferente, pois esse cálculo pode mascarar pendências em locais específicos.
- Esta issue mede quantidade total. Validar que cada item obrigatório do
  protocolo recebeu uma evidência exige uma futura ligação explícita entre
  `Evidencia` e `ItemProtocolo`.

## Relatório de verificação

### Itens atendidos

- `ProtocoloEvidencia.quantidade_minima` aceita `0`, possui default `0` no
  model e é protegido pela constraint `quantidade_minima >= 0`.
- A migration `20261009_0014` altera a constraint e o default do banco.
- Os schemas de criação e atualização aplicam `ge=0`, rejeitando valores
  negativos antes da persistência.
- A regra pura `quantidade_minima_atendida` implementa exatamente
  `evidencias_registradas >= quantidade_minima`.
- O repositório conta evidências por `progresso_marco_id`; o service confirma
  que esse progresso pertence ao mesmo marco do protocolo antes de calcular.
- O endpoint `PATCH` atualiza a quantidade mínima e o endpoint `GET /status`
  retorna mínimo, quantidade registrada e o booleano `quantidade_atendida`.

### Itens parcialmente atendidos

1 - Os testes agora cobrem atualização para `0`, status insuficiente, status
  atendido e rejeição de quantidade negativa. A cobertura de status ainda usa
  o service simulado; falta teste de integração para a consulta `COUNT` real e
  evidências de outro progresso ou marco.
2 - Foi tentada a aplicação de `alembic upgrade head`, mas o comando não
  retornou resultado antes do limite de 30 segundos neste ambiente. A migration
  continua pendente de confirmação em banco acessível.

### Conclusão

A funcionalidade e os cenários unitários de mínimo atendido, mínimo
insuficiente e valor negativo estão implementados. Para evidência de conclusão
integral, faltam somente o teste de integração da contagem real e a aplicação
confirmada da migration em banco de validação.
