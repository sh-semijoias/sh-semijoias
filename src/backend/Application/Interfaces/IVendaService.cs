using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Vendas;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IVendaService
{
    Task<Result<ListarVendasResultado>> ListarAsync(ListarVendasConsulta query);
    Task<Result<IReadOnlyList<FormaPagamentoDto>>> ListarFormasPagamentoAsync();
    Task<Result<VendaCriadaDto>> CriarAsync(CriarVendaDto dto, Guid idUsuario, bool isAdmin);
    Task<Result<bool>> CancelarAsync(int idVenda, CancelarVendaDto dto, Guid idUsuario, bool isAdmin);
    Task<Result<IReadOnlyList<MotivoCancelamentoDto>>> ListarMotivosCancelamentoAsync();
    Task<Result<IReadOnlyList<ParcelaVendaDto>>> ListarParcelasAsync(int idVenda, bool isAdmin);
    Task<Result<bool>> RegistrarPagamentoAsync(int idVenda, RegistrarPagamentoDto dto, bool isAdmin);
}
