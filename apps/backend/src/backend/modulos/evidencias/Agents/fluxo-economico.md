# Fluxo econômico para implementação de issues

## Objetivo

Executar o fluxo arquiteto → implementação → verificador com menos leitura
repetida, menos texto e sem perder o registro das pendências.

## 1. Planejamento pelo agente-arquiteto

Ler somente:

- a issue solicitada;
- os agentes diretamente aplicáveis;
- os arquivos afetados pela primeira etapa.

Registrar na issue um planejamento curto contendo:

1. etapa;
2. arquivos envolvidos;
3. alteração esperada;
4. validação prevista.

Não repetir explicações gerais do módulo nem copiar trechos extensos de código.

## 2. Implementação por etapa

Para cada etapa:

1. consultar apenas os arquivos da etapa atual;
2. preservar alterações existentes;
3. implementar a menor mudança necessária;
4. executar somente validação rápida relacionada à etapa;
5. parar e aguardar autorização para a próxima etapa.

Validações rápidas recomendadas:

- `ruff check` nos arquivos alterados;
- `python -m py_compile` nos arquivos Python alterados;
- inspeção de migration quando houver alteração de banco.

Não executar `pytest` automaticamente. Executá-lo somente quando o usuário
autorizar ou solicitar explicitamente.

## 3. Registro da etapa

Após cada etapa, informar apenas:

- concluído;
- arquivos alterados;
- validação executada;
- próxima etapa.

Evitar repetir o planejamento completo ou o histórico da issue.

## 4. Verificação pelo agente-verificador

O verificador deve:

1. ler a issue uma vez;
2. ler somente os arquivos relacionados aos critérios alterados;
3. comparar cada critério com evidência objetiva;
4. executar apenas validações seguras e focadas;
5. atualizar a issue com um relatório curto.

O relatório deve usar quatro grupos:

- atendidos;
- parcialmente atendidos;
- não implementados;
- riscos ou pendências.

Cada item deve citar o arquivo ou endpoint que comprova a conclusão. Não
reproduzir o conteúdo completo do código.

## 5. Correção de pendências

Quando o usuário solicitar uma pendência específica:

1. alterar somente o item solicitado;
2. não replanejar a issue inteira;
3. não modificar pendências não relacionadas;
4. atualizar apenas o trecho correspondente do relatório;
5. validar com lint e sintaxe, sem `pytest` salvo autorização.

## Prompt curto recomendado

```text
Atue como agente-arquiteto/verificador na issue N.
Leia somente os arquivos diretamente relacionados à etapa solicitada.
Seja objetivo, não repita o planejamento e não execute pytest sem autorização.
Altere apenas o escopo informado e registre na issue os arquivos, validações e
pendências restantes.
```
