using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ShSemijoias.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CancelamentoVenda : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_venda_data_cancelamento",
                table: "venda");

            migrationBuilder.DropColumn(
                name: "data_cancelamento",
                table: "venda");

            migrationBuilder.CreateTable(
                name: "motivo_cancelamento_venda",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_motivo_cancelamento_venda", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cancelamento_venda",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_venda = table.Column<int>(type: "integer", nullable: false),
                    id_motivo_cancelamento_venda = table.Column<int>(type: "integer", nullable: false),
                    data_cancelamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cancelamento_venda", x => x.id);
                    table.ForeignKey(
                        name: "fk_cancelamento_venda_motivos_cancelamento_venda_id_motivo_can",
                        column: x => x.id_motivo_cancelamento_venda,
                        principalTable: "motivo_cancelamento_venda",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_cancelamento_venda_vendas_id_venda",
                        column: x => x.id_venda,
                        principalTable: "venda",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "motivo_cancelamento_venda",
                columns: ["id", "nome"],
                values: new object[,]
                {
                    { 1, "Desistência" },
                    { 2, "Erro no cadastro" },
                });

            migrationBuilder.CreateIndex(
                name: "ix_cancelamento_venda_id_motivo",
                table: "cancelamento_venda",
                column: "id_motivo_cancelamento_venda");

            migrationBuilder.CreateIndex(
                name: "ix_cancelamento_venda_id_venda",
                table: "cancelamento_venda",
                column: "id_venda",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cancelamento_venda");

            migrationBuilder.DeleteData(
                table: "motivo_cancelamento_venda",
                keyColumn: "id",
                keyValues: [1, 2]);

            migrationBuilder.DropTable(
                name: "motivo_cancelamento_venda");

            migrationBuilder.AddColumn<DateTime>(
                name: "data_cancelamento",
                table: "venda",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_venda_data_cancelamento",
                table: "venda",
                column: "data_cancelamento");
        }
    }
}
