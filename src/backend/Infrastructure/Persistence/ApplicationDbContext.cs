using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<Usuario, Perfil, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Usuario>().ToTable("Usuarios");
        builder.Entity<Perfil>().ToTable("Perfis");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UsuarioPerfis");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UsuarioClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UsuarioLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("PerfilClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UsuarioTokens");
    }
}
