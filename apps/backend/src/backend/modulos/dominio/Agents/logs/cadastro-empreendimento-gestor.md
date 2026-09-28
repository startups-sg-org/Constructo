# Log — vínculo automático do gestor ao empreendimento

Data: 2026-09-27

## Problema

GESTOR podia cadastrar um empreendimento, mas ele não aparecia na própria
listagem. A consulta de empreendimentos do gestor filtra pela tabela
`usuarios_empreendimentos`, e o cadastro não criava esse vínculo.

## Correção

Em `modulos/dominio/rotas.py`, após criar o empreendimento, o endpoint verifica
o papel do usuário autenticado. Quando o usuário é `GESTOR`, chama
`vincular_gestor(session, usuario.id, empreendimento.id)`.

ADMIN continua visualizando todos os empreendimentos e não precisa de vínculo
individual.

## Resultado

Ao cadastrar uma obra como GESTOR:

1. o empreendimento é persistido;
2. o gestor é vinculado automaticamente;
3. a obra passa a aparecer em `/admin/obras`.

## Validação

- Compilação sintática de `dominio/rotas.py`: aprovada.
- `git diff --check`: aprovado.
