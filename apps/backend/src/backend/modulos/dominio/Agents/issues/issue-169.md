## Descrição

Implementar ordenação explícita para etapas, subetapas e marcos da taxonomia.

A ordenação será utilizada para representar corretamente a sequência da jornada construtiva.

## Implementar

Utilizar o campo `ordem` em:

- etapas;
- subetapas;
- marcos.

Garantir que consultas retornem os elementos ordenados.

Permitir alteração da ordem.

Exemplo:

1. Estrutura
2. Vedações
3. Instalações
4. Revestimentos
5. Acabamentos
6. Vistoria
7. Entrega

Dentro de uma subetapa:

1. Tubulação
2. Teste
3. Conclusão

Implementar método no service para reorganização.

## Critérios de aceite

- [ ] etapas são retornadas na ordem definida;
- [ ] subetapas são retornadas na ordem definida;
- [ ] marcos são retornados na ordem definida;
- [ ] usuário consegue alterar a ordem;
- [ ] alteração persiste no banco;
- [ ] ordem incorreta não depende do ID do registro;
- [ ] frontend respeita a ordenação retornada pela API.

## Verificação do agente verificador

### Resultado geral

**Parcialmente implementada.** O campo `ordem` existe e é persistível em
`Etapa` e `Marco`, mas ainda não há consultas do domínio ordenando explicitamente
etapas, subetapas e marcos, nem método de service para reorganização.

### Critérios de aceite

| Critério | Status | Evidência/observação |
|---|---|---|
| etapas são retornadas na ordem definida | **Não atendido** | Não foi encontrado service/consulta com `order_by(Etapa.ordem, ...)` para listar etapas. |
| subetapas são retornadas na ordem definida | **Não atendido** | Não há consulta específica ordenando filhos/subetapas por `ordem`; `Taxonomia.etapas` também não define `order_by`. |
| marcos são retornados na ordem definida | **Não atendido** | `Marco` possui campo `ordem`, mas não há listagem ordenada por `Marco.ordem`. |
| usuário consegue alterar a ordem | **Não atendido** | Existe `mover_etapa`, mas ele altera apenas `parent_id`; não há método de reordenação de etapas, subetapas ou marcos. |
| alteração persiste no banco | **Parcial** | O campo `ordem` é persistido por model/schema/migration, mas falta operação de alteração/reorganização. |
| ordem incorreta não depende do ID do registro | **Não atendido** | Sem consultas ordenadas explicitamente, o retorno pode depender da ordem natural do banco/ID. |
| frontend respeita a ordenação retornada pela API | **Não aplicável no estado atual** | Não foi encontrado front-end específico para `Taxonomia`, etapas/subetapas/marcos ou consumo de API desse domínio. |

### Evidências

- `modelos.py` define `Etapa.ordem` e `Marco.ordem` com `CheckConstraint`
  `ordem >= 0`.
- `esquemas.py` expõe `ordem` em `EtapaCriar` e `MarcoCriar` com validação
  `ge=0`.
- A migration `20260925_0002_dominio_constructo.py` cria as colunas `ordem`
  em `etapas` e `marcos`.
- `servicos.py` não possui função de reorganização/reordenação e não contém
  `order_by` para etapas, subetapas ou marcos.
- Em `apps/web/src` e `apps/mobile/src`, não há implementação funcional ligada
  a taxonomias; as menções a `etapas` são conteúdo institucional.

### Validação

- `uv run pytest -q tests/test_dominio.py tests/test_dominio_integracao.py`:
  **9 passed**.
- Os testes existentes não cobrem a ordenação exigida nesta issue.
