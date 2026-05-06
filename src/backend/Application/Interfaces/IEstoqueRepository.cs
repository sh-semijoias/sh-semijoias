using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IEstoqueRepository
{
    Task<(IList<Estoque> Items, int Total)> ListarAsync(ListarEstoqueConsulta query);
    Task<Estoque?> BuscarPorProdutoAsync(int idProduto);
    Task AdicionarAsync(Estoque estoque);
    Task SalvarAsync();
    Task<IList<Produto>> ListarProdutosAsync();
}
