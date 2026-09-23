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
├── compose.yaml                # Orquestração dos serviços (backend + postgres) com Watch
├── multistage.dockerfile       # Dockerfile multi-estágio otimizado (builder + runtime seguro)
├── .dockerignore               # Filtro de arquivos ignorados no contexto de build
├── .env                        # Variáveis de ambiente locais
├── pyproject.toml              # Metadados do projeto e dependências (PEP 621)
├── uv.lock                     # Lockfile determinístico gerado pelo uv
├── comandos_de_gerenciamento.md# Guia de comandos rápidos e anotações operacionais
├── README.md                   # Esta documentação
└── src/
    └── backend/                # Pacote principal da aplicação
        ├── main.py             # Instância do FastAPI, middlewares (CORS) e rotas
        ├── banco_de_dados/     # Conexões e sessões assíncronas do SQLAlchemy
        ├── esquemas/           # Modelos Pydantic (validação de I/O)
        ├── rotas/              # Endpoints da API
        └── seguranca/          # Hashing de senhas e utilitários criptográficos
```

---

## 🔐 Configuração de Ambiente (`.env`)

Crie ou verifique o arquivo `.env` na raiz de `apps/backend/`. As variáveis configuradas são:

```env
# URL de conexão assíncrona para o SQLAlchemy
URL_POSTGRES=postgresql+asyncpg://postgres:123456@db:5432/constructo

# Credenciais e parâmetros do PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_DB=constructo

# Host do banco:
# - Use 'db' para comunicação interna entre containers Docker
# - Use 'localhost' caso execute o backend fora do Docker
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Diretório interno de dados persistentes do PostgreSQL
PGDATA=/var/lib/postgresql/18/docker
```

> **Atenção:** O `.dockerignore` está configurado para **nunca** incluir o arquivo `.env` dentro da imagem Docker por motivos de segurança. No Compose, as variáveis são injetadas em tempo de execução via `env_file: .env`.

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
