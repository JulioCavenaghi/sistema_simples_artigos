# README — Instruções para executar o projeto

Este documento mostra o mínimo necessário para executar o projeto em ambiente de desenvolvimento usando Docker.

## Pré-requisitos

* Docker instalado
* Docker Compose (ou `docker compose` integrado ao Docker)

## Passos

1. Na raiz do projeto, crie um arquivo chamado `.env` com o conteúdo abaixo e substitua os valores `your_*` pelos valores reais do seu ambiente:

```env
NODE_ENV=development
CHOKIDAR_USEPOLLING=true
CHOKIDAR_INTERVAL=1000
WATCHPACK_POLLING=true
DATABASE_URL=your_data_base
JWT_ACCESS_SECRET=your_jwt_acess
JWT_REFRESH_SECRET=your_jwt_refresh
ACCESS_TOKEN_EXPIRES_IN=900s
REFRESH_TOKEN_EXPIRES_IN=30d

POSTGRES_DB=sistema-simples-de-artigos
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_pass
```

> **Observação:** `DATABASE_URL` deve apontar para sua base de dados (por exemplo uma URL do Postgres). Se você estiver usando o serviço Postgres definido no `docker-compose.yml`, ajuste `DATABASE_URL` conforme a string de conexão necessária para o container (ex.: `postgresql://your_user:your_pass@<nome_do_servico_db>:5432/sistema-simples-de-artigos`).

2. Execute o Docker Compose na raiz do projeto:

```bash
 docker-compose up --build
```

3. Para parar e remover os containers (quando não precisar mais):

```bash
docker compose down -v
```