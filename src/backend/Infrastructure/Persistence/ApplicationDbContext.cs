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

        builder.Entity<Usuario>().ToTable("Usuario");
        builder.Entity<Perfil>().ToTable("Perfil");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UsuarioPerfil");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UsuarioClaim");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UsuarioLogin");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("PerfilClaim");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UsuarioToken");
    }
}
