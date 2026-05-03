using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Estoque;

namespace ShSemijoias.Application.Interfaces;

public interface IEstoqueService
{
    Task<Result<ListaPaginada<EstoqueDto>>> ListarAsync(ListarEstoqueConsulta query);
}
