using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class EstoqueConfiguration : IEntityTypeConfiguration<Estoque>
{
    public void Configure(EntityTypeBuilder<Estoque> builder)
    {
        builder.ToTable("estoque");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Produto)
            .WithMany()
            .HasForeignKey(e => e.IdProduto)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Maleta)
            .WithMany()
            .HasForeignKey(e => e.IdMaleta)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.IdProduto).HasDatabaseName("ix_estoque_id_produto");
        builder.HasIndex(e => e.IdMaleta).HasDatabaseName("ix_estoque_id_maleta");
        builder.HasIndex(e => new { e.IdProduto, e.IdMaleta }).IsUnique().HasDatabaseName("ix_estoque_id_produto_id_maleta");
    }
}
