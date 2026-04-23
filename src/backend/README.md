# Backend — SH Semijoias

> Parte do projeto [SH Semijoias](../../README.md).

API REST construída com ASP.NET Core 10, seguindo Clean Architecture.

## Tecnologias

- **ASP.NET Core 10** — Web API
- **Entity Framework Core 10** — ORM com Npgsql (PostgreSQL)
- **ASP.NET Core Identity** — autenticação e gerenciamento de usuários
- **Scalar** — documentação interativa da API

## Estrutura

```
ShSemijoias.slnx
├── Api/            → Camada de apresentação: controllers, Program.cs, extensões de startup
├── Application/    → Casos de uso e regras de negócio
├── Domain/         → Entidades e interfaces de domínio
└── Infrastructure/ → DbContext, migrations, seed
```

## Pré-requisito

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

## Rodando

> O banco de dados deve estar disponível em `localhost:5432`. Veja o README raiz para subir o Docker.

```bash
dotnet restore
dotnet run --project Api
```

Na inicialização, migrations são aplicadas e o usuário admin é criado automaticamente caso não existam.

A API fica disponível em `http://localhost:5224`.  
Documentação interativa: `http://localhost:5224/scalar/v1`.

## Migrations

```bash
# Criar uma nova migration
dotnet ef migrations add <NomeMigracao> --project Infrastructure --startup-project Api

# Aplicar manualmente (normalmente desnecessário)
dotnet ef database update --project Infrastructure --startup-project Api
```

## Banco de dados

| Parâmetro | Valor |
|---|---|
| Host | localhost:5432 |
| Banco | sh_semijoias_dev |
| Usuário | admin |
| Senha | admin |

As tabelas seguem nomenclatura em português (`Usuario`, `Perfil`, `UsuarioPerfil`, etc.), configuradas em `ApplicationDbContext.OnModelCreating`.

## Política de senhas (Identity)

Requisitos mínimos para senhas de usuários:

- 8 caracteres
- Letra maiúscula
- Letra minúscula
- Dígito numérico
- Caractere especial não obrigatório

## Pacotes NuGet

Versões gerenciadas centralmente em `Directory.Packages.props`. Não especificar versão nos `.csproj` individuais.
