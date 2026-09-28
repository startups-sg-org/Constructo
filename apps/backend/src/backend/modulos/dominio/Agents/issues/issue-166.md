## Descrição

Implementar o cadastro de etapas dentro de uma taxonomia.

As etapas representam os grandes momentos da construção e serão utilizadas para organizar subetapas e marcos.

## Implementar

Criar entidade `Etapa` com:

- id;
- nome;
- descricao_tecnica;
- descricao_cliente;
- ordem;
- taxonomia_id;
- parent_id;
- criado_em;
- atualizado_em.

Para etapas de primeiro nível:

- `parent_id` deve ser nulo.

Criar:

- schemas;
- service;
- endpoint;
- validações;
- integração inicial com frontend.

Exemplo:

Estrutura

Vedações

Instalações

Revestimentos

Acabamentos

## Critérios de aceite

- [ ] usuário consegue criar uma etapa;
- [ ] etapa pertence a uma taxonomia;
- [ ] nome é obrigatório;
- [ ] etapa de primeiro nível possui `parent_id` nulo;
- [ ] ordem é persistida;
- [ ] taxonomia inexistente retorna erro adequado;
- [ ] etapa criada pode ser consultada pela API.