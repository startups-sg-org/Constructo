# Verificacao da issue-169

Data: 2026-09-27

## Resultado geral

**Parcialmente implementada.**

O campo `ordem` ja existe no backend para `Etapa` e `Marco`, com suporte em
model, schema e migration. Porem, a issue tambem exige consultas ordenadas,
alteracao/reorganizacao da ordem e respeito pela ordenacao no front-end. Esses
pontos ainda nao foram encontrados.

## Itens atendidos ou parciais

- `Etapa.ordem` existe em `modelos.py`.
- `Marco.ordem` existe em `modelos.py`.
- `EtapaCriar` e `MarcoCriar` aceitam `ordem` com validacao `ge=0`.
- A migration `20260925_0002_dominio_constructo.py` cria `ordem` em `etapas`
  e `marcos`.
- A persistencia do campo e possivel pela estrutura atual, mas nao existe
  operacao dedicada para alterar/reorganizar a ordem.

## Pendencias

- Criar consultas/listagens que retornem etapas raiz ordenadas por `ordem`.
- Criar consultas/listagens que retornem subetapas ordenadas por `ordem`.
- Criar consultas/listagens que retornem marcos ordenados por `ordem`.
- Implementar metodo de service para reorganizacao de etapas/subetapas/marcos.
- Garantir que a reordenacao persista no banco por meio do fluxo de service/API.
- Adicionar testes que provem que a ordem nao depende do ID.
- Implementar ou verificar front-end funcional quando existir API/tela para
  taxonomia.EM web/ (esse é o front-end)

## Validacao executada

Comando:

```bash
uv run pytest -q tests/test_dominio.py tests/test_dominio_integracao.py
```

Resultado:

```text
9 passed in 0.36s
```

Observacao: os testes passam, mas nao cobrem os criterios especificos de
ordenacao da issue-169.
