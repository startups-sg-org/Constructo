# Ambiente de Desenvolvimento Python com Docker e UV

> Notas organizadas a partir da transcrição do vídeo sobre como montar um ambiente de desenvolvimento Python usando Docker, UV, multi-stage builds e Docker Compose — do zero até (quase) pronto para produção.

---

## Índice

1. [Introdução](#1-introdução)
2. [Criando o projeto (pyproject.toml e FastAPI)](#2-criando-o-projeto-pyprojecttoml-e-fastapi)
3. [Estrutura de pastas do projeto](#3-estrutura-de-pastas-do-projeto)
4. [.dockerignore e .gitignore](#4-dockerignore-e-gitignore)
5. [O que é Docker e qual seu propósito](#5-o-que-é-docker-e-qual-seu-propósito)
6. [Criando o Dockerfile do zero](#6-criando-o-dockerfile-do-zero)
7. [Multi-stage build](#7-multi-stage-build)
8. [Comandos básicos do Docker](#8-comandos-básicos-do-docker)
9. [Primeiro build e camadas (layers)](#9-primeiro-build-e-camadas-layers)
10. [ENV — variáveis de ambiente](#10-env--variáveis-de-ambiente)
11. [WORKDIR](#11-workdir)
12. [Cache mount](#12-cache-mount)
13. [Bind mounts temporários](#13-bind-mounts-temporários)
14. [COPY do código para o container](#14-copy-do-código-para-o-container)
15. [Stage 2: finalizando a imagem](#15-stage-2-finalizando-a-imagem)
16. [Segurança: usuário não-root](#16-segurança-usuário-não-root)
17. [PATH e binários](#17-path-e-binários)
18. [ENTRYPOINT vs CMD](#18-entrypoint-vs-cmd)
19. [Uvicorn, FastAPI e mapeamento de portas](#19-uvicorn-fastapi-e-mapeamento-de-portas)
20. [Integrando PostgreSQL](#20-integrando-postgresql)
21. [Docker Compose](#21-docker-compose)
22. [compose.yaml explicado](#22-composeyaml-explicado)
23. [Healthcheck e depends_on](#23-healthcheck-e-depends_on)
24. [Docker Compose Watch](#24-docker-compose-watch)
25. [Justfile (menção honrosa)](#25-justfile-menção-honrosa)
26. [Conclusão](#26-conclusão)

---

## 1. Introdução

O objetivo do vídeo é montar um ambiente de desenvolvimento Python completo usando **Docker**, deixando-o praticamente pronto para publicação em produção (VPS, VM, etc.), utilizando:

- Imagem **multi-stage** (com uma base "builder" que não precisa ser alterada)
- **UV** como gerenciador de pacotes/ambiente
- **PostgreSQL** como exemplo de banco de dados (opcional, apenas para demonstração)
- **Docker Compose** para orquestrar os serviços

Pré-requisito único: ter o **Docker** instalado ([docker.com](https://docker.com)). O autor usa o Docker Desktop, mas foca no uso via terminal.

A aplicação de exemplo é um simples "Hello World" em **FastAPI + UVicorn**.

---

## 2. Criando o projeto (pyproject.toml e FastAPI)

- Projeto criado do zero com `uv`, seguindo o mesmo padrão do vídeo "Ambiente Python 2025" do autor.
- Configurações no `pyproject.toml`:
  - Nome, versão, descrição do projeto
  - **Versão do Python** fixada (ex: `>= 3.14`) — importante para builds reprodutíveis no Docker (idealmente travar em uma versão exata em produção)
  - Dependências principais: `fastapi`, `uvicorn`
  - Dependências de dev adicionadas com `uv add --dev <pacote>`
  - Sistema de build: **Hatchling**
- `uv sync` cria o ambiente virtual (`.venv`) e o `uv.lock`.

---

## 3. Estrutura de pastas do projeto

```
projeto/
├── src/
│   └── docker_yt/
│       ├── __main__.py     # script "Hello World"
│       └── main.py         # aplicação FastAPI
├── .env/
│   └── .env                # variáveis de ambiente (ex: dados do Postgres)
├── pyproject.toml
├── uv.lock
├── README.md
├── .dockerignore
├── .gitignore
├── .gitattributes
├── Dockerfile
├── compose.yaml
└── justfile
```

**Aplicação FastAPI de exemplo:**

```python
from datetime import datetime

from fastapi import FastAPI

app = FastAPI()
counter = 0

@app.get("/")
def home():
    global counter
    counter += 1
    return {"message": "Hello World", "data": datetime.now(), "counter": counter}
```

Executando localmente:

```bash
uvicorn src.docker_yt.main:app --host 0.0.0.0 --port 8000
```

> **Por que `--host 0.0.0.0`?** Dentro de um container, `127.0.0.1` aponta para o próprio container. Usar `0.0.0.0` expõe a aplicação para fora dele.

---

## 4. .dockerignore e .gitignore

Arquivos importantes para manter a imagem **enxuta** e o repositório limpo.

**O que ignorar (Docker):**
- `.venv` (ambiente virtual local)
- pasta `data/` (base de dados)
- `Dockerfile`, `compose*`
- `.python-version`
- arquivos de cache (`__pycache__`, `.pytest_cache`, etc.)

**.gitignore:** as mesmas coisas do `.dockerignore`, mais:
- arquivos do sistema (ex: `.DS_Store` no Mac)
- arquivos locais/pessoais

**.gitattributes:** garante que o *line ending* (final de linha) seja consistente entre desenvolvedores — importante porque o container roda Linux, que é sensível a `CRLF` vs `LF`.

---

## 5. O que é Docker e qual seu propósito

**Problema sem Docker:**
Em um fluxo comum (computador local → CI/CD → servidor), cada ambiente tem seu próprio hardware, sistema operacional e bibliotecas instaladas. Isso causa o clássico "funciona na minha máquina, mas quebra no servidor".

**O que o Docker resolve:**
Ele roda como um **processo isolado** dentro do computador (não é uma máquina virtual completa), com seu próprio "Linux" leve dentro, mas **compartilhando os recursos** do host — por isso é muito mais leve e rápido que uma VM tradicional.

Vantagem: a **mesma imagem** Docker pode rodar no computador do desenvolvedor, no CI e no servidor de produção. Se funcionar em um lugar, funciona em todos, porque o ambiente é idêntico.

**Conceito de camadas (layers):**
Uma imagem Docker é composta por camadas empilhadas. Exemplo: a imagem oficial do PostgreSQL é construída sobre a imagem do Debian. Cada `FROM` no Dockerfile cria um novo **stage** (estágio) da imagem.

**Estratégia comum:**
- Uma imagem **base**, com o mínimo necessário para o projeto subir
- Camadas adicionais para desenvolvimento, produção e CI, cada uma usando apenas o que é necessário (ex: `pytest` só em dev, nunca em produção)

---

## 6. Criando o Dockerfile do zero

Fontes de referência recomendadas:
- Documentação da [Astral (UV)](https://docs.astral.sh) — seção de Docker
- Documentação oficial do [Docker](https://docs.docker.com)

O projeto usa como base a imagem oficial do UV, que já vem com Python + Debian Slim:

```dockerfile
FROM ghcr.io/astral-sh/uv:0.8 AS builder
```

- **Debian Slim**: versão reduzida do Debian (~300 MB vs. +1 GB da versão completa), pois remove pacotes desnecessários.
- Toda vez que aparece `FROM` no Dockerfile, um novo **stage** é criado.
- É possível conferir a versão mais recente do UV com:

```bash
uv self update
uv version
```

---

## 7. Multi-stage build

Ideia central: ter uma imagem **base** (stage `builder`) onde o projeto é montado, instalado e preparado — e depois **copiar apenas o necessário** para uma imagem final, menor e sem ferramentas de build desnecessárias (como o próprio UV).

Vantagens:
- Imagem final mais enxuta
- Separação clara entre "montar o ambiente" e "rodar a aplicação"
- Cache de camadas reaproveitado entre builds

> Recomendação do autor: evite criar dezenas de stages. Normalmente **2 stages** (às vezes um terceiro) já são suficientes.

---

## 8. Comandos básicos do Docker

| Comando | Função |
|---|---|
| `docker ps` / `docker container ps` | lista containers **rodando** |
| `docker ps -a` | lista **todos** os containers (inclusive parados) |
| `docker start <nome/id>` | inicia um container existente |
| `docker stop <nome/id>` | para um container |
| `docker rm <nome/id>` | remove um container |
| `docker image ls` | lista imagens |
| `docker image rm <id>` | remove uma imagem |
| `docker build -f Dockerfile -t <tag> .` | constrói uma imagem |
| `docker run -it --rm <imagem> bash` | cria/roda um container interativo e o remove ao sair |
| `docker exec` | executa comando em um container **já rodando** |
| `docker system prune` | limpa cache/imagens não usadas |
| `<comando> --help` | ajuda de qualquer subcomando |

**Anatomia do `docker build`:**

```bash
docker build -f Dockerfile -t astral/docker_yt:latest .
```

- `-f` → caminho do Dockerfile
- `-t` → nome/tag da imagem (`registry/repositório:tag`)
- `.` → **contexto** de build (pasta onde o Docker vai procurar os arquivos)

**Anatomia do `docker run`:**

```bash
docker run --rm -it docker_yt bash
```

- `--rm` → apaga o container automaticamente ao sair
- `-it` → modo interativo com terminal (TTY)
- tudo **antes** do nome da imagem é opção do Docker; tudo **depois** é comando executado dentro do container

---

## 9. Primeiro build e camadas (layers)

- Cada instrução do Dockerfile (geralmente as em maiúsculas: `FROM`, `RUN`, `COPY`, etc.) gera uma **camada (layer)** na imagem, que pode ser cacheada.
- Se uma camada não muda, o Docker **reaproveita o cache**, tornando o rebuild extremamente rápido (de dezenas de segundos para milissegundos).
- Se algo mudar em uma camada, o Docker invalida o cache **dela em diante** — por isso a ordem das instruções importa: coloque o que muda menos (instalação de dependências) **antes** do que muda mais (código-fonte).

**Dica de limpeza:**

```bash
docker image rm $(docker image ls -q)
docker rm $(docker ps -a -q)
```

---

## 10. ENV — variáveis de ambiente

Trecho típico no Dockerfile:

```dockerfile
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_PREFERENCE=only-managed \
    UV_NO_DEV=1 \
    UV_PYTHON_INSTALL_DIR=/python
```

| Variável | Efeito |
|---|---|
| `UV_COMPILE_BYTECODE` | força o UV a gerar o bytecode (`.pyc`) já no build, acelerando o startup da aplicação (em troca de uma imagem um pouco maior) |
| `UV_LINK_MODE=copy` | evita que o UV crie **links simbólicos** entre stages (o que quebraria ao copiar arquivos para outro stage) |
| `UV_PYTHON_PREFERENCE=only-managed` | força o UV a sempre usar a versão de Python que ele mesmo gerencia, nunca uma já existente no sistema |
| `UV_NO_DEV` | impede a instalação de dependências de desenvolvimento |
| `UV_PYTHON_INSTALL_DIR` | define onde o Python baixado pelo UV fica salvo, para poder ser copiado para o próximo stage |

> Diferença entre `ENV` e definir a variável só para um comando (`UV_NO_DEV=1 uv sync`): `ENV` é permanente na imagem; via prefixo de comando é temporário, válido só para aquela execução.

---

## 11. WORKDIR

```dockerfile
WORKDIR /app
```

Equivalente a um `cd` — define (e cria, se não existir) o diretório de trabalho dentro do container. Todos os comandos seguintes (`COPY`, `RUN`, etc.) passam a operar relativos a essa pasta.

---

## 12. Cache mount

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project
```

- Cria um **cache persistente entre builds** (não é parte do container final, nem do sistema de arquivos visível dentro dele).
- Evita que o UV precise rebaixar todas as dependências do zero a cada build — só baixa o que mudou.
- Acelera drasticamente builds subsequentes.

---

## 13. Bind mounts temporários

```dockerfile
RUN --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project
```

- `type=bind` "empresta" temporariamente um arquivo do host (`uv.lock`, `pyproject.toml`) para dentro do build, **sem copiá-lo permanentemente** para a imagem.
- Permite instalar as dependências **sem ainda ter o código-fonte** copiado — só o necessário (`uv.lock` + `pyproject.toml`).
- `--frozen`: usa exatamente o que está no `uv.lock` (dá erro se houver divergência com o `pyproject.toml`) — alternativa: `--locked`, que tenta corrigir divergências.
- `--no-install-project`: instala as dependências, mas **não** o projeto em si (ainda não há código-fonte no container nesse ponto).

**Por que isso é "genial" (nas palavras do autor):** como o `uv.lock` e o `pyproject.toml` são usados só via bind mount temporário, **alterações no código-fonte não invalidam o cache de dependências**. Só uma mudança real no lockfile/pyproject dispara reinstalação.

---

## 14. COPY do código para o container

```dockerfile
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen
```

- Copia todo o conteúdo da pasta atual para dentro de `/app` no container.
- **Cuidado:** por isso o `.dockerignore` é essencial — sem ele, pastas como `.venv` (gerada no host, ex: macOS) seriam copiadas para dentro de um container Linux, causando incompatibilidades.
- Como as dependências já foram instaladas no passo anterior (via bind mount), esse segundo `uv sync` é extremamente rápido (cache reaproveitado).

---

## 15. Stage 2: finalizando a imagem

```dockerfile
FROM python:3.13-slim-trixie AS development

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get upgrade -y
```

- Novo `FROM` → novo estágio, chamado `development`.
- Não usa mais a imagem do UV — usa uma imagem **Python oficial** enxuta (Debian Slim/Trixie), já que o UV não é necessário em produção.
- `PYTHONUNBUFFERED=1`: evita que a saída do Python fique em buffer, garantindo logs em tempo real (`stdout`/`stderr`).

---

## 16. Segurança: usuário não-root

```dockerfile
RUN useradd --create-home --shell /bin/bash python
```

- Boa prática: **não rodar a aplicação como `root`** dentro do container.
- Cria um usuário dedicado (`python`) com home própria.

**Copiando artefatos do stage `builder`:**

```dockerfile
COPY --from=builder --chown=python:python /python /python
COPY --from=builder --chown=python:python /app /app
```

- `COPY --from=<stage>`: copia arquivos gerados em outro estágio da build.
- `--chown`: ajusta o dono dos arquivos (por padrão viriam como `root`, já que até esse ponto tudo foi feito por ele) para o novo usuário `python`, que precisa de permissão sobre essa pasta.
- Copia: (1) o Python instalado pelo UV no stage anterior; (2) a pasta `/app` já com `.venv` e dependências prontas — **sem precisar reinstalar nada**.

```dockerfile
WORKDIR /app
```

---

## 17. PATH e binários

```dockerfile
ENV PATH="/app/.venv/bin:${PATH}"
```

- Garante que os executáveis do ambiente virtual (`python`, `uvicorn`, `fastapi`, etc.) sejam encontrados **primeiro** ao chamar comandos, sem precisar ativar o venv manualmente.
- Sem essa linha, comandos como `python` não seriam reconhecidos no container final (o Python "puro" do sistema pode nem estar no `PATH` esperado).

Depois disso, troca-se para o usuário não-root:

```dockerfile
USER python
```

---

## 18. ENTRYPOINT vs CMD

- **ENTRYPOINT**: comando "fixo" que sempre roda quando o container inicia.
- **CMD**: argumentos padrão (podem ser sobrescritos na hora de rodar o container).
- Abordagem usada no vídeo: deixar o `ENTRYPOINT` vazio/implícito e colocar tudo no `CMD`:

```dockerfile
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "8000", "src.docker_yt.main:app"]
```

Assim, basta rodar o container (sem precisar digitar o comando toda vez).

---

## 19. Uvicorn, FastAPI e mapeamento de portas

**Por que a aplicação não aparece no navegador mesmo rodando?**
Porque o container é um processo **isolado**: a porta 8000 "dentro" dele não é automaticamente a porta 8000 da máquina host. É preciso mapear:

```bash
docker run --rm -it -p 8000:8000 docker_yt
```

- `-p <porta_host>:<porta_container>` → redireciona chamadas na porta do host para a porta correspondente dentro do container.
- Padrão comum: usar a **mesma porta** dos dois lados (`8000:8000`) para evitar confusão.
- `--host 0.0.0.0` no Uvicorn expõe a aplicação para qualquer IP (necessário para o mapeamento funcionar de fora do container).

---

## 20. Integrando PostgreSQL

Ao invés de criar uma imagem própria (como fizemos para a aplicação), usa-se a **imagem oficial** do Postgres, disponível no Docker Hub.

**Persistência de dados:**
Containers são **efêmeros** — qualquer arquivo criado dentro deles some ao serem removidos. Para bancos de dados isso é inaceitável, então é preciso mapear um **volume** entre uma pasta do host e a pasta de dados do Postgres dentro do container (`PGDATA`).

**Variáveis de ambiente relevantes (arquivo `.env`):**

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=dbname
PGDATA=/var/lib/postgresql/data/pgdata
```

Essas variáveis criam o usuário, a senha e o banco de dados automaticamente na primeira subida do container.

---

## 21. Docker Compose

O **Docker Compose** é um **orquestrador de serviços**: permite subir múltiplos containers (aplicação + banco de dados, por exemplo), configurados em um único arquivo YAML.

Nomes de arquivo aceitos:
- `docker-compose.yaml` / `docker-compose.yml`
- `compose.yaml` / `compose.yml` *(usado no vídeo)*

Comandos principais:

```bash
docker compose up          # sobe os serviços (em primeiro plano)
docker compose up -d       # sobe em segundo plano (detached)
docker compose up --build  # força rebuild da imagem antes de subir
docker compose up --watch  # sobe com sincronização automática de mudanças
docker compose down        # para e remove os serviços
docker compose --env-file .env/.env up   # carrega variáveis de ambiente explicitamente
```

---

## 22. compose.yaml explicado

```yaml
services:
  docker_yt:
    pull_policy: never
    image: docker_yt
    container_name: docker_yt
    hostname: docker_yt
    restart: unless-stopped
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "8000:8000"
    env_file:
      - .env/.env
    depends_on:
      psql:
        condition: service_healthy
```

| Campo | Explicação |
|---|---|
| `pull_policy: never` | não tenta baixar a imagem da internet — precisa ser buildada localmente |
| `image` | nome da imagem a ser criada/usada |
| `container_name` / `hostname` | identificação do container |
| `restart: unless-stopped` | reinicia automaticamente em caso de falha, exceto se parado manualmente |
| `build.context` | pasta usada como contexto do build |
| `build.target` | qual **stage** do Dockerfile usar (ex: `builder`, `development`) |
| `ports` | mapeamento host:container |
| `env_file` | arquivo(s) de variáveis de ambiente a carregar |
| `depends_on` | dependência entre serviços (com condição de saúde, ver próxima seção) |

---

## 23. Healthcheck e depends_on

Para o serviço do Postgres:

```yaml
services:
  psql:
    image: postgres:17
    container_name: psql
    hostname: psql
    restart: unless-stopped
    env_file:
      - .env/.env
    volumes:
      - ./data:/var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
```

- `healthcheck`: define como o Docker verifica se o serviço está realmente pronto (não basta o container estar "up").
- `depends_on` com `condition: service_healthy`: garante que a aplicação só suba **depois** que o banco passar no healthcheck — evitando erros de conexão na inicialização.

---

## 24. Docker Compose Watch

Recurso moderno do Compose para sincronizar mudanças locais com o container **sem precisar de bind mount manual** nem rebuild completo a cada alteração:

```yaml
    develop:
      watch:
        - action: sync+restart
          path: .
          target: /app
          ignore:
            - .venv/
            - "**/__pycache__/"
        - action: rebuild
          path: ./uv.lock
```

| Ação | Quando é usada |
|---|---|
| `sync+restart` | sincroniza alterações de código e reinicia o serviço (ex: Uvicorn, que não recarrega sozinho) |
| `rebuild` | quando o `uv.lock` muda (nova dependência instalada), força rebuild completo da imagem |

Ativado com:

```bash
docker compose up --watch
```

---

## 25. Justfile (menção honrosa)

O projeto também inclui um **`justfile`**, um "kit de ferramentas" com atalhos para comandos frequentes (via [Just](https://just.systems)):

```bash
just             # lista as receitas disponíveis
just dc-up       # atalho para "docker compose up ..."
just dc-down     # atalho para "docker compose down"
just dc-up --watch   # argumentos extras são repassados ao comando
```

> O autor promete um vídeo dedicado só ao Justfile no futuro.

---

## 26. Conclusão

- A imagem construída ao longo do vídeo já está **~95–98% pronta para produção**; pequenos ajustes ainda seriam necessários (ex: trocar Uvicorn por algo como Gunicorn/Nginx em produção, remover ferramentas de desenvolvimento).
- Recomendação pedagógica do autor: **evitar copiar comandos direto de uma IA sem entender o erro** — resolver os problemas manualmente ajuda a fixar o aprendizado.
- Todo o código do projeto será disponibilizado em um repositório público (mesmo padrão do projeto "Ambiente Python 2025").
- Possível vídeo futuro: adaptação deste mesmo ambiente para **produção**.

---

### Resumo do Dockerfile completo (estrutura)

```dockerfile
# ---------- STAGE 1: builder ----------
FROM ghcr.io/astral-sh/uv:0.8 AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_PREFERENCE=only-managed \
    UV_NO_DEV=1 \
    UV_PYTHON_INSTALL_DIR=/python

RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN uv python install 3.13

WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

COPY . .

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

# ---------- STAGE 2: development ----------
FROM python:3.13-slim-trixie AS development

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get upgrade -y

RUN useradd --create-home --shell /bin/bash python

COPY --from=builder --chown=python:python /python /python
COPY --from=builder --chown=python:python /app /app

WORKDIR /app

ENV PATH="/app/.venv/bin:${PATH}"

USER python

CMD ["uvicorn", "--host", "0.0.0.0", "--port", "8000", "src.docker_yt.main:app"]
```

> ⚠️ Versões e nomes exatos (tags de imagem, versão do Python/UV) podem variar — confira sempre a versão mais recente na documentação oficial.
