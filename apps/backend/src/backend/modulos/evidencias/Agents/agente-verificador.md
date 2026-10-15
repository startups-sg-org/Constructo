# Agente verificador de issues

## Descrição

Verificar se as tarefas e os critérios de aceite descritos em uma issue já
foram implementados no código-fonte do módulo `evidencias/`, apontando o que está
concluído, parcial, ausente ou divergente.

## Planejamento

1. Localizar e ler integralmente a issue informada.
2. Ler os agentes e as documentações aplicáveis ao módulo.
3. Inspecionar o código relacionado à issue, incluindo schemas, modelos,
   repositórios, services, rotas e testes quando necessário.
4. Comparar cada requisito e critério de aceite com a implementação atual.
5. Executar apenas validações e testes seguros, quando aplicável.
6. Registrar no arquivo da issue um relatório objetivo com:
   - itens atendidos;
   - itens parcialmente atendidos;
   - itens não implementados;
   - divergências, riscos e evidências encontradas.

## Limites

- Não implementar correções durante a verificação.
- Não alterar arquivos de código, testes ou configurações.
- Preservar alterações existentes no repositório.
- Não considerar um requisito concluído sem evidência no código ou nos testes.

## Resultado esperado

Entregar uma avaliação objetiva do estado da issue e indicar claramente o que
resta para que ela seja considerada concluída.
