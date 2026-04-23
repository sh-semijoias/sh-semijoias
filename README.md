# SH Semijoias

Sistema de gestão para loja de semi-joias.

## Tecnologias

| Camada | Stack |
|---|---|
| Backend | ASP.NET Core 10, EF Core, ASP.NET Core Identity |
| Frontend | Angular 21, Angular Material, Tailwind CSS 4 |
| Banco de dados | PostgreSQL 17 |
| Infraestrutura | Docker |

## Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [VS Code](https://code.visualstudio.com/) — ao abrir o workspace, aceite a notificação de **"Install Recommended Extensions"** para instalar as extensões necessárias (C# Dev Kit, Angular Language Service, Docker, Prettier)

## Rodando o projeto

### Via VS Code (recomendado)

Na primeira execução, instale as dependências do frontend:

```bash
cd src/frontend
npm install
```

Depois pressione `F5` e selecione **"Start all"**. Isso irá:

1. Subir o container do PostgreSQL
2. Compilar e iniciar o backend (migrations e seed executam automaticamente)
3. Iniciar o frontend

| Serviço | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:5224 |
| Documentação da API (Scalar) | http://localhost:5224/scalar/v1 |

### Manualmente

```bash
# 1. Banco de dados
docker compose up -d

# 2. Backend (em outro terminal)
cd src/backend
dotnet run --project Api

# 3. Frontend (em outro terminal)
cd src/frontend
npm install
npm start
```

## Estrutura do repositório

```
src/
├── backend/    # ASP.NET Core Web API (Clean Architecture)
└── frontend/   # Angular SPA
docker-compose.yml
```

Para detalhes de cada projeto, consulte os READMEs específicos:

- [src/backend/README.md](src/backend/README.md)
- [src/frontend/README.md](src/frontend/README.md)

## Credenciais padrão

O sistema cria automaticamente um usuário administrador na primeira execução:

| Campo | Valor |
|---|---|
| E-mail | admin@shsemijoias.com.br |
| Senha | Admin@12345 |
