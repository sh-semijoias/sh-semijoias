using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IEstoqueRepository
{
    Task<(IList<Estoque> Items, int Total)> ListarAsync(ListarEstoqueConsulta query);
    Task<Estoque?> BuscarPorIdAsync(int id);
    Task<Estoque?> BuscarPorProdutoAsync(int idProduto, int? idMaleta = null);
    Task<Dictionary<int, Estoque>> BuscarPorProdutosAsync(IList<int> idsProdutos, int? idMaleta = null);
    Task<Dictionary<int, Estoque>> BuscarPorIdsAsync(IList<int> ids, int? idMaleta = null);
    Task AdicionarAsync(Estoque estoque);
    Task RemoverAsync(Estoque estoque);
    Task SalvarAsync();
    Task<(IList<Estoque> Items, int Total)> ListarProdutosAsync(ListarProdutosConsulta consulta);
}
