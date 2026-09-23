
###############################################################################################################

########## ESTÁGIO 1:

# Nossa imagem builder. Ela é a base para todas as outras imagens. Ela contém todas as dependências necessárias para construir o projeto.
FROM ghcr.io/astral-sh/uv:0.12.18-trixie-slim AS builder

# ---------------------------------------------------------------------------------------------- #
# AMBIENTE- gerar variáveis de ambiente para o build::

# UV_COMPILE_BYTECODE: Compila o bytecode do Python para melhorar a performance no cache da build.
ENV UV_COMPILE_BYTECODE=1
# UV_LINK_MODE: Define o modo de linkagem do UV. O modo "copy" copia os arquivos necessários para a imagem final, enquanto o modo "symlink" cria links simbólicos para os arquivos na imagem final.
ENV UV_LINK_MODE=copy
# UV_PYTHON_PREFERENCE: Define a preferência de instalação do Python. O valor "only-managed" indica que apenas pacotes gerenciados pelo UV serão instalados, evitando conflitos com pacotes do sistema.
ENV UV_PYTHON_PREFERENCE=only-managed
# UV_ON_DEV: Define se o ambiente é de desenvolvimento. O valor "1" indica que estamos em um ambiente de desenvolvimento, o que pode ativar recursos adicionais para facilitar o desenvolvimento e depuração.
ENV UV_ON_DEV=1
# UV_PYTHON_INSTALL_DIR: Define o diretório de instalação do Python dentro da imagem. O valor "/python" indica que o Python será instalado nesse diretório.
ENV UV_PYTHON_INSTALL_DIR=/python
# ---------------------------------------------------------------------------------------------- #

 # Instalação de dependências essenciais para a construção do projeto, incluindo compiladores e ferramentas de desenvolvimento.
 # apt-get clean e rm -rf /var/lib/apt/lists/* são comandos para limpar o cache do apt e remover listas de pacotes, economizando espaço na imagem final.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN uv python install 3.12

# criar pasta para a aplicação (projeto) e entrar nela.
WORKDIR /app

# linha copiada da própria documentação do uv: https://docs.astral.sh/uv/uv-dockerfile
# Pode ser que eu queira instalar uma nova dependencia. :: Esta pasta /app , manter ela em cache que pode ser reutilizavel em outras builds.
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project
 # genial :: por que? não existindo a pasta de cache em /root/.cache/uv, o uv vai criar a pasta e instalar as dependencias do projeto. Na próxima build, o uv vai reutilizar a pasta de cache e não vai precisar baixar as dependencias novamente.

 # COPY copia o projeto inteiro para dentro da pasta app no container. Isso inclui todos os arquivos e subdiretórios do projeto, permitindo que o uv tenha acesso a todo o código-fonte e recursos necessários para construir a aplicação.
COPY . /app
# Ou seja, eu posso alterar meu código que não vai invalidar o cache do uv, porque o uv vai olhar para o arquivo uv.lock e pyproject.toml e ver que não houve alterações nas dependencias do projeto. Então ele vai reutilizar a pasta de cache em /root/.cache/uv e não vai precisar baixar as dependencias novamente.
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked
##################################################################################################################
# STAGE 2 - ESTÁGIO FINAL:
## PARA DEIXAR A IMAGEM FINAL MAIS LEVE, VAMOS USAR UMA IMAGEM BASE MAIS LEVE, COMO ALPINE OU DEBIAN SLIM.
## OU SEJA, VAMOS UTILIZAR NESSE ESTÀGIO APENAS O "RESULTADO DO ESTÁGIO ANTERIOR"
FROM debian:trixie-slim AS development

ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1000 python \
    && useradd --uid 1000 --gid python --shell /bin/bash --create-home python

# VAI OLHAR NO ESTÀGIO ANTERIOR E COPIAR VIA CHOWN (CHANGE USER AND OWNER) PARA O USUÁRIO PYTHON, PARA QUE ELE TENHA ACESSO AOS ARQUIVOS E PASTAS NECESSÁRIAS PARA RODAR A APLICAÇÃO.
# CRIANDO A PASTA PYTHON PARA O USUÀRIO PYTHON, por que no estágio anterior foi definido que o UV seria instalado na pasta /python, então precisamos copiar essa pasta para o estágio final para que o usuário python tenha acesso a ela.
COPY --from=builder --chown=python:python /python /python

# Copiando a pasta app para estágio vai ser bom para não precisar refazer o estágio anterior.
COPY --from=builder --chown=python:python /app /app

# WORKDIR /app :: define o diretório de trabalho dentro do container. Isso significa que todos os comandos subsequentes serão executados a partir desse diretório. Além disso, ao definir o WORKDIR, você garante que o usuário python terá acesso a esse diretório e poderá executar a aplicação corretamente.
WORKDIR /app

# Definindo python e etc na variável de ambiente do sistema do container
ENV PATH="/app/.venv/bin:$PATH"

# AGORA vamos trocar o usuário root para o python (criado agora a pouco) - por que não é boa prática de segurança rodar aplicações como root. Isso ajuda a limitar os privilégios do processo da aplicação, reduzindo o risco de exploração de vulnerabilidades.
# ele só pode "mexer" na pasta /app.
USER python

# ENTRYPOINT :: PARA COMANDOS INICIAIS DA APLICAÇÃO.
ENTRYPOINT []

# COMANDO PARA RODAR O SERVIDOR UVICORN DO PROJEO
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn --host 0.0.0.0 --port 8000 backend.main:app"]

##################################################################################################################