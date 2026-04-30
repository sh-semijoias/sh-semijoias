using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class TipoProdutoConfiguration : IEntityTypeConfiguration<TipoProduto>
{
    public void Configure(EntityTypeBuilder<TipoProduto> builder)
    {
        builder.ToTable("tipo_produto");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Descricao).IsRequired().HasMaxLength(100);
    }
}
