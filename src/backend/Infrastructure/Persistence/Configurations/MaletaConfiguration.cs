using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class MaletaConfiguration : IEntityTypeConfiguration<Maleta>
{
    public void Configure(EntityTypeBuilder<Maleta> builder)
    {
        builder.ToTable("maleta");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Descricao).IsRequired().HasMaxLength(200);

        builder.HasOne(m => m.Usuario)
            .WithMany()
            .HasForeignKey(m => m.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => m.IdUsuario).HasDatabaseName("ix_maleta_id_usuario");
    }
}
