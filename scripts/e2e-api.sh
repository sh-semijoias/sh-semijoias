#!/usr/bin/env bash
# Sobe a API num banco próprio para os testes e2e, recriado a cada execução com o seed de dados de teste
set -euo pipefail
cd "$(dirname "$0")/.."

DB=sh_semijoias_e2e
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=$DB;Username=admin;Password=admin"

docker compose up -d --wait
docker exec sh-semijoias-db dropdb -U admin --if-exists --force "$DB"
docker exec sh-semijoias-db createdb -U admin "$DB"
dotnet build src/backend/Api
dotnet ef database update --no-build --project src/backend/Infrastructure --startup-project src/backend/Api --connection "$ConnectionStrings__DefaultConnection"
# Fora do Windows, o dotnet ef cria "bin\Debug" (barra invertida no nome), que o próximo build copiaria para dentro da saída
rm -rf 'src/backend/Api/bin\Debug'
docker exec -i sh-semijoias-db psql -U admin -d "$DB" -v ON_ERROR_STOP=1 -q < scripts/seed-dados-teste.sql

exec dotnet run --no-build --project src/backend/Api
