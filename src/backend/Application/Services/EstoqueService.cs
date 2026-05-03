using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Application.Services;

public class EstoqueService(IEstoqueRepository estoqueRepository) : IEstoqueService
{
    public async Task<Result<ListaPaginada<EstoqueDto>>> ListarAsync(ListarEstoqueConsulta query)
    {
        var (items, total) = await estoqueRepository.ListarAsync(query);
        return Result<ListaPaginada<EstoqueDto>>.Ok(
            new ListaPaginada<EstoqueDto>(items, total, query.Pagina, query.TamanhoPagina));
    }
}
