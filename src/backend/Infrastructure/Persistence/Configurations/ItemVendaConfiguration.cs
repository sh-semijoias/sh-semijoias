using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class ItemVendaConfiguration : IEntityTypeConfiguration<ItemVenda>
{
    public void Configure(EntityTypeBuilder<ItemVenda> builder)
    {
        builder.ToTable("item_venda");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.PrecoVendaReal).HasPrecision(18, 2);

        builder.HasOne(i => i.Venda)
            .WithMany(v => v.Itens)
            .HasForeignKey(i => i.IdVenda)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Estoque)
            .WithMany()
            .HasForeignKey(i => i.IdEstoque)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(i => i.IdVenda).HasDatabaseName("ix_item_venda_id_venda");
        builder.HasIndex(i => i.IdEstoque).HasDatabaseName("ix_item_venda_id_estoque");
    }
}
