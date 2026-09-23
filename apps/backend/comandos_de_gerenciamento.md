Claro. Eu organizaria separando **build**, **execução manual**, **uv**, **Docker Compose** e **testes**. Também corrigi alguns comandos que estavam incorretos e algumas observações que poderiam causar confusão.

````md
# Docker — Constructo

## 1. Build da imagem

### Criar a imagem Docker

```bash
docker build -f multistage.dockerfile . -t dockerconstructo:latest
````

Cria a imagem `dockerconstructo:latest` a partir do `multistage.dockerfile`.

> É necessário executar novamente o `docker build` quando houver alterações que precisem ser incorporadas à imagem, como:
>
> * `multistage.dockerfile`
> * dependências instaladas durante o build
> * arquivos copiados para a imagem
>
> Alterações apenas no código da aplicação podem não exigir um novo build quando estiver usando Docker Compose Watch.

---

# 2. Executar a imagem manualmente

### Criar um container temporário

```bash
docker run --rm -it dockerconstructo:latest
```

* `--rm` → remove o container automaticamente quando ele for encerrado.
* `-it` → permite interação com o terminal.

Durante o desenvolvimento, `--rm` é útil porque evita acumular vários containers temporários.

---

## 3. Entrar no Linux do container

```bash
docker run --rm -it dockerconstructo:latest bash
```

O `bash` faz com que o container seja iniciado diretamente em um terminal.

Dentro dele, podemos executar comandos do ambiente Linux da imagem.

Por exemplo:

```bash
apt install -y build-essential
```

O `build-essential` instala ferramentas comuns de compilação, como compilador C/C++ e `make`.

> Um container não é uma máquina virtual completa. Ele compartilha o kernel do sistema hospedeiro, mas possui seu próprio filesystem e ambiente de execução.

---

# 4. Gerenciamento das dependências com uv

## Alterou o `pyproject.toml`?

Execute:

```bash
uv lock
```

Isso atualiza o `uv.lock` de acordo com as dependências declaradas no `pyproject.toml`.

Depois:

```bash
uv sync --locked
```

O `--locked` exige que o `uv.lock` esteja sincronizado com o `pyproject.toml`.

### Fluxo recomendado

```bash
uv add <pacote>
uv lock
uv sync --locked
```

Se você editar manualmente o `pyproject.toml`:

```bash
uv lock
uv sync --locked
```

---

# 5. Executar o container manualmente com a porta 8000

```bash
docker run --rm -p 8000:8000 -it dockerconstructo:latest
```

O parâmetro:

```text
-p 8000:8000
```

faz o mapeamento:

```text
Computador → Container

localhost:8000 → container:8000
```

Assim, se o Uvicorn estiver rodando na porta `8000`, a aplicação poderá ser acessada em:

```text
http://localhost:8000
```

E a documentação do FastAPI:

```text
http://localhost:8000/docs
```

---

# 6. Docker Compose

O Docker Compose é a forma recomendada para executar o ambiente completo do Constructo.

Ele pode iniciar, por exemplo:

```text
backend
db
```

com rede, volumes, variáveis de ambiente e configurações já definidas no `compose.yaml`.

---

## Iniciar os containers

```bash
docker compose up
```

Inicia os serviços definidos no `compose.yaml`.

---

## Iniciar em segundo plano

```bash
docker compose up -d
```

O `-d` significa `detached`.

O terminal fica livre enquanto os containers continuam executando.

---

## Iniciar utilizando Docker Compose Watch

```bash
docker compose up --watch
```

O Docker Compose monitora alterações nos arquivos configurados em `develop.watch`.

Isso é especialmente útil durante o desenvolvimento, pois pode sincronizar alterações ou reconstruir o container conforme a configuração.

---

## Usar um arquivo `.env` específico

```bash
docker compose --env-file .env up -d
```

Inicia os serviços em segundo plano utilizando `.env` como arquivo de variáveis de ambiente.

---

## Parar os containers

```bash
docker compose down
```

Para e remove os containers criados pelo Compose.

---

# 7. Executar comandos dentro do container

## Abrir um Bash no backend

```bash
docker compose exec backend bash
```

Isso abre um terminal dentro do container `backend`.

A partir daí, podemos executar comandos normalmente, por exemplo:

```bash
python
```

ou:

```bash
pytest
```

ou:

```bash
uv sync
```

---

## Executar um comando sem entrar no Bash

Também podemos executar diretamente:

```bash
docker compose exec backend <comando>
```

Exemplo:

```bash
docker compose exec backend python --version
```

---

# 8. Testar a conexão com o PostgreSQL

O teste utiliza o container `backend` para acessar o container `db`.

```bash
docker compose exec backend python test_connection.py
```

Se aparecer:

```text
1
```

significa que o backend conseguiu:

```text
Backend
   ↓
SQLAlchemy
   ↓
asyncpg
   ↓
PostgreSQL
   ↓
SELECT 1
   ↓
1
```

---

# 9. Desenvolvimento diário

Com Docker Compose Watch configurado, o fluxo recomendado é:

```bash
docker compose up --watch
```

Depois, editar o código normalmente.

O Compose Watch pode detectar as alterações e sincronizar/reiniciar o serviço conforme definido no `compose.yaml`.

### Alterações que normalmente exigem rebuild

Se alterar:

```text
multistage.dockerfile
```

ou alguma etapa que instala dependências na imagem, faça:

```bash
docker compose build backend
```

e depois:

```bash
docker compose up
```

### Alterações no código

Se o `compose.yaml` estiver configurado com `develop.watch`, alterações no código podem ser sincronizadas automaticamente, sem precisar executar `docker build` a cada alteração.

---

# 10. Comandos principais — resumo

| Objetivo                    | Comando                                                              |
| --------------------------- | -------------------------------------------------------------------- |
| Build da imagem             | `docker build -f multistage.dockerfile . -t dockerconstructo:latest` |
| Rodar container temporário  | `docker run --rm -it dockerconstructo:latest`                        |
| Entrar no Bash do container | `docker run --rm -it dockerconstructo:latest bash`                   |
| Rodar com porta 8000        | `docker run --rm -p 8000:8000 -it dockerconstructo:latest`           |
| Subir Compose               | `docker compose up`                                                  |
| Subir em background         | `docker compose up -d`                                               |
| Subir com Watch             | `docker compose up --watch`                                          |
| Parar/remover ambiente      | `docker compose down`                                                |
| Entrar no backend           | `docker compose exec backend bash`                                   |
| Executar comando no backend | `docker compose exec backend <comando>`                              |
| Testar PostgreSQL           | `docker compose exec backend python test_connection.py`              |
| Atualizar lock              | `uv lock`                                                            |
| Sincronizar dependências    | `uv sync --locked`                                                   |

```

Uma correção importante em relação ao seu arquivo original: **não é necessário fazer `docker build` depois de qualquer alteração no código** se você estiver usando o `docker compose up --watch` que configuramos. O Watch existe justamente para evitar esse ciclo de `build → run` a cada mudança.
```
