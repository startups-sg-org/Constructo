# Plan

Expor o vínculo entre comprador e unidade por uma rota HTTP segura, reutilizando
o serviço de domínio existente. A implementação deve preservar a regra de que
somente compradores ativos podem ser associados a locais do tipo `UNIDADE`.

## Scope
- In: schema, rota, autorização, resposta e testes do vínculo comprador–unidade.
- Out: alteração de hierarquia de locais, cadastro de usuários e interface web.

## Action items
[ ] Confirmar o contrato de `UsuarioUnidade`, o serviço `vincular_comprador` e as permissões administrativas aplicáveis.
[ ] Adicionar schema de entrada e resposta para o vínculo em `modulos/dominio/esquemas.py`.
[ ] Expor endpoint `POST` aninhado à unidade em `modulos/dominio/rotas.py`, usando `vincular_comprador` sem duplicar regras de domínio.
[ ] Mapear erros de usuário inativo, papel diferente de `COMPRADOR` e local que não seja `UNIDADE` para respostas HTTP claras.
[ ] Garantir idempotência ou definir a resposta para tentativa de vínculo já existente, conforme a constraint da tabela `usuarios_unidades`.
[ ] Adicionar testes de API para sucesso, autorização insuficiente, comprador inativo, tipo de local inválido e vínculo duplicado.
[ ] Executar as validações focadas do backend e registrar os resultados na issue.

## Open questions
- Qual papel pode criar ou remover vínculos: apenas `ADMIN`, ou também `GESTOR` do empreendimento?
- A mesma pessoa pode ser vinculada a múltiplas unidades?
- A primeira entrega deve incluir uma rota de remoção do vínculo?

## Implementação realizada

- Criados os contratos `CompradorUnidadeCriar` e `CompradorUnidadeLer` em
  `apps/backend/src/backend/modulos/dominio/esquemas.py`.
- Exposta a rota `POST /empreendimentos/{empreendimento_id}/locais/{unidade_id}/compradores` em
  `apps/backend/src/backend/modulos/dominio/rotas.py`, restrita a administrador
  ou gestor com acesso ao empreendimento.
- O serviço `vincular_comprador` agora retorna o vínculo existente para a mesma
  dupla usuário/unidade, evitando duplicidade.
- Adicionados testes de API para sucesso, unidade de outro empreendimento e
  regra de comprador inválida em `apps/backend/tests/test_api_locais.py`.

## Validações

- `python3 -m py_compile` nos arquivos alterados: aprovado.
- `git diff --check`: aprovado.
- `ruff` e `uv` não estão instalados no ambiente; a checagem de lint não pôde
  ser executada.
- `pytest` não foi executado, conforme orientação.

## Pendências restantes

- Confirmar se `GESTOR` deve manter permissão de vínculo e se a API precisa de
  remoção/listagem de vínculos antes de expor uma interface web.
