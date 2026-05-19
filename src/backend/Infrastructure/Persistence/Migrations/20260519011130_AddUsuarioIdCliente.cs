using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShSemijoias.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuarioIdCliente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "usuario_id",
                table: "cliente",
                type: "uuid",
                nullable: true);

            // Backfill: vincula clientes já existentes ao usuário admin.
            // O id do admin é gerado em runtime, então buscamos pelo e-mail
            // normalizado (Identity grava normalized_email em maiúsculas).
            migrationBuilder.Sql("""
                UPDATE cliente
                SET usuario_id = (
                    SELECT id FROM usuario
                    WHERE normalized_email = 'ADMIN@SHSEMIJOIAS.COM.BR'
                    LIMIT 1
                )
                WHERE usuario_id IS NULL
                  AND EXISTS (
                    SELECT 1 FROM usuario
                    WHERE normalized_email = 'ADMIN@SHSEMIJOIAS.COM.BR'
                  );
                """);

            migrationBuilder.CreateIndex(
                name: "ix_cliente_usuario_id",
                table: "cliente",
                column: "usuario_id");

            migrationBuilder.AddForeignKey(
                name: "fk_cliente_asp_net_users_usuario_id",
                table: "cliente",
                column: "usuario_id",
                principalTable: "usuario",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_cliente_asp_net_users_usuario_id",
                table: "cliente");

            migrationBuilder.DropIndex(
                name: "ix_cliente_usuario_id",
                table: "cliente");

            migrationBuilder.DropColumn(
                name: "usuario_id",
                table: "cliente");
        }
    }
}
