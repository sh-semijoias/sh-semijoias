using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShSemijoias.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RecebimentoParcela1Para1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_recebimento_parcela_id_parcela",
                table: "recebimento_parcela");

            migrationBuilder.CreateIndex(
                name: "ix_recebimento_parcela_id_parcela",
                table: "recebimento_parcela",
                column: "id_parcela",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_recebimento_parcela_id_parcela",
                table: "recebimento_parcela");

            migrationBuilder.CreateIndex(
                name: "ix_recebimento_parcela_id_parcela",
                table: "recebimento_parcela",
                column: "id_parcela");
        }
    }
}
