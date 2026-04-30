using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class ParcelaConfiguration : IEntityTypeConfiguration<Parcela>
{
    public void Configure(EntityTypeBuilder<Parcela> builder)
    {
        builder.ToTable("parcela");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Valor).HasPrecision(18, 2);

        builder.HasOne(p => p.Venda)
            .WithMany(v => v.Parcelas)
            .HasForeignKey(p => p.IdVenda)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.IdVenda).HasDatabaseName("ix_parcela_id_venda");
        builder.HasIndex(p => p.DataVencimento).HasDatabaseName("ix_parcela_data_vencimento");
    }
}
