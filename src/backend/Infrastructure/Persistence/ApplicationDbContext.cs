using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<Usuario, Perfil, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<TipoProduto> TiposProduto => Set<TipoProduto>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Maleta> Maletas => Set<Maleta>();
    public DbSet<Estoque> Estoques => Set<Estoque>();
    public DbSet<TipoPagamento> TiposPagamento => Set<TipoPagamento>();
    public DbSet<MotivoCancelamentoVenda> MotivosCancelamentoVenda => Set<MotivoCancelamentoVenda>();
    public DbSet<CancelamentoVenda> CancelamentosVenda => Set<CancelamentoVenda>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Venda> Vendas => Set<Venda>();
    public DbSet<ItemVenda> ItensVenda => Set<ItemVenda>();
    public DbSet<Parcela> Parcelas => Set<Parcela>();
    public DbSet<RecebimentoParcela> RecebimentosParcela => Set<RecebimentoParcela>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Perfil>().ToTable("perfil");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("usuario_perfil");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("usuario_claim");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("usuario_login");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("perfil_claim");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("usuario_token");

        builder.Entity<Perfil>()
            .HasIndex(p => p.NormalizedName)
            .HasDatabaseName("ix_perfil_normalized_name")
            .IsUnique();

        builder.Entity<Usuario>()
            .HasIndex(u => u.NormalizedEmail)
            .HasDatabaseName("ix_usuario_normalized_email");

        builder.Entity<Usuario>()
            .HasIndex(u => u.NormalizedUserName)
            .HasDatabaseName("ix_usuario_normalized_user_name")
            .IsUnique();

        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
