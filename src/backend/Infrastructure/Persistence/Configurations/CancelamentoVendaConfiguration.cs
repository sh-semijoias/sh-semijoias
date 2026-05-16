using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class CancelamentoVendaConfiguration : IEntityTypeConfiguration<CancelamentoVenda>
{
    public void Configure(EntityTypeBuilder<CancelamentoVenda> builder)
    {
        builder.ToTable("cancelamento_venda");
        builder.HasKey(c => c.Id);

        builder.HasOne(c => c.Venda)
            .WithOne(v => v.Cancelamento)
            .HasForeignKey<CancelamentoVenda>(c => c.IdVenda)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.MotivoCancelamentoVenda)
            .WithMany()
            .HasForeignKey(c => c.IdMotivoCancelamentoVenda)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.IdVenda).IsUnique().HasDatabaseName("ix_cancelamento_venda_id_venda");
        builder.HasIndex(c => c.IdMotivoCancelamentoVenda).HasDatabaseName("ix_cancelamento_venda_id_motivo");
    }
}
