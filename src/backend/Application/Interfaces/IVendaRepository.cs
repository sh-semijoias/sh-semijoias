using Microsoft.EntityFrameworkCore.Storage;
using ShSemijoias.Application.DTOs.Vendas;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IVendaRepository
{
    Task<(IList<VisaoVenda> Items, int Total, decimal TotalVendasPeriodo)> ListarAsync(ListarVendasConsulta query);
    Task<IReadOnlyList<TipoPagamento>> ListarFormasPagamentoAtivasAsync();
    Task<TipoPagamento?> ObterTipoPagamentoAsync(int idTipoPagamento);
    Task<Venda> CriarAsync(Venda venda);
    Task SalvarAsync();
    Task<IDbContextTransaction> BeginTransacaoAsync();
}
