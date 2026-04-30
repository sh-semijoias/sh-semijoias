using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Persistence.Configurations;

public class VendaConfiguration : IEntityTypeConfiguration<Venda>
{
    public void Configure(EntityTypeBuilder<Venda> builder)
    {
        builder.ToTable("venda");

        builder.HasKey(v => v.Id);

        builder.HasOne(v => v.Cliente)
            .WithMany()
            .HasForeignKey(v => v.IdCliente)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Usuario)
            .WithMany()
            .HasForeignKey(v => v.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.TipoPagamento)
            .WithMany()
            .HasForeignKey(v => v.IdTipoPagamento)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(v => v.IdCliente).HasDatabaseName("ix_venda_id_cliente");
        builder.HasIndex(v => v.IdUsuario).HasDatabaseName("ix_venda_id_usuario");
        builder.HasIndex(v => v.IdTipoPagamento).HasDatabaseName("ix_venda_id_tipo_pagamento");
        builder.HasIndex(v => v.DataVenda).HasDatabaseName("ix_venda_data_venda");
        builder.HasIndex(v => v.DataCancelamento).HasDatabaseName("ix_venda_data_cancelamento");
    }
}
