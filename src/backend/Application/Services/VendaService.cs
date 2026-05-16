using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Vendas;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Application.Services;

public class VendaService(IVendaRepository vendaRepository) : IVendaService
{
    public async Task<Result<ListarVendasResultado>> ListarAsync(ListarVendasConsulta query)
    {
        var (items, total, totalVendasPeriodo) = await vendaRepository.ListarAsync(query);
        return Result<ListarVendasResultado>.Ok(
            new ListarVendasResultado(items, total, query.Pagina, query.TamanhoPagina, totalVendasPeriodo));
    }

    public async Task<Result<IReadOnlyList<FormaPagamentoDto>>> ListarFormasPagamentoAsync()
    {
        var formas = await vendaRepository.ListarFormasPagamentoAtivasAsync();
        var dtos = formas
            .Select(f => new FormaPagamentoDto(f.Id, f.Descricao, f.PermiteParcelamento))
            .ToList();
        return Result<IReadOnlyList<FormaPagamentoDto>>.Ok(dtos);
    }
}
