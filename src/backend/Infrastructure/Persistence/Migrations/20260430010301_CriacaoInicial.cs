using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ShSemijoias.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CriacaoInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cliente",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    telefone = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    cpf = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    data_cadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cliente", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "perfil",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_perfil", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tipo_pagamento",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    descricao = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tipo_pagamento", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tipo_produto",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    descricao = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tipo_produto", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "usuario",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "text", nullable: false),
                    data_cadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalized_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    security_stamp = table.Column<string>(type: "text", nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true),
                    phone_number_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    two_factor_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    lockout_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    lockout_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    access_failed_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuario", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "perfil_claim",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_perfil_claim", x => x.id);
                    table.ForeignKey(
                        name: "fk_perfil_claim_perfil_role_id",
                        column: x => x.role_id,
                        principalTable: "perfil",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "produto",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_tipo_produto = table.Column<int>(type: "integer", nullable: false),
                    descricao = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    preco_compra = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    preco_venda_sugerido = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    data_cadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_produto", x => x.id);
                    table.ForeignKey(
                        name: "fk_produto_tipos_produto_id_tipo_produto",
                        column: x => x.id_tipo_produto,
                        principalTable: "tipo_produto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "maleta",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    descricao = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    data_cadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_maleta", x => x.id);
                    table.ForeignKey(
                        name: "fk_maleta_asp_net_users_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "usuario_claim",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuario_claim", x => x.id);
                    table.ForeignKey(
                        name: "fk_usuario_claim_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "usuario_login",
                columns: table => new
                {
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    provider_key = table.Column<string>(type: "text", nullable: false),
                    provider_display_name = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuario_login", x => new { x.login_provider, x.provider_key });
                    table.ForeignKey(
                        name: "fk_usuario_login_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "usuario_perfil",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuario_perfil", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "fk_usuario_perfil_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_usuario_perfil_perfil_role_id",
                        column: x => x.role_id,
                        principalTable: "perfil",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "usuario_token",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuario_token", x => new { x.user_id, x.login_provider, x.name });
                    table.ForeignKey(
                        name: "fk_usuario_token_asp_net_users_user_id",
                        column: x => x.user_id,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "venda",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cliente = table.Column<int>(type: "integer", nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    id_tipo_pagamento = table.Column<int>(type: "integer", nullable: false),
                    total_parcelas = table.Column<int>(type: "integer", nullable: false),
                    data_cancelamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    comentario = table.Column<string>(type: "text", nullable: true),
                    data_venda = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_venda", x => x.id);
                    table.ForeignKey(
                        name: "fk_venda_cliente_id_cliente",
                        column: x => x.id_cliente,
                        principalTable: "cliente",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_venda_tipo_pagamento_id_tipo_pagamento",
                        column: x => x.id_tipo_pagamento,
                        principalTable: "tipo_pagamento",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_venda_usuario_id_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "estoque",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_produto = table.Column<int>(type: "integer", nullable: false),
                    id_maleta = table.Column<int>(type: "integer", nullable: true),
                    quantidade = table.Column<int>(type: "integer", nullable: false),
                    data_atualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_estoque", x => x.id);
                    table.ForeignKey(
                        name: "fk_estoque_maletas_id_maleta",
                        column: x => x.id_maleta,
                        principalTable: "maleta",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_estoque_produtos_id_produto",
                        column: x => x.id_produto,
                        principalTable: "produto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "parcela",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_venda = table.Column<int>(type: "integer", nullable: false),
                    numero_parcela = table.Column<int>(type: "integer", nullable: false),
                    valor = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    data_vencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parcela", x => x.id);
                    table.ForeignKey(
                        name: "fk_parcela_vendas_id_venda",
                        column: x => x.id_venda,
                        principalTable: "venda",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "item_venda",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_venda = table.Column<int>(type: "integer", nullable: false),
                    id_estoque = table.Column<int>(type: "integer", nullable: false),
                    quantidade = table.Column<int>(type: "integer", nullable: false),
                    preco_venda_real = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_item_venda", x => x.id);
                    table.ForeignKey(
                        name: "fk_item_venda_estoque_id_estoque",
                        column: x => x.id_estoque,
                        principalTable: "estoque",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_item_venda_vendas_id_venda",
                        column: x => x.id_venda,
                        principalTable: "venda",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recebimento_parcela",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_parcela = table.Column<int>(type: "integer", nullable: false),
                    valor_recebido = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    data_recebimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_recebimento_parcela", x => x.id);
                    table.ForeignKey(
                        name: "fk_recebimento_parcela_parcela_id_parcela",
                        column: x => x.id_parcela,
                        principalTable: "parcela",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_cliente_cpf",
                table: "cliente",
                column: "cpf");

            migrationBuilder.CreateIndex(
                name: "ix_estoque_id_maleta",
                table: "estoque",
                column: "id_maleta");

            migrationBuilder.CreateIndex(
                name: "ix_estoque_id_produto",
                table: "estoque",
                column: "id_produto");

            migrationBuilder.CreateIndex(
                name: "ix_estoque_id_produto_id_maleta",
                table: "estoque",
                columns: new[] { "id_produto", "id_maleta" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_item_venda_id_estoque",
                table: "item_venda",
                column: "id_estoque");

            migrationBuilder.CreateIndex(
                name: "ix_item_venda_id_venda",
                table: "item_venda",
                column: "id_venda");

            migrationBuilder.CreateIndex(
                name: "ix_maleta_id_usuario",
                table: "maleta",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ix_parcela_data_vencimento",
                table: "parcela",
                column: "data_vencimento");

            migrationBuilder.CreateIndex(
                name: "ix_parcela_id_venda",
                table: "parcela",
                column: "id_venda");

            migrationBuilder.CreateIndex(
                name: "ix_perfil_normalized_name",
                table: "perfil",
                column: "normalized_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_perfil_claim_role_id",
                table: "perfil_claim",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_produto_id_tipo_produto",
                table: "produto",
                column: "id_tipo_produto");

            migrationBuilder.CreateIndex(
                name: "ix_recebimento_parcela_id_parcela",
                table: "recebimento_parcela",
                column: "id_parcela");

            migrationBuilder.CreateIndex(
                name: "ix_usuario_normalized_email",
                table: "usuario",
                column: "normalized_email");

            migrationBuilder.CreateIndex(
                name: "ix_usuario_normalized_user_name",
                table: "usuario",
                column: "normalized_user_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_usuario_claim_user_id",
                table: "usuario_claim",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_usuario_login_user_id",
                table: "usuario_login",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_usuario_perfil_role_id",
                table: "usuario_perfil",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_venda_data_cancelamento",
                table: "venda",
                column: "data_cancelamento");

            migrationBuilder.CreateIndex(
                name: "ix_venda_data_venda",
                table: "venda",
                column: "data_venda");

            migrationBuilder.CreateIndex(
                name: "ix_venda_id_cliente",
                table: "venda",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "ix_venda_id_tipo_pagamento",
                table: "venda",
                column: "id_tipo_pagamento");

            migrationBuilder.CreateIndex(
                name: "ix_venda_id_usuario",
                table: "venda",
                column: "id_usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "item_venda");

            migrationBuilder.DropTable(
                name: "perfil_claim");

            migrationBuilder.DropTable(
                name: "recebimento_parcela");

            migrationBuilder.DropTable(
                name: "usuario_claim");

            migrationBuilder.DropTable(
                name: "usuario_login");

            migrationBuilder.DropTable(
                name: "usuario_perfil");

            migrationBuilder.DropTable(
                name: "usuario_token");

            migrationBuilder.DropTable(
                name: "estoque");

            migrationBuilder.DropTable(
                name: "parcela");

            migrationBuilder.DropTable(
                name: "perfil");

            migrationBuilder.DropTable(
                name: "maleta");

            migrationBuilder.DropTable(
                name: "produto");

            migrationBuilder.DropTable(
                name: "venda");

            migrationBuilder.DropTable(
                name: "tipo_produto");

            migrationBuilder.DropTable(
                name: "cliente");

            migrationBuilder.DropTable(
                name: "tipo_pagamento");

            migrationBuilder.DropTable(
                name: "usuario");
        }
    }
}
