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

        builder.HasData(
            new TipoProduto { Id = 1, Descricao = "Brinco", Ativo = true },
            new TipoProduto { Id = 2, Descricao = "Anel", Ativo = true },
            new TipoProduto { Id = 3, Descricao = "Gargantilha", Ativo = true },
            new TipoProduto { Id = 4, Descricao = "Pulseira", Ativo = true }
        );
    }
}
