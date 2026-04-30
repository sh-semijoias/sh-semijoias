using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class TipoPagamentoConfiguration : IEntityTypeConfiguration<TipoPagamento>
{
    public void Configure(EntityTypeBuilder<TipoPagamento> builder)
    {
        builder.ToTable("tipo_pagamento");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Descricao).IsRequired().HasMaxLength(100);
    }
}
