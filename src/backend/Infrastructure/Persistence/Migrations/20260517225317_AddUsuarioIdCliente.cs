using System;
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
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

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
                onDelete: ReferentialAction.Cascade);
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
