# 🏗️ Constructo — Backend API

Backend da plataforma **Constructo**, desenvolvido com **FastAPI** assíncrono, gerenciado pelo ecossistema ultrarrápido **Astral uv** e totalmente conteinerizado com **Docker Multi-Stage** e **Docker Compose Watch**.

---

## 📋 Sumário
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Configuração de Ambiente (.env)](#-configuração-de-ambiente-env)
- [Como Rodar a Aplicação](#-como-rodar-a-aplicação)
  - [1. Modo Recomendado: Docker Compose Watch](#1-modo-recomendado-docker-compose-watch-hot-reload--auto-rebuild)
  - [2. Modo Compose Tradicional](#2-modo-compose-tradicional)
  - [3. Modo Standalone via Docker CLI](#3-modo-standalone-via-docker-cli)
- [Regras de Ouro do Desenvolvedor](#-regras-de-ouro-do-desenvolvedor)
- [Gestão de Dependências com UV](#-gestão-de-dependências-com-uv)
- [Depuração e Acesso Interativo (Bash)](#-depuração-e-acesso-interativo-bash)
- [Arquitetura Docker Multi-Stage](#-arquitetura-docker-multi-stage)

---

## 🚀 Stack Tecnológica

* **Linguagem & Runtime:** Python 3.12
* **Framework Web:** [FastAPI](https://fastapi.tiangolo.com/) com servidor ASGI [Uvicorn](https://www.uvicorn.org/)
* **Gerenciador de Pacotes & Build:** [Astral uv](https://docs.astral.sh/uv/) (gerenciamento determinístico com `uv.lock`)
* **Banco de Dados & ORM:** PostgreSQL 18, [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (assíncrono com `asyncpg`) e migrações com [Alembic](https://alembic.sqlalchemy.org/)
* **Autenticação e Criptografia:** `pwdlib` (Argon2) e `bcrypt`
* **Infraestrutura:** Docker (Multi-stage Build) e Docker Compose v2

---

## ⚙️ Pré-requisitos

* [Docker Engine](https://docs.docker.com/engine/install/) (v24.0+) e [Docker Compose](https://docs.docker.com/compose/) (v2.22+ com suporte a Compose Watch)
* *(Opcional - para rodar fora do Docker):* [uv](https://github.com/astral-sh/uv) instalado localmente.

---

## 📂 Estrutura de Diretórios

```text
apps/backend/
├── alembic/                    # Histórico e configuração das migrations
├── scripts/                    # Ferramentas operacionais e migração de dados
├── tests/                      # Testes do contrato HTTP
├── compose.yaml                # Backend + PostgreSQL com healthchecks e Watch
├── multistage.dockerfile       # Build multi-estágio e execução das migrations
├── .env.example                # Modelo das variáveis locais
├── pyproject.toml              # Dependências e configuração das ferramentas
├── uv.lock                     # Lockfile determinístico do uv
└── src/backend/
    ├── main.py                 # FastAPI, CORS, rotas e healthcheck
    ├── banco_de_dados/
    │   └── connections/        # Settings, engine e AsyncSession
    └── modulos/usuarios/
        ├── modelos.py          # Modelos SQLAlchemy
        ├── repositorio.py      # Consultas assíncronas
        ├── esquemas.py         # Contratos Pydantic
        ├── rotas.py            # Endpoints
        └── senhas.py           # Hash e verificação de senha
```

---

## 🔐 Configuração de Ambiente (`.env`)

Crie ou verifique o arquivo `.env` na raiz de `apps/backend/`. As variáveis configuradas são:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=constructo
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Opcional: substitui as cinco variáveis acima quando definida.
# URL_POSTGRES=postgresql+asyncpg://postgres:change_me@db:5432/constructo
```

> **Atenção:** copie `.env.example` para `.env` antes da primeira execução. O arquivo `.env` não é versionado nem incluído na imagem; o Compose injeta seus valores em tempo de execução. Use `db` como host dentro do Compose e `localhost` ao executar o backend diretamente no host.

---

## 🏃 Como Rodar a Aplicação

### 1. Modo Recomendado: Docker Compose Watch (Hot-Reload & Auto-Rebuild)

O Compose Watch sincroniza alterações de código do seu computador diretamente para o container em tempo real, sem a lentidão de reconstruir a imagem:

```bash
docker compose up --watch
```

**Como funciona o Watch:**
* ⚡ **Alterou arquivos Python (`.py`):** O Compose sincroniza os arquivos para `/app` no container e reinicia o servidor Uvicorn instantaneamente (`sync+restart`).
* 📦 **Alterou dependências (`uv.lock`):** Ao instalar pacotes novos, o Compose detecta e reconstrói a imagem automaticamente em segundo plano (`rebuild`).

Para parar a execução:
```bash
docker compose down
```

---

### 2. Modo Compose Tradicional

Caso prefira rodar os containers em segundo plano (modo detached):

```bash
# Subir os serviços (backend e db) em segundo plano
docker compose up -d

# Visualizar logs em tempo real
docker compose logs -f backend

# Para forçar reconstrução da imagem
docker compose up -d --build

# Parar os serviços
docker compose down

# Parar e resetar os dados do banco (remove o volume persistente pgdata)
docker compose down -v
```

A API estará acessível em:
* Documentação interativa (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
* Documentação alternativa (Redoc): [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 3. Modo Standalone via Docker CLI

Se você precisar testar a imagem do backend de forma isolada sem o Docker Compose:

#### Passo 1: Construir a Imagem
```bash
docker build -f multistage.dockerfile -t dockerconstructo:latest .
```

#### Passo 2: Executar o Container Temporário
```bash
docker run --rm -it -p 8000:8000 --env-file .env dockerconstructo:latest
```

---

## 💡 Regras de Ouro do Desenvolvedor

Anotações essenciais registradas pela equipe técnica em `comandos_de_gerenciamento.md`:

1. **Sempre use `--rm` em testes manuais:**
   > *"Sempre use `--rm` enquanto o container ainda não for a versão final."*  
   A flag `--rm` garante que o container temporário seja automaticamente destruído ao ser encerrado, evitando que containers parados consumam espaço em disco.

2. **Determinismo obrigatório com `uv lock` e `uv sync`:**
   > *"Ao alterar o arquivo `pyproject.toml`, faça `uv lock` e após isso `uv sync --locked` obrigatoriamente."*  
   O `multistage.dockerfile` utiliza `--mount=type=bind,source=uv.lock` no cache de build. Se o `uv.lock` não refletir com exatidão o `pyproject.toml`, o build ou a paridade do ambiente falhará.

3. **Rebuilds necessários fora do Compose Watch:**  
   Se você estiver rodando via `docker run` direto (sem `--watch`), qualquer alteração no código exige que a imagem seja construída novamente antes de subir o container:
   ```bash
   docker build -f multistage.dockerfile -t dockerconstructo:latest .
   ```

---

## 📦 Gestão de Dependências com UV

O projeto utiliza o **uv** para gerenciar o ciclo de vida dos pacotes Python com velocidade extrema.

### Adicionar uma nova dependência
```bash
# Adiciona ao pyproject.toml e atualiza o uv.lock automaticamente
uv add <nome-do-pacote>
```

### Adicionar dependência apenas de desenvolvimento
```bash
uv add --dev pytest httpx ruff
```

### Atualizar o lockfile e sincronizar ambiente local
```bash
# 1. Trava as dependências resolvendo a árvore de versões
uv lock

# 2. Sincroniza a virtualenv (.venv) estritamente com o lockfile
uv sync --locked
```

---

## 🔍 Depuração e Acesso Interativo (Bash)

Caso precise inspecionar o sistema operacional Debian dentro do container, analisar permissões ou testar comandos do sistema:

```bash
# Acessa o shell bash dentro da imagem
docker run --rm -it dockerconstructo:latest bash
```

Dentro do bash interativo:
* O interpretador Python gerenciado pelo uv está em `/python`.
* O código da aplicação e o ambiente virtual residem em `/app`.
* O usuário ativo é `python` (não-root, UID 1000).

---

## 🏛️ Arquitetura Docker Multi-Stage

O arquivo [`multistage.dockerfile`](multistage.dockerfile) adota uma arquitetura em 2 estágios para produzir uma imagem final leve, segura e com cache inteligente:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ESTÁGIO 1: builder (ghcr.io/astral-sh/uv:0.12.18-trixie-slim)          │
├────────────────────────────────────────────────────────────────────────┤
│ • Instala dependências de compilação C/C++ (build-essential).          │
│ • Baixa o Python 3.12 isolado em /python.                              │
│ • Cache Mount (/root/.cache/uv) + Bind Mount (uv.lock, pyproject.toml) │
│ • FASE 1: Instala dependências externas (--no-install-project).        │
│   (Alterações no código Python NÃO invalidam esse cache de libs!)      │
│ • FASE 2: Copia o código-fonte e instala o pacote local via uv sync.   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Copia apenas /python e /app
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ESTÁGIO 2: development / runtime (debian:trixie-slim)                  │
├────────────────────────────────────────────────────────────────────────┤
│ • Imagem limpa, sem compiladores gcc nem arquivos temporários.         │
│ • Cria usuário de sistema não-root 'python' (UID/GID 1000).            │
│ • Transfere artefatos com permissões corretas (--chown=python:python). │
│ • Variável PATH pré-configurada para /app/.venv/bin.                   │
│ • Segurança: Executa como 'USER python' (sem privilégios de root).     │
│ • CMD: uvicorn --host 0.0.0.0 --port 8000 backend.main:app            │
└────────────────────────────────────────────────────────────────────────┘
```

### Principais Benefícios:
* **Cache em Duas Fases:** Suas alterações de código não forçam o Docker a baixar novamente nenhuma biblioteca externa.
* **Segurança:** A imagem de produção não roda como `root`, mitigando vulnerabilidades de *container breakout*.
* **Tamanho Reduzido:** Todo o ferramental de compilação (`gcc`, `make`, caches do `apt`) é descartado no estágio `builder`.


## 🗃️ Banco de dados e migrations

O PostgreSQL é a única persistência usada pela API. O container do backend executa
`alembic upgrade head` antes de iniciar o Uvicorn, portanto um banco vazio recebe o
schema automaticamente.

Comandos manuais, executados em `apps/backend/`:

```bash
# Aplicar todas as migrations
uv run alembic upgrade head

# Criar uma migration depois de alterar os modelos
uv run alembic revision --autogenerate -m "descricao da alteracao"

# Verificar a revision aplicada
uv run alembic current
```

Os modelos ficam em `src/backend/modulos/<modulo>/modelos.py`, os repositórios
assíncronos no mesmo módulo e a sessão compartilhada em
`src/backend/banco_de_dados/connections/`.

### Migrar o SQLite legado

Depois de subir o PostgreSQL e aplicar o Alembic, os dados existentes podem ser
copiados de forma idempotente:

```bash
uv run python scripts/migrar_sqlite_para_postgres.py --sqlite constructo.db
```

Usuários já presentes no PostgreSQL são identificados pelo e-mail e não são
duplicados. Os hashes de senha são preservados. Sessões legadas recebem validade de
sete dias a partir da migração.

## ✅ Testes e qualidade

```bash
uv run pytest
uv run ruff check src tests scripts
```
