using ShSemijoias.Application.DTOs.Estoque;

namespace ShSemijoias.Application.Interfaces;

public interface IEstoqueRepository
{
    Task<(IList<EstoqueDto> Items, int Total)> ListarAsync(ListarEstoqueConsulta query);
}
