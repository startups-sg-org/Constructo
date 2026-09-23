-- docker build -f multistage.dockerfile . -t dockerconstructo:latest :: comando para "buildar" a imagem no docker, é necessario executálo toda vez que alterar a multistage.dockerfile

-- docker run --rm -it "nome_da_imagem" :: comando para criar o container da imagem do docker, porém de forma temporária ("-rm") :: Observação : sempre use esse comando enquanto o container ainda não for a versão final SEMPREE USE ESSE COMANDO.

-- docker run -rm -it "nome_da_imagem" :: a adicão do "bash" é para entrar no SO linux criado em multistage.dockerfile em FROM ghcr.io/astral-sh/uv:0.12.18-trixie-slim AS builder :: LITERALMENTE é um linux dentro da imagem ::: isso é muito bom para vercionameto de docker

-- dentro do bash do container, nós vamos criar as dependencias do projeto :: como :: o comando -- apt-install -y build-essential ( vai trazer várias coisa essenciais para programação )

-- Ao alterar o arquivo /pyproject.toml faça: uv lock :: Após isso, faça esse : uv sync --locked . Obrigatoriamente.


--docker run -rm -p "8000:8000" -it dockerconstructo:latest :: Comando para inicar o container mapeado pela porta 8000

--qualquer alteração no código é nessecário buildar a imagem novamente, e só apos isso , rodar o container.


--docker compose up
--docker compose -a
--docker compose -down

# COMANDO PARA RODAR A APLICAÇÃO A PARTIR DO CONTAINER
--doccker compose up
--docker compose up --watch
--docker compose --env-file '.env' up -d

# para testar a conexão com o banco:
-- docker compose exec backend python test_connection.py

# para executar comandos dentro do container gerado por docker compose:
-- docker compose exec backend bash