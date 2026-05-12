using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ShSemijoias.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedTiposProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "tipo_produto",
                columns: new[] { "id", "ativo", "descricao" },
                values: new object[,]
                {
                    { 1, true, "Brinco" },
                    { 2, true, "Anel" },
                    { 3, true, "Gargantilha" },
                    { 4, true, "Pulseira" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "tipo_produto",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "tipo_produto",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "tipo_produto",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "tipo_produto",
                keyColumn: "id",
                keyValue: 4);
        }
    }
}
