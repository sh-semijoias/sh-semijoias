using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ShSemijoias.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedTiposPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "permite_parcelamento",
                table: "tipo_pagamento",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.InsertData(
                table: "tipo_pagamento",
                columns: new[] { "id", "ativo", "descricao", "permite_parcelamento" },
                values: new object[,]
                {
                    { 1, true, "Dinheiro", false },
                    { 2, true, "Pix", false },
                    { 3, true, "Cartão de crédito", true },
                    { 4, true, "Cartão de débito", false }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "tipo_pagamento", keyColumn: "id", keyValue: 1);
            migrationBuilder.DeleteData(table: "tipo_pagamento", keyColumn: "id", keyValue: 2);
            migrationBuilder.DeleteData(table: "tipo_pagamento", keyColumn: "id", keyValue: 3);
            migrationBuilder.DeleteData(table: "tipo_pagamento", keyColumn: "id", keyValue: 4);

            migrationBuilder.DropColumn(
                name: "permite_parcelamento",
                table: "tipo_pagamento");
        }
    }
}
