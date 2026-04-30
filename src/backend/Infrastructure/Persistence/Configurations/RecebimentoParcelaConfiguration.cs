using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class RecebimentoParcelaConfiguration : IEntityTypeConfiguration<RecebimentoParcela>
{
    public void Configure(EntityTypeBuilder<RecebimentoParcela> builder)
    {
        builder.ToTable("recebimento_parcela");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.ValorRecebido).HasPrecision(18, 2);

        builder.HasOne(r => r.Parcela)
            .WithMany(p => p.Recebimentos)
            .HasForeignKey(r => r.IdParcela)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.IdParcela).HasDatabaseName("ix_recebimento_parcela_id_parcela");
    }
}
