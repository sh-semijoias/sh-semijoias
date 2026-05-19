using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShSemijoias.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ClienteUsuarioObrigatorio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "usuario_id",
                table: "cliente",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "usuario_id",
                table: "cliente",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }
    }
}
