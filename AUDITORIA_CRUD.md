# Auditoria atual do CRUD de usuários

**Escopo:** estado atual de `apps/backend`, `apps/web` e `packages/shared`.

## Resultado

O endereço do cadastro foi corrigido. O web agora chama a mesma rota registrada pelo backend, e a inserção no SQLite funciona.

O sistema ainda não é um CRUD completo. A criação possui uma divergência no formato da resposta, enquanto leitura, atualização e exclusão ainda não existem.

## Estado das operações

| Operação | Backend | Interface web | Estado atual |
| --- | --- | --- | --- |
| **Create — criar** | Rota `POST /usuarios/`, hash da senha e inserção no SQLite | Formulário, validação e chamada para `POST /usuarios/` | **Parcial:** o registro é criado, mas o web espera dados que não são retornados pelo backend. |
| **Read — ler** | Não há consulta nem rota | Não há serviço nem tela de leitura | **Ausente.** |
| **Update — atualizar** | Não há operação no banco nem rota | Não há serviço nem formulário de edição | **Ausente.** |
| **Delete — excluir** | Não há operação no banco nem rota | Não há serviço nem ação de exclusão | **Ausente.** |

## O que ainda está faltando

### 1. Igualar o contrato de resposta do cadastro

O serviço declara que `createUser` retorna `UserReponse` em [`userService.ts`](apps/web/src/components/formulario/service/userService.ts#L3). Esse tipo contém:

- `id`;
- `cpf`;
- `nome`;
- `sobrenome`;
- `email`.

A declaração está em [`userSchema.ts`](packages/shared/src/schemas/userSchema.ts#L47). O formulário acessa `novoUsuario.nome` e `novoUsuario.sobrenome` em [`Formulario.tsx`](apps/web/src/components/formulario/Formulario.tsx#L21).

O backend retorna somente uma mensagem em [`main.py`](apps/backend/src/backend/main.py#L34):

```json
{"Mensagem": "Usuário cadastrado com sucesso!"}
```

O método `inserir_usuario` também não retorna o usuário criado nem seu `id`, conforme [`conexao.py`](apps/backend/src/backend/banco_de_dados/conexao.py#L22).

Como consequência, a inserção acontece, mas `novoUsuario.nome` e `novoUsuario.sobrenome` ficam ausentes na resposta usada pelo alerta do formulário.

### 2. Implementar Read

Não existe comando `SELECT` ou método de consulta em [`conexao.py`](apps/backend/src/backend/banco_de_dados/conexao.py). Também não existe rota `GET` em [`main.py`](apps/backend/src/backend/main.py).

No web, [`userService.ts`](apps/web/src/components/formulario/service/userService.ts) contém apenas `createUser`, e [`main.tsx`](apps/web/src/main.tsx#L17) registra somente Home e Formulário.

Para a operação de leitura, ainda estão ausentes:

- consulta ao banco;
- rota de leitura no backend;
- serviço de leitura no web;
- apresentação dos usuários na interface.

Também não existe consulta individual de usuário.

### 3. Implementar Update

Não existe comando `UPDATE` em [`conexao.py`](apps/backend/src/backend/banco_de_dados/conexao.py), rota `PUT` ou `PATCH` em [`main.py`](apps/backend/src/backend/main.py), esquema de dados para atualização ou fluxo de edição no web.

Nenhum campo de usuário pode ser atualizado pelo sistema atual.

### 4. Implementar Delete

Não existe comando `DELETE` em [`conexao.py`](apps/backend/src/backend/banco_de_dados/conexao.py), rota `DELETE` em [`main.py`](apps/backend/src/backend/main.py), serviço de exclusão ou ação correspondente na interface.

Nenhum usuário pode ser excluído pelo sistema atual.

## O que existe e funciona

- O backend importa e registra sua rota normalmente.
- O web chama `http://127.0.0.1:8000/usuarios/`, que corresponde a `POST /usuarios/` no backend.
- A tabela `usuarios` é criada automaticamente.
- A dependência `get_gerenciador` abre e fecha a conexão usada pelo cadastro.
- A senha é transformada em hash bcrypt antes da inserção.
- O cadastro grava CPF, nome, sobrenome, e-mail e hash da senha no SQLite.
- O serviço web verifica `response.ok` e trata respostas HTTP sem sucesso como erro.

## Verificações realizadas

- Importação de `backend.main`: **passou**.
- Rotas de usuários encontradas: **somente `POST /usuarios/`**.
- Correspondência do caminho usado pelo web com a rota: **passou**.
- Cadastro direto com banco SQLite temporário: **passou**.
- Registro consultado diretamente no banco após o cadastro: **presente**.
- Resposta observada no cadastro: **somente `Mensagem`**.
- `pnpm --filter web exec tsc --noEmit -p tsconfig.app.json`: **passou**.
- `pnpm --filter web lint`: **passou**.
- Não foram encontrados arquivos de teste do CRUD no projeto.

Esta auditoria registra o estado atual. Nenhum arquivo da aplicação foi modificado.
