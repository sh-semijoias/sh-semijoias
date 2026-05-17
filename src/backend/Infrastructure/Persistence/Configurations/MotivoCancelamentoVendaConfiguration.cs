using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class MotivoCancelamentoVendaConfiguration : IEntityTypeConfiguration<MotivoCancelamentoVenda>
{
    public void Configure(EntityTypeBuilder<MotivoCancelamentoVenda> builder)
    {
        builder.ToTable("motivo_cancelamento_venda");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Nome).HasMaxLength(100).IsRequired();
    }
}
