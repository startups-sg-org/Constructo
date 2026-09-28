## Descrição

Calcular automaticamente o percentual de progresso de uma etapa com base nos marcos associados.

Na V1, o cálculo será realizado pela quantidade de marcos concluídos.

## Implementar

Utilizar a fórmula:

`progresso = marcos_concluidos / total_de_marcos * 100`

Exemplo:

10 marcos
7 concluídos

Progresso: 70%

Considerar somente marcos aplicáveis ao local consultado.

Retornar:

- total de marcos;
- marcos concluídos;
- marcos em andamento;
- marcos não iniciados;
- percentual de progresso.

## Critérios de aceite

- [ ] progresso é calculado automaticamente;
- [ ] cálculo considera os marcos da etapa;
- [ ] percentual varia entre 0 e 100;
- [ ] etapa sem marcos possui tratamento definido;
- [ ] conclusão de marco atualiza o cálculo;
- [ ] reabertura de marco atualiza o cálculo;
- [ ] resultado pode ser consumido pela API.

## Planejamento de execução

### Descobertas e decisões

- O cálculo deve considerar somente marcos da etapa e progressos do local
  consultado; não usar marcos de outra taxonomia ou empreendimento.
- A resposta deve ser um contrato explícito com `total`, `concluidos`,
  `em_andamento`, `nao_iniciados` e `percentual`.
- Etapa sem marcos retorna percentual `0` e contagens zeradas, salvo decisão de
  produto diferente.

### Implementação prevista

- Criar schema de leitura para o resumo de progresso.
- Implementar consulta service com joins explícitos entre etapa, marco,
  progresso e local, usando contagens condicionais.
- Validar etapa, local, vínculo entre empreendimento e taxonomia e acesso do
  usuário.
- Expor endpoint GET no padrão atual de domínio, por exemplo
  `/empreendimentos/{empreendimento_id}/locais/{local_id}/etapas/{etapa_id}/progresso`;
  confirmar o caminho final antes de codificar.
- Garantir percentual limitado a 0–100 e arredondamento documentado.

### Testes e validação

- Testar 0%, 50%, 100% e mistura dos três estados.
- Testar etapa sem marcos, local sem progresso criado e progresso ausente
  tratado como `NAO_INICIADO` se essa for a regra adotada.
- Testar conclusão e reabertura atualizando o resultado.
- Testar etapa/local de outro empreendimento, inexistentes e acesso negado.
- Testar contrato JSON consumível pelo frontend.

### Dependências, riscos e limites

- Depende das entidades/transições das issues 180–185.
- Não calcular progresso do empreendimento inteiro nem criar gráficos nesta
  issue.
- Definir antes da implementação se subetapas entram no cálculo da etapa pai;
  a V1 deve documentar uma única regra e aplicá-la consistentemente.
