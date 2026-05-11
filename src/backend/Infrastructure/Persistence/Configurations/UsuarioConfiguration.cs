using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuario");

        builder.Property(u => u.DataCadastro).IsRequired();
        builder.Property(u => u.DataAtualizacao).IsRequired();

        builder.HasMany(u => u.Perfis)
            .WithMany()
            .UsingEntity<IdentityUserRole<Guid>>(
                j => j.HasOne<Perfil>().WithMany().HasForeignKey(ur => ur.RoleId).IsRequired(),
                j => j.HasOne<Usuario>().WithMany().HasForeignKey(ur => ur.UserId).IsRequired()
            );
    }
}
