# Verificacao de front-end relacionado a taxonomia

Data: 2026-09-27

## Escopo

Verificar se existe algum front-end relacionado ao dominio taxonomico das issues
ja conferidas:

- `Agents/issues/issue-164.md`
- `Agents/issues/issue-165.md`

Ambas tratam da entidade `Taxonomia`, seus campos, schemas, migration, service
inicial e relacionamento com etapas.

## Resultado geral

**Nao foi encontrado front-end especifico para taxonomia.**

A implementacao conferida nas issues 164 e 165 esta concentrada no backend. A
busca no front-end nao encontrou rota, pagina, componente, loader, action,
service, tipo ou teste que consuma explicitamente `Taxonomia`, `taxonomia`,
`taxonomias` ou o endpoint/contrato equivalente.

## Evidencias

- Busca textual por `taxonom`, `Taxonom`, `taxonomia` e `Taxonomia` no
  repositorio encontrou ocorrencias apenas em backend, docs, migrations, testes
  e nos arquivos de controle dos agentes.
- Em `apps/web/src` e `apps/mobile/src`, a busca por termos ligados ao dominio
  retornou apenas usos genericos de `etapa`, `etapas` e `empreendimento`.
- As mencoes de `etapa` no front-end aparecem em conteudo institucional da home
  ou nomes/classes de apresentacao, sem relacao funcional com a entidade
  `Taxonomia`.
- As mencoes de `empreendimento` no front-end aparecem no fluxo de usuarios,
  sem ligacao com cadastro ou leitura de taxonomias.

## Conclusao do agente verificador

Nao ha evidencias de front-end implementado ou pendente diretamente associado
ao escopo das issues 164/165.

Se o produto precisar expor o dominio taxonomico na interface, isso deve virar
uma issue propria de front-end, por exemplo:

- tela/listagem de taxonomias por empreendimento;
- formulario de criacao/edicao de taxonomia;
- integracao com API para criar/listar taxonomias;
- visualizacao da arvore de etapas, subetapas e marcos;
- testes de loader/action/componentes para esse fluxo.

