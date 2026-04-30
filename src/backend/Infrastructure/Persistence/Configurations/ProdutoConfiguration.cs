using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class ProdutoConfiguration : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("produto");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Descricao).IsRequired().HasMaxLength(200);
        builder.Property(p => p.PrecoCompra).HasPrecision(18, 2);
        builder.Property(p => p.PrecoVendaSugerido).HasPrecision(18, 2);

        builder.HasOne(p => p.TipoProduto)
            .WithMany(t => t.Produtos)
            .HasForeignKey(p => p.IdTipoProduto)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.IdTipoProduto).HasDatabaseName("ix_produto_id_tipo_produto");
    }
}
