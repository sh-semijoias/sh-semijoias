using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Vendas;

namespace ShSemijoias.Application.Interfaces;

public interface IVendaService
{
    Task<Result<ListarVendasResultado>> ListarAsync(ListarVendasConsulta query);
    Task<Result<IReadOnlyList<FormaPagamentoDto>>> ListarFormasPagamentoAsync();
}
